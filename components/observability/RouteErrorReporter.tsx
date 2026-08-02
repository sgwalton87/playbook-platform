"use client";

import { useEffect } from "react";
import { reportClientFailure } from "@/lib/observability/client";

export function RouteErrorReporter({ error }: { error: Error }): null {
  useEffect(() => {
    reportClientFailure("client_error", error.name || "RouteRenderError");
  }, [error]);
  return null;
}
