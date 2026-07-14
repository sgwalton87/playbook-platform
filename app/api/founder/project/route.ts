import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const registryPath = path.join(
      process.cwd(),
      "founder",
      "project.json"
    );

    const raw = await fs.readFile(registryPath, "utf8");
    const project = JSON.parse(raw);

    return NextResponse.json(
      { project },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Founder project load error:", error);

    return NextResponse.json(
      {
        error: "Founder Project Intelligence could not be loaded.",
      },
      { status: 500 }
    );
  }
}
