import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { messagingAction, normalizeGovernedMessage } from "@/lib/pbos/governed-messaging";
import { PlaybookIdentityMapper } from "@/pbos/connector/identity-mapper";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected server configuration: " + name);
  return value;
}

type RequestSupabase = Awaited<ReturnType<typeof requireUser>>["supabase"];

type GroupRow = { id: string; name: string; description: string | null; is_private: boolean | null };

async function publishGroupMessage(userId: string, messageId: string, conversationId: string, groupId: string, requestId: string, attachmentIds: string[]) {
  const identity = new PlaybookIdentityMapper().mapSupabaseIdentity(userId, "SCHOLAR");
  const key = userId + ":" + requestId;
  const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
    organizationId: required("PBOS_ORGANIZATION_ID"),
    connectorId: required("PBOS_CONNECTOR_ID"),
    keyId: required("PBOS_CONNECTOR_KEY_ID"),
    secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64"),
  }));
  const response = await client.send("PUBLISH_LIFECYCLE_EVENT", {
    connectorId: "PLAYBOOK-CONNECTOR-001",
    domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001",
    identityMappingId: identity.mappingId,
    correlationId: key,
    purpose: "Publish an authorized Group message.",
    payload: {
      eventType: "GROUP_MESSAGE_SENT",
      schemaVersion: "1.0.0",
      messageId,
      conversationId,
      groupId,
      attachmentIds,
    },
  }, key, key);
  if (!response.success) throw new Error(response.error.message);
  return [identity.pbosIdentity.provenance, ...response.provenance];
}

async function loadGroupConversation(supabase: RequestSupabase, userId: string, conversationId: string) {
  const conversation = await supabase.from("pbos_conversations")
    .select("id,conversation_kind,group_id,status,created_at,updated_at")
    .eq("id", conversationId)
    .eq("conversation_kind", "group")
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (conversation.error) throw new Error(conversation.error.message);
  if (!conversation.data?.group_id) return null;

  const [groupResult, participantResult, messagesResult, attachmentsResult] = await Promise.all([
    supabase.from("groups").select("id,name,description,is_private").eq("id", conversation.data.group_id).maybeSingle(),
    supabase.from("pbos_conversation_participants").select("conversation_id,user_id,role,muted_at,blocked_at,last_read_at")
      .eq("conversation_id", conversationId).eq("user_id", userId).maybeSingle(),
    supabase.from("pbos_messages").select("id,conversation_id,sender_id,body,delivery_state,moderation_state,reported_at,created_at")
      .eq("conversation_id", conversationId).order("created_at", { ascending: true }),
    supabase.from("pbos_message_attachments").select("id,conversation_id,message_id,original_name,mime_type,byte_size,created_at")
      .eq("conversation_id", conversationId).not("message_id", "is", null).order("created_at", { ascending: true }),
  ]);
  if (groupResult.error) throw new Error(groupResult.error.message);
  if (participantResult.error) throw new Error(participantResult.error.message);
  if (messagesResult.error) throw new Error(messagesResult.error.message);
  if (attachmentsResult.error) throw new Error(attachmentsResult.error.message);
  if (!groupResult.data || !participantResult.data) return null;

  const messages = (messagesResult.data ?? []).map(message => ({
    ...message,
    attachments: (attachmentsResult.data ?? []).filter(item => item.message_id === message.id),
  }));
  const unreadCount = messages.filter(message => message.sender_id !== userId
    && (!participantResult.data?.last_read_at || message.created_at > participantResult.data.last_read_at)).length;

  return {
    ...conversation.data,
    group: groupResult.data as GroupRow,
    participant: participantResult.data,
    unreadCount,
    messages,
  };
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const memberships = await supabase.from("group_members").select("group_id").eq("profile_id", user.id);
    if (memberships.error) throw new Error(memberships.error.message);
    const groupIds = [...new Set((memberships.data ?? []).map(item => String(item.group_id)))];
    if (!groupIds.length) return NextResponse.json({ conversations: [] });

    const conversations = await supabase.from("pbos_conversations")
      .select("id").eq("conversation_kind", "group").eq("status", "ACTIVE").in("group_id", groupIds)
      .order("updated_at", { ascending: false });
    if (conversations.error) throw new Error(conversations.error.message);

    const loaded = await Promise.all((conversations.data ?? []).map(item => loadGroupConversation(supabase, user.id, item.id)));
    return NextResponse.json({ conversations: loaded.filter(Boolean) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Group conversations could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { action?: unknown; groupId?: unknown; conversationId?: unknown; body?: unknown; requestId?: unknown; attachmentIds?: unknown };
    const action = String(body.action ?? "OPEN").toUpperCase();

    if (action === "OPEN") {
      const groupId = String(body.groupId ?? "");
      if (!groupId) return NextResponse.json({ error: "Group identifier is required." }, { status: 400 });
      const ensured = await supabase.rpc("ensure_group_conversation", { requested_group_id: groupId });
      if (ensured.error || !ensured.data) return NextResponse.json({ error: ensured.error?.message ?? "Group conversation could not be opened." }, { status: 403 });
      const conversation = await loadGroupConversation(supabase, user.id, String(ensured.data));
      if (!conversation) return NextResponse.json({ error: "Group conversation is no longer authorized." }, { status: 403 });
      return NextResponse.json({ conversation });
    }

    if (action !== "SEND") return NextResponse.json({ error: "Unsupported Group messaging action." }, { status: 400 });
    const conversationId = String(body.conversationId ?? "");
    const requestId = String(body.requestId ?? "");
    const attachmentIds = Array.isArray(body.attachmentIds)
      ? [...new Set(body.attachmentIds.map(String).filter(Boolean))].slice(0, 5)
      : [];
    if (!conversationId || !requestId) return NextResponse.json({ error: "Conversation and request identifiers are required." }, { status: 400 });

    const authorized = await loadGroupConversation(supabase, user.id, conversationId);
    if (!authorized?.group_id) return NextResponse.json({ error: "Current group membership is required." }, { status: 403 });
    if (authorized.participant?.blocked_at) return NextResponse.json({ error: "Conversation is blocked for this participant." }, { status: 403 });

    const normalized = normalizeGovernedMessage(String(body.body ?? ""));
    const idempotencyKey = user.id + ":" + requestId;
    const staged = await supabase.from("pbos_messages").upsert({
      conversation_id: conversationId,
      scholar_id: null,
      sender_id: user.id,
      body: normalized,
      idempotency_key: idempotencyKey,
      delivery_state: "PENDING",
      moderation_state: "VISIBLE",
      provenance: [{ source: "playbook-group", groupId: authorized.group_id, conversationId }],
    }, { onConflict: "idempotency_key", ignoreDuplicates: true })
      .select("id,conversation_id,sender_id,body,created_at").maybeSingle();
    if (staged.error) throw new Error(staged.error.message);

    let message = staged.data;
    if (!message) {
      const existing = await supabase.from("pbos_messages").select("id,conversation_id,sender_id,body,created_at")
        .eq("idempotency_key", idempotencyKey).eq("sender_id", user.id).maybeSingle();
      if (existing.error || !existing.data) throw new Error(existing.error?.message ?? "Message persistence failed.");
      message = existing.data;
    }

    if (attachmentIds.length) {
      const bound = await supabase.from("pbos_message_attachments").update({ message_id: message.id }).in("id", attachmentIds)
        .eq("conversation_id", conversationId).eq("uploader_id", user.id).is("message_id", null).select("id");
      if (bound.error) throw new Error(bound.error.message);
      if ((bound.data ?? []).length !== attachmentIds.length) throw new Error("One or more attachments are missing, already sent, or no longer authorized.");
    }

    const provenance = await publishGroupMessage(user.id, message.id, conversationId, authorized.group_id, requestId, attachmentIds);
    const delivered = await supabase.rpc("finalize_governed_message_delivery", {
      p_message_id: message.id,
      p_provenance: provenance,
    });
    if (delivered.error || !delivered.data) throw new Error(delivered.error?.message ?? "Message delivery finalization failed.");

    return NextResponse.json({ conversation: await loadGroupConversation(supabase, user.id, conversationId) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Group message action failed." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { action?: unknown; conversationId?: unknown; messageId?: unknown };
    const action = messagingAction(String(body.action ?? ""));
    const conversationId = String(body.conversationId ?? "");
    if (!await loadGroupConversation(supabase, user.id, conversationId)) {
      return NextResponse.json({ error: "Current group membership is required." }, { status: 403 });
    }

    const now = new Date().toISOString();
    if (action === "REPORT") {
      const reported = await supabase.rpc("report_governed_message", {
        p_message_id: String(body.messageId ?? ""),
        p_conversation_id: conversationId,
      });
      if (reported.error) throw new Error(reported.error.message);
      if (!reported.data) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    } else {
      const values = action === "READ" ? { last_read_at: now }
        : action === "MUTE" ? { muted_at: now }
          : action === "UNMUTE" ? { muted_at: null }
            : action === "BLOCK" ? { blocked_at: now }
              : { blocked_at: null };
      const updated = await supabase.from("pbos_conversation_participants").update(values)
        .eq("conversation_id", conversationId).eq("user_id", user.id);
      if (updated.error) throw new Error(updated.error.message);
    }

    return NextResponse.json({ ok: true, action });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Group messaging action failed." }, { status: 400 });
  }
}
