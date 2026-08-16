import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const BUCKET = "pbos-message-attachments";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (cleaned || "attachment").slice(0, 120);
}

async function requireConversationAccess(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  conversationId: string,
) {
  const conversation = await supabase
    .from("pbos_conversations")
    .select("id,relationship_id,status")
    .eq("id", conversationId)
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (conversation.error) throw new Error(conversation.error.message);
  if (!conversation.data) return null;
  return conversation.data;
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const form = await request.formData();
    const conversationId = String(form.get("conversationId") ?? "");
    const file = form.get("file");
    if (!conversationId || !(file instanceof File)) {
      return NextResponse.json({ error: "Conversation and file are required." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "This file type is not allowed." }, { status: 415 });
    }
    if (file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Attachments must be between 1 byte and 10 MB." }, { status: 413 });
    }
    if (!await requireConversationAccess(supabase, conversationId)) {
      return NextResponse.json({ error: "An active support relationship is required." }, { status: 403 });
    }

    const storagePath = `${conversationId}/${user.id}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploaded.error) throw new Error(uploaded.error.message);

    const metadata = await supabase.from("pbos_message_attachments").insert({
      conversation_id: conversationId,
      uploader_id: user.id,
      storage_path: storagePath,
      original_name: file.name.slice(0, 180),
      mime_type: file.type,
      byte_size: file.size,
    }).select("id,conversation_id,message_id,original_name,mime_type,byte_size,created_at").single();

    if (metadata.error || !metadata.data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      throw new Error(metadata.error?.message ?? "Attachment metadata could not be persisted.");
    }

    return NextResponse.json({ attachment: metadata.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Attachment upload failed." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const attachmentId = request.nextUrl.searchParams.get("attachmentId") ?? "";
    if (!attachmentId) return NextResponse.json({ error: "Attachment identifier is required." }, { status: 400 });

    const attachment = await supabase.from("pbos_message_attachments")
      .select("id,storage_path,original_name,mime_type,byte_size")
      .eq("id", attachmentId).maybeSingle();
    if (attachment.error) throw new Error(attachment.error.message);
    if (!attachment.data) return NextResponse.json({ error: "Attachment not found or no longer authorized." }, { status: 404 });

    const signed = await supabase.storage.from(BUCKET).createSignedUrl(attachment.data.storage_path, 60);
    if (signed.error || !signed.data?.signedUrl) throw new Error(signed.error?.message ?? "Attachment link could not be created.");
    return NextResponse.json({
      attachment: {
        id: attachment.data.id,
        original_name: attachment.data.original_name,
        mime_type: attachment.data.mime_type,
        byte_size: attachment.data.byte_size,
      },
      signedUrl: signed.data.signedUrl,
      expiresIn: 60,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Attachment download failed." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const attachmentId = request.nextUrl.searchParams.get("attachmentId") ?? "";
    const attachment = await supabase.from("pbos_message_attachments")
      .select("id,storage_path,message_id,uploader_id")
      .eq("id", attachmentId).eq("uploader_id", user.id).maybeSingle();
    if (attachment.error) throw new Error(attachment.error.message);
    if (!attachment.data) return NextResponse.json({ error: "Attachment not found or no longer authorized." }, { status: 404 });
    if (attachment.data.message_id) return NextResponse.json({ error: "Sent attachments cannot be removed from message history." }, { status: 409 });

    const removed = await supabase.storage.from(BUCKET).remove([attachment.data.storage_path]);
    if (removed.error) throw new Error(removed.error.message);
    const deleted = await supabase.from("pbos_message_attachments").delete().eq("id", attachment.data.id).eq("uploader_id", user.id);
    if (deleted.error) throw new Error(deleted.error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Attachment removal failed." }, { status: 400 });
  }
}
