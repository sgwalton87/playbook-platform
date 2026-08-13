import { NextRequest, NextResponse } from "next/server";
import {
  buildPlaybookEvent,
  convertEventToNotification,
  resolveRecipients,
} from "@/lib/event-notifications";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const requestedScholarId = String(body.scholarId || "");
    const actorRole = typeof body.actorRole === "string" ? body.actorRole : undefined;

    if (!requestedScholarId || String(body.type || "").trim().length === 0) {
      return NextResponse.json(
        { error: "Missing event type or scholarId." },
        { status: 400 }
      );
    }

    if (body.actorId && body.actorId !== user.id) {
      return NextResponse.json(
        { error: "Actor identity does not match authenticated user." },
        { status: 403 }
      );
    }

    const userIsScholar = requestedScholarId === user.id;

    if (!userIsScholar) {
      const { data: relationship, error: relationshipError } = await supabase
        .from("support_relationships")
        .select("id")
        .eq("scholar_id", requestedScholarId)
        .eq("supporter_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (relationshipError) {
        return NextResponse.json(
          { error: relationshipError.message },
          { status: 400 }
        );
      }

      if (!relationship) {
        return NextResponse.json(
          { error: "No relationship access to this scholar." },
          { status: 403 }
        );
      }
    }

    const event = buildPlaybookEvent({
      type: body.type,
      scholarId: requestedScholarId,
      actorId: user.id,
      actorRole,
      payload: body.payload || {},
    });

    const { data: savedEvent, error: eventError } = await supabase
      .from("playbook_events")
      .insert(event)
      .select()
      .single();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 400 });
    }

    const { data: relationships } = await supabase
      .from("support_relationships")
      .select("*")
      .eq("scholar_id", event.scholar_id);

    const recipients = resolveRecipients({
      scholarId: event.scholar_id,
      relationships: relationships || [],
      actorRole: event.actor_role,
    });

    const notifications = recipients
      .map((recipient) =>
        convertEventToNotification({
          eventId: savedEvent.id,
          event,
          recipientUserId: recipient.userId,
          recipientRole: recipient.role,
        })
      )
      .filter(
        (
          notification
        ): notification is NonNullable<typeof notification> =>
          notification !== null
      );

    if (notifications.length) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notificationError) {
        return NextResponse.json(
          { error: notificationError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      event: savedEvent,
      notificationsCreated: notifications.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to emit Playbook event." },
      { status: 500 }
    );
  }
}
