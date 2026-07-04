import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  buildPlaybookEvent,
  convertEventToNotification,
  resolveDemoRecipients,
} from "@/lib/event-notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event = buildPlaybookEvent({
      type: body.type,
      scholarId: body.scholarId,
      actorId: body.actorId,
      actorRole: body.actorRole,
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

    const recipients = resolveDemoRecipients({
      scholarId: event.scholar_id,
      actorRole: event.actor_role,
    });

    const notifications = recipients
      .map((recipientUserId) =>
        convertEventToNotification({
          eventId: savedEvent.id,
          event,
          recipientUserId,
        })
      )
      .filter(Boolean);

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
