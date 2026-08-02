import { redirect } from "next/navigation";
import ForbiddenState from "./ForbiddenState";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import type { PlaybookRole } from "@/lib/roles/registry";

export default async function AuthorizedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: readonly PlaybookRole[] }) {
  const decision = await resolveServerAuthorization({ allowedRoles });
  if (!decision.authorized && decision.reason === "unauthenticated") redirect("/login");
  if (!decision.authorized) return <ForbiddenState />;
  return <>{children}</>;
}
