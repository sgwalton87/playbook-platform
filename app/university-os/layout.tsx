import AuthorizedRoute from "@/components/auth/AuthorizedRoute";

const ALLOWED_ROLES = ["college-coach", "college-admissions"] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthorizedRoute allowedRoles={ALLOWED_ROLES}>{children}</AuthorizedRoute>;
}
