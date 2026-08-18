import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { authorizeMessagingRelationship, messagingAction, normalizeGovernedMessage } from "@/lib/pbos/governed-messaging";
import { PlaybookIdentityMapper } from "@/pbos/connector/identity-mapper";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string { const value = process.env[name]; if (!value) throw new Error("Missing protected server configuration: " + name); return value; }

async function relationshipsFor(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], user: { id: string; email?: string | null }) {
  const queries = [
    supabase.from("support_relationships").select("id,scholar_id,supporter_id,supporter_email,relationship,status,permissions").eq("status", "active").eq("scholar_id", user.id),
    supabase.from("support_relationships").select("id,scholar_id,supporter_id,supporter_email,relationship,status,permissions").eq("status", "active").eq("supporter_id", user.id)
  ];
  if (user.email) queries.push(supabase.from("support_relationships").select("id,scholar_id,supporter_id,supporter_email,relationship,status,permissions")
    .eq("status", "active").eq("supporter_email", user.email));
  const results = await Promise.all(queries); const records = new Map<string, Record<string, unknown>>();
  for (const result of results) { if (result.error) throw new Error(result.error.message); for (const item of result.data ?? []) records.set(String(item.id), item); }
  return [...records.values()];
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const relationships = await relationshipsFor(supabase, user);
    const relationshipIds = relationships.map(item => String(item.id));
    if (!relationshipIds.length) return NextResponse.json({ conversations: [] });
    const conversations = await supabase.from("pbos_conversations").select("id,scholar_id,relationship_id,status,created_at,updated_at")
      .in("relationship_id", relationshipIds).order("updated_at", { ascending: false });
    if (conversations.error) throw new Error(conversations.error.message);
    const ids = (conversations.data ?? []).map(item => item.id as string);
    if (!ids.length) return NextResponse.json({ conversations: [] });
    const [participants, messages, attachments] = await Promise.all([
      supabase.from("pbos_conversation_participants").select("conversation_id,user_id,role,muted_at,blocked_at,last_read_at").in("conversation_id", ids),
      supabase.from("pbos_messages").select("id,conversation_id,sender_id,body,delivery_state,moderation_state,reported_at,created_at")
        .in("conversation_id", ids).order("created_at", { ascending: true }),
      supabase.from("pbos_message_attachments").select("id,conversation_id,message_id,original_name,mime_type,byte_size,created_at")
        .in("conversation_id", ids).not("message_id", "is", null).order("created_at", { ascending: true })
    ]);
    if (participants.error) throw new Error(participants.error.message); if (messages.error) throw new Error(messages.error.message);
    if (attachments.error) throw new Error(attachments.error.message);
    return NextResponse.json({ conversations: (conversations.data ?? []).map(conversation => {
      const membership = (participants.data ?? []).find(item => item.conversation_id === conversation.id && item.user_id === user.id);
      const thread = (messages.data ?? []).filter(item => item.conversation_id === conversation.id).map(message => ({
        ...message,
        attachments: (attachments.data ?? []).filter(item => item.message_id === message.id),
      }));
      const unread = thread.filter(item => item.sender_id !== user.id && (!membership?.last_read_at || item.created_at > membership.last_read_at)).length;
      return { ...conversation, relationship: relationships.find(item => item.id === conversation.relationship_id),
        participant: membership, unreadCount: unread, messages: thread };
    }) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Messaging inbox failed." }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { relationshipId?: unknown; conversationId?: unknown; body?: unknown; requestId?: unknown; attachmentIds?: unknown };
    const relationshipId = String(body.relationshipId ?? ""); const requestId = String(body.requestId ?? "");
    const attachmentIds = Array.isArray(body.attachmentIds) ? [...new Set(body.attachmentIds.map(String).filter(Boolean))].slice(0, 5) : [];
    if (!relationshipId || !requestId) return NextResponse.json({ error: "Relationship and request identifiers are required." }, { status: 400 });
    const relationshipResult = await supabase.from("support_relationships")
      .select("id,scholar_id,supporter_id,supporter_email,relationship,status,permissions").eq("id", relationshipId).maybeSingle();
    if (relationshipResult.error) throw new Error(relationshipResult.error.message);
    if (!relationshipResult.data) return NextResponse.json({ error: "Support relationship not found." }, { status: 404 });
    const authority = authorizeMessagingRelationship({ actorId: user.id, actorEmail: user.email,
      relationship: { id: String(relationshipResult.data.id), scholarId: String(relationshipResult.data.scholar_id),
        supporterId: relationshipResult.data.supporter_id as string | null, supporterEmail: String(relationshipResult.data.supporter_email),
        relationship: String(relationshipResult.data.relationship ?? "mentor"),
        status: String(relationshipResult.data.status), permissions: relationshipResult.data.permissions as string[] },
      approvalId: required("PBOS_MESSAGING_JOURNEY_APPROVAL_ID") });
    const normalized = normalizeGovernedMessage(String(body.body ?? ""));
    const existingConversation = await supabase.from("pbos_conversations").select("id,scholar_id,relationship_id,status")
      .eq("relationship_id", relationshipId).maybeSingle();
    if (existingConversation.error) throw new Error(existingConversation.error.message);
    let conversation = existingConversation.data;
    if (!conversation) {
      const created = await supabase.from("pbos_conversations").insert({ scholar_id: authority.scholarId,
        relationship_id: relationshipId, status: "ACTIVE", created_by: user.id }).select("id,scholar_id,relationship_id,status").single();
      if (created.error || !created.data) throw new Error(created.error?.message ?? "Conversation persistence failed.");
      conversation = created.data;
    }
    const conversationId = String(conversation.id);
    if (body.conversationId && String(body.conversationId) !== conversationId) return NextResponse.json({ error: "Conversation lineage mismatch." }, { status: 409 });
    const membership = await supabase.from("pbos_conversation_participants").upsert({ conversation_id: conversationId,
      user_id: user.id, role: authority.role }, { onConflict: "conversation_id,user_id", ignoreDuplicates: true });
    if (membership.error) throw new Error(membership.error.message);
    const participant = await supabase.from("pbos_conversation_participants").select("blocked_at").eq("conversation_id", conversationId)
      .eq("user_id", user.id).maybeSingle();
    if (participant.error) throw new Error(participant.error.message);
    if (!participant.data || participant.data.blocked_at) return NextResponse.json({ error: "Conversation is blocked for this participant." }, { status: 403 });
    const idempotencyKey = user.id + ":" + requestId;
    const staged = await supabase.from("pbos_messages").upsert({ conversation_id: conversationId, scholar_id: authority.scholarId,
      sender_id: user.id, body: normalized, idempotency_key: idempotencyKey, delivery_state: "PENDING",
      moderation_state: "VISIBLE", provenance: authority.provenance }, { onConflict: "idempotency_key", ignoreDuplicates: true })
      .select("id,conversation_id,sender_id,body,created_at").maybeSingle();
    if (staged.error) throw new Error(staged.error.message);
    let stagedMessage = staged.data;
    if (!stagedMessage) {
      const existingMessage = await supabase.from("pbos_messages").select("id,conversation_id,sender_id,body,created_at")
        .eq("idempotency_key", idempotencyKey).eq("sender_id", user.id).maybeSingle();
      if (existingMessage.error || !existingMessage.data) throw new Error(existingMessage.error?.message ?? "Message persistence failed.");
      stagedMessage = existingMessage.data;
    }
    if (attachmentIds.length) {
      const bound = await supabase.from("pbos_message_attachments").update({ message_id: stagedMessage.id })
        .in("id", attachmentIds).eq("conversation_id", conversationId).eq("uploader_id", user.id).is("message_id", null)
        .select("id");
      if (bound.error) throw new Error(bound.error.message);
      if ((bound.data ?? []).length !== attachmentIds.length) throw new Error("One or more attachments are missing, already sent, or no longer authorized.");
    }
    const mapper = new PlaybookIdentityMapper(); const identity = mapper.mapSupabaseIdentity(user.id, authority.pbosRole);
    const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
      organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
      keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64") }));
    const response = await client.send("PUBLISH_LIFECYCLE_EVENT", { connectorId: "PLAYBOOK-CONNECTOR-001",
      domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001", identityMappingId: identity.mappingId,
      correlationId: idempotencyKey, purpose: "Publish an approved support message.", payload: {
        eventType: "SUPPORT_MESSAGE_SENT", schemaVersion: "1.0.0", messageId: stagedMessage.id, conversationId,
        attachmentIds,
      } }, idempotencyKey, idempotencyKey);
    if (!response.success) throw new Error(response.error.message);
    const provenance = [...authority.provenance, identity.pbosIdentity.provenance, ...response.provenance];
    const delivered = await supabase.rpc("finalize_governed_message_delivery", {
      p_message_id: stagedMessage.id,
      p_provenance: provenance,
    });
    if (delivered.error || !delivered.data) throw new Error(delivered.error?.message ?? "Message delivery finalization failed.");
    return NextResponse.json({ conversation, message: { ...delivered.data, attachmentIds } }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Message delivery failed." }, { status: 500 }); }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { action?: unknown; conversationId?: unknown; messageId?: unknown };
    const action = messagingAction(String(body.action ?? "")); const conversationId = String(body.conversationId ?? "");
    const relationships = await relationshipsFor(supabase, user);
    const relationshipIds = relationships.map(item => String(item.id));
    if (!relationshipIds.length) return NextResponse.json({ error: "An active support relationship is required." }, { status: 403 });
    const conversation = await supabase.from("pbos_conversations").select("id,relationship_id,status")
      .eq("id", conversationId).eq("status", "ACTIVE").in("relationship_id", relationshipIds).maybeSingle();
    if (conversation.error) throw new Error(conversation.error.message);
    if (!conversation.data) return NextResponse.json({ error: "An active support relationship is required." }, { status: 403 });
    const participant = await supabase.from("pbos_conversation_participants").select("conversation_id,user_id").eq("conversation_id", conversationId)
      .eq("user_id", user.id).maybeSingle();
    if (participant.error) throw new Error(participant.error.message);
    if (!participant.data) return NextResponse.json({ error: "Conversation membership required." }, { status: 403 });
    const now = new Date().toISOString();
    if (action === "REPORT") {
      const reported = await supabase.rpc("report_governed_message", {
        p_message_id: String(body.messageId ?? ""),
        p_conversation_id: conversationId,
      });
      if (reported.error) throw new Error(reported.error.message);
      if (!reported.data) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    } else {
      const values = action === "READ" ? { last_read_at: now } : action === "MUTE" ? { muted_at: now } :
        action === "UNMUTE" ? { muted_at: null } : action === "BLOCK" ? { blocked_at: now } : { blocked_at: null };
      const updated = await supabase.from("pbos_conversation_participants").update(values).eq("conversation_id", conversationId).eq("user_id", user.id);
      if (updated.error) throw new Error(updated.error.message);
    }
    return NextResponse.json({ ok: true, action });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Messaging action failed." }, { status: 400 }); }
}
