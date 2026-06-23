import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await req.json();
  return NextResponse.json({ success: true });
}
