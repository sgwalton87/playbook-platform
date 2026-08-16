import { NextResponse } from "next/server";

const response = () => NextResponse.json(
  {
    error: "Legacy shared actions are disabled. Use governed application support and role-specific support-task workflows.",
    migrationState: "governed_shared_task_service_required",
  },
  { status: 410 }
);

export async function GET() {
  return response();
}

export async function POST() {
  return response();
}

export async function PATCH() {
  return response();
}
