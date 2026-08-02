import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  decideBetaRoute,
  parseBetaExposureMode,
} from "@/lib/beta/exposure";

function unavailableResponse(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/beta-unavailable";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

function requestCorrelation(request: NextRequest): { requestId: string; correlationId: string } {
  const valid = /^[A-Za-z0-9._:-]{8,128}$/;
  const suppliedRequest = request.headers.get("x-request-id")?.trim() ?? "";
  const suppliedCorrelation = request.headers.get("x-correlation-id")?.trim() ?? "";
  const requestId = valid.test(suppliedRequest) ? suppliedRequest : crypto.randomUUID();
  const correlationId = valid.test(suppliedCorrelation) ? suppliedCorrelation : requestId;
  return { requestId, correlationId };
}

function correlated(response: NextResponse, requestId: string, correlationId: string): NextResponse {
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Correlation-Id", correlationId);
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const correlation = requestCorrelation(request);
  const next = () => {
    const headers = new Headers(request.headers);
    headers.set("x-request-id", correlation.requestId);
    headers.set("x-correlation-id", correlation.correlationId);
    return correlated(NextResponse.next({ request: { headers } }), correlation.requestId, correlation.correlationId);
  };
  const respond = (response: NextResponse) => correlated(response, correlation.requestId, correlation.correlationId);
  const mode = parseBetaExposureMode(process.env.PLAYBOOK_BETA_EXPOSURE_MODE);
  const decision = decideBetaRoute(
    request.nextUrl.pathname,
    mode,
    process.env.PLAYBOOK_BETA_REQUIRE_ACCESS_GRANT === "true",
  );

  if (decision.outcome === "allow_public") return next();
  if (decision.outcome === "deny") {
    return respond(decision.response === "api"
      ? NextResponse.json({ error: "Not available in this beta." }, { status: 404 })
      : unavailableResponse(request));
  }
  if (!decision.requiresGrant) return next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return respond(NextResponse.json(
      { error: "Beta access boundary is not configured." },
      { status: 503 },
    ));
  }

  let response = next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = next();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return respond(NextResponse.json({ error: "Authentication required." }, { status: 401 }));
    }
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", request.nextUrl.pathname);
    return respond(NextResponse.redirect(login, 307));
  }

  const { data: grant, error } = await supabase
    .from("beta_access_grants")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle();

  if (error || !grant) {
    return respond(request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Active beta access is required." }, { status: 403 })
      : unavailableResponse(request));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
