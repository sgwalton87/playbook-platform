import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

function getServerClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET(
  request: NextRequest
) {
  const query =
    request.nextUrl.searchParams
      .get("q")
      ?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
    });
  }

  const supabase = getServerClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Career search is not configured.",
        results: [],
      },
      {
        status: 503,
      }
    );
  }

  const escapedQuery = query
    .replace(/[%_]/g, "\\$&");

  const { data, error } = await supabase
    .from("careers")
    .select("id,title")
    .ilike(
      "title",
      `%${escapedQuery}%`
    )
    .order("title", {
      ascending: true,
    })
    .limit(50);

  if (error) {
    console.error(
      "Career search failed:",
      error.message
    );

    return NextResponse.json(
      {
        error:
          "Career search is temporarily unavailable.",
        results: [],
      },
      {
        status: 500,
      }
    );
  }

  const clean = query.toLowerCase();

  const results = (data || [])
    .map((career: any) => ({
      id: String(
        career.id ||
          career.title
      ),
      title: String(
        career.title || ""
      ).trim(),
    }))
    .filter((career) =>
      Boolean(career.title)
    )
    .sort((a, b) => {
      const aTitle =
        a.title.toLowerCase();

      const bTitle =
        b.title.toLowerCase();

      const aRank =
        aTitle === clean
          ? 0
          : aTitle.startsWith(clean)
            ? 1
            : 2;

      const bRank =
        bTitle === clean
          ? 0
          : bTitle.startsWith(clean)
            ? 1
            : 2;

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      return a.title.localeCompare(
        b.title,
        "en",
        {
          sensitivity: "base",
        }
      );
    });

  return NextResponse.json({
    results,
  });
}
