import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { BRAND_EVIDENCE_BUCKET, UUID } from "@/lib/brand-verification/documents";

// A stable dashboard URL, authenticated on every open. No bearer links or expiry clock.
export async function GET(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to open private verification documents." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("documentId") ?? "";
  if (!UUID.test(id)) return NextResponse.json({ error: "Valid document ID required." }, { status: 400 });
  const access = await supabase.rpc("open_brand_verification_document", { requested_document_id: id });
  if (access.error || typeof access.data !== "string") return NextResponse.json({ error: "Document not accessible." }, { status: access.error?.code === "P0002" ? 404 : access.error?.code === "42501" ? 403 : 503 });
  const file = await supabase.storage.from(BRAND_EVIDENCE_BUCKET).download(access.data);
  if (file.error || !file.data) return NextResponse.json({ error: "Private document could not be opened." }, { status: 503 });
  const name = access.data.split("/").pop() ?? "document";
  const extension = name.split(".").pop();
  const contentType = extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
  return new NextResponse(file.data, { headers: {
    "Content-Type": contentType, "Content-Disposition": `inline; filename="${name.replace(/[^a-zA-Z0-9.-]/g, "_")}"`,
    "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'; sandbox",
  } });
}
