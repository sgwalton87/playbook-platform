import AppShell from "@/components/AppShell";
import AuthorizedRoute from "@/components/auth/AuthorizedRoute";

const ALLOWED_ROLES = ["scholar", "transition-youth"] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthorizedRoute allowedRoles={ALLOWED_ROLES}><AppShell>{children}</AppShell></AuthorizedRoute>;
}
