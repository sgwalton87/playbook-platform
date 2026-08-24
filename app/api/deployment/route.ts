import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA
    ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    ?? null;

  return NextResponse.json(
    { commit },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
