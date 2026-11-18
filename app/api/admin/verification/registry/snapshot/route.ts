import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID } from "@/lib/brand-verification/documents";

const BUCKET = "brand-registry-review-evidence";
const MAX_BYTES = 5 * 1024 * 1024;
const denyCache = { "Cache-Control": "no-store, private" };
function isOfficialSource(value: string) {
 try {
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname === "bizfileonline.sos.ca.gov" && !url.username && !url.password && value.length <= 2000;
 } catch { return false; }
}
async function authorizedContext(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], requestId: string) {
 return await supabase.rpc("get_brand_review_context", { requested_id: requestId });
}
export async function POST(request: NextRequest) {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401, headers: denyCache });
 const form = await request.formData().catch(() => null);
 const requestId = form?.get("requestId");
 const rawUrl = form?.get("sourceUrl");
 const file = form?.get("file");
 if (typeof requestId !== "string" || !UUID.test(requestId) || typeof rawUrl !== "string" || !isOfficialSource(rawUrl) || !(file instanceof File))
  return NextResponse.json({ error: "A valid request, California SOS URL and screenshot are required." }, { status: 400, headers: denyCache });
 if (file.size < 16 || file.size > MAX_BYTES || !["image/png","image/jpeg"].includes(file.type))
  return NextResponse.json({ error: "Use a PNG or JPEG screenshot under 5 MB." }, { status: 400, headers: denyCache });
 const buffer = Buffer.from(await file.arrayBuffer());
 const png = file.type === "image/png" && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const jpeg = file.type === "image/jpeg" && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
 if (!png && !jpeg) return NextResponse.json({ error: "Screenshot content does not match its file type." }, { status: 400, headers: denyCache });
 const context = await authorizedContext(supabase,requestId);
 if (context.error || !context.data) return NextResponse.json({ error: "Reviewer authority or request unavailable." }, { status: context.error?.code === "42501" ? 403 : 404, headers: denyCache });
 const path = `${requestId}/${user.id}/${crypto.randomUUID()}.${png ? "png" : "jpg"}`;
 const stored = await supabase.storage.from(BUCKET).upload(path,buffer,{ contentType: file.type, upsert:false, cacheControl:"0" });
 if (stored.error) return NextResponse.json({ error: "Private screenshot storage failed. No review has been recorded." }, { status: 503, headers: denyCache });
 const saved = await supabase.from("brand_registry_review_snapshots").insert({
  request_id: requestId, reviewer_id: user.id, storage_path:path, source_url:rawUrl,
  file_sha256:createHash("sha256").update(buffer).digest("hex"),
 });
 if (saved.error) return NextResponse.json({ error: "Screenshot was stored privately but its audit record could not be completed. Contact platform support; do not assume the review was recorded." }, { status: 503, headers: denyCache });
 return NextResponse.json({ saved:true, capturedAt:new Date().toISOString(), designation:"Reviewer-provided screenshot; human comparison still required." }, { status: 201, headers: denyCache });
}
export async function GET(request: NextRequest) {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({error:"Sign in required."},{status:401,headers:denyCache});
 const requestId=request.nextUrl.searchParams.get("requestId") ?? "";
 if (!UUID.test(requestId)) return NextResponse.json({error:"Valid request ID required."},{status:400,headers:denyCache});
 const context=await authorizedContext(supabase,requestId);
 if(context.error||!context.data) return NextResponse.json({error:"Reviewer authority or request unavailable."},{status:context.error?.code==="42501"?403:404,headers:denyCache});
 const result=await supabase.from("brand_registry_review_snapshots").select("id,source_url,captured_at,source_label").eq("request_id",requestId).order("captured_at",{ascending:false}).limit(20);
 if(result.error) return NextResponse.json({error:"Evidence audit records unavailable."},{status:503,headers:denyCache});
 return NextResponse.json({ snapshots:result.data??[] },{headers:denyCache});
}
