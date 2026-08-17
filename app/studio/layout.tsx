import { redirect } from "next/navigation";
import StudioShell from "@/components/studio/StudioShell";
import { requirePlatformOperator } from "@/lib/auth/requirePlatformOperator";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const access = await requirePlatformOperator();
  if (!access.authenticated) redirect("/login?next=/studio");
  if (!access.authorized) redirect("/");
  return <StudioShell>{children}</StudioShell>;
}
