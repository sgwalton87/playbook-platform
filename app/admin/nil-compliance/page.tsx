import { redirect } from "next/navigation";
import ForbiddenState from "@/components/auth/ForbiddenState";
import NILComplianceQueue, {
  type NILComplianceQueueItem,
} from "@/components/scholar-athlete/NILComplianceQueue";
import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === "string" ? value : null);

function mapItem(value: unknown): NILComplianceQueueItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Row;
  const id = text(item.id);
  const scholarId = text(item.scholar_id);
  const brandName = text(item.brand_name);
  const title = text(item.opportunity_title);
  const type = text(item.opportunity_type);
  const stage = text(item.stage);
  if (!id || !scholarId || !brandName || !title || !type || !stage) return null;
  return {
    id,
    scholarId,
    brandName,
    opportunityTitle: title,
    opportunityType: type,
    stage,
    contractStatus: text(item.contract_status) ?? "unknown",
    disclosureStatus: text(item.disclosure_status) ?? "unknown",
    complianceStatus: text(item.compliance_status) ?? "unknown",
    jurisdiction: text(item.jurisdiction),
    institutionName: text(item.institution_name),
    agreementReference: text(item.agreement_reference),
    sourceName: text(item.source_name),
    sourceUrl: text(item.source_url),
    updatedAt: text(item.updated_at) ?? new Date(0).toISOString(),
  };
}

export const dynamic = "force-dynamic";

export default async function NILCompliancePage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: allowed } = await supabase.rpc("is_platform_admin", {
    p_user: auth.user.id,
  });
  if (allowed !== true) return <ForbiddenState />;
  const { data, error } = await supabase
    .from("nil_deals")
    .select(
      "id,scholar_id,brand_name,opportunity_title,opportunity_type,stage,contract_status,disclosure_status,compliance_status,jurisdiction,institution_name,agreement_reference,source_name,source_url,updated_at",
    )
    .in("compliance_status", ["submitted", "under_review", "changes_required"])
    .order("updated_at", { ascending: true })
    .limit(100);
  if (error) {
    return (
      <main className="athlete-os-shell">
        <PlaybookSurfaceState
          state="error"
          title="Compliance queue unavailable"
          description="No decision can be recorded until the authorized queue loads successfully."
          action={{ href: "/admin/nil-compliance", label: "Try again" }}
        />
      </main>
    );
  }
  const items = Array.isArray(data)
    ? data.flatMap((item) => mapItem(item) ?? [])
    : [];
  return (
    <main className="athlete-os-shell">
      <header className="athlete-os-hero">
        <div>
          <p className="athlete-os-eyebrow">Administrative NIL governance</p>
          <h1>Compliance review queue</h1>
          <p>
            Issue reasoned human decisions from athlete-submitted agreement and
            disclosure records. Approval confirms workflow review only; it does
            not guarantee legality, earnings, selection, or payment.
          </p>
        </div>
      </header>
      <section className="athlete-os-workspace">
        <NILComplianceQueue items={items} />
      </section>
    </main>
  );
}
