import { redirect } from "next/navigation";
import { requirePlatformOperator } from "@/lib/auth/requirePlatformOperator";

export default async function FounderLayout({ children }: { children: React.ReactNode }) {
  const access = await requirePlatformOperator();
  if (!access.authenticated) redirect("/login?next=/founder");
  if (!access.authorized) redirect("/");
  return <>{children}</>;
}
