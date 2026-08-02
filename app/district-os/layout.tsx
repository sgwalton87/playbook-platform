import AuthorizedRoute from "@/components/auth/AuthorizedRoute";

const ALLOWED_ROLES = ["district"] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthorizedRoute allowedRoles={ALLOWED_ROLES}>{children}</AuthorizedRoute>;
}
