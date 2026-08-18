import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function projectRef(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const hostname = new URL(value).hostname;
    const [ref] = hostname.split(".");
    return ref || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("scope") !== "playbook-production-binding") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ref = projectRef(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  );

  return NextResponse.json({
    configured: Boolean(ref),
    projectRef: ref,
  });
}
