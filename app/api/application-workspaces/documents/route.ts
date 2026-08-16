import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";
import { requireUser } from "@/lib/supabase/server";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MEDIA_TYPES = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });
    const form = await request.formData(); const workspaceId = String(form.get("workspaceId") ?? ""); const file = form.get("file");
    if (!(file instanceof File) || !workspaceId) return NextResponse.json({ error: "Workspace and document are required." }, { status: 400 });
    if (file.size < 1 || file.size > MAX_DOCUMENT_BYTES) return NextResponse.json({ error: "Document must be between 1 byte and 10 MB." }, { status: 400 });
    if (!MEDIA_TYPES.includes(file.type)) return NextResponse.json({ error: "Document type is not supported." }, { status: 400 });
    const owner = await supabase.from("application_workspaces").select("id").eq("id", workspaceId).eq("scholar_id", user.id).single();
    if (owner.error || !owner.data) return NextResponse.json({ error: "Application workspace was not found." }, { status: 404 });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120); const storagePath = user.id + "/" + workspaceId + "/" + randomUUID() + "-" + safeName;
    const uploaded = await supabase.storage.from("application-documents").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploaded.error) throw new Error(uploaded.error.message);
    const record = await supabase.from("application_workspace_documents").insert({ workspace_id: workspaceId,
      scholar_id: user.id, file_name: file.name, storage_path: storagePath, media_type: file.type, size_bytes: file.size }).select("id,file_name,media_type,size_bytes,created_at").single();
    if (record.error || !record.data) { await supabase.storage.from("application-documents").remove([storagePath]); throw new Error(record.error?.message ?? "Document metadata persistence failed."); }
    return NextResponse.json({ ok: true, document: record.data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload application document." }, { status: 400 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });
    const body = await request.json() as { documentId?: unknown };
    const record = await supabase.from("application_workspace_documents").select("id,storage_path").eq("id", String(body.documentId ?? "")).eq("scholar_id", user.id).single();
    if (record.error || !record.data) return NextResponse.json({ error: "Application document was not found." }, { status: 404 });
    const removed = await supabase.storage.from("application-documents").remove([record.data.storage_path]); if (removed.error) throw new Error(removed.error.message);
    const deleted = await supabase.from("application_workspace_documents").delete().eq("id", record.data.id).eq("scholar_id", user.id); if (deleted.error) throw new Error(deleted.error.message);
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove application document." }, { status: 400 }); }
}
