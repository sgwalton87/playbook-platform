"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import {
  evaluateNILDealReadiness,
  getNILPortfolioSummary,
  type NILDeal,
  type NILDealStage,
} from "@/lib/scholar-athlete/nilEngine";
import { supabase } from "@/lib/supabaseClient";

type NILDealRow = {
  id: string;
  brand_name: string;
  opportunity_title: string;
  stage: NILDealStage;
  compensation_type: "cash" | "product" | "equity" | "mixed" | null;
  compensation_amount: number | string | null;
  deliverables: NILDeal["deliverables"] | null;
  contract_status: NILDeal["contractStatus"];
  disclosure_status: NILDeal["disclosureStatus"];
  payment_status: NILDeal["paymentStatus"];
};

const dealStages: NILDealStage[] = ["lead", "conversation", "negotiation", "review", "signed", "active", "completed", "declined"];
const contractStatuses: NILDeal["contractStatus"][] = ["not_received", "received", "under_review", "approved", "signed"];
const disclosureStatuses: NILDeal["disclosureStatus"][] = ["not_started", "pending", "submitted", "approved"];
const paymentStatuses: NILDeal["paymentStatus"][] = ["not_due", "due", "partial", "paid"];

function mapDeal(row: NILDealRow): NILDeal {
  return {
    id: row.id,
    brandName: row.brand_name,
    opportunityTitle: row.opportunity_title,
    stage: row.stage,
    compensationType: row.compensation_type || undefined,
    compensationAmount: row.compensation_amount == null ? undefined : Number(row.compensation_amount),
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
    contractStatus: row.contract_status,
    disclosureStatus: row.disclosure_status,
    paymentStatus: row.payment_status,
  };
}

export default function NILReadinessPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [deals, setDeals] = useState<NILDeal[]>([]);
  const [brandName, setBrandName] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [compensationType, setCompensationType] = useState<"cash" | "product" | "equity" | "mixed" | "">("");
  const [compensationAmount, setCompensationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const summary = useMemo(() => getNILPortfolioSummary(deals), [deals]);

  useEffect(() => {
    let active = true;

    async function loadDeals() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }

      const { data, error: dealError } = await supabase
        .from("nil_deals")
        .select("id,brand_name,opportunity_title,stage,compensation_type,compensation_amount,deliverables,contract_status,disclosure_status,payment_status")
        .eq("scholar_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (dealError) {
        setError(dealError.message);
        setLoading(false);
        return;
      }

      setOwnerId(auth.user.id);
      setDeals(((data || []) as NILDealRow[]).map(mapDeal));
      setLoading(false);
    }

    void loadDeals();
    return () => { active = false; };
  }, [router]);

  async function addDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId || !brandName.trim() || !opportunityTitle.trim()) return;

    const amount = compensationAmount.trim() ? Number(compensationAmount) : null;
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      setError("Compensation amount must be zero or greater.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    const { data, error: insertError } = await supabase
      .from("nil_deals")
      .insert({
        scholar_id: ownerId,
        brand_name: brandName.trim(),
        opportunity_title: opportunityTitle.trim(),
        stage: "lead",
        compensation_type: compensationType || null,
        compensation_amount: amount,
        deliverables: [],
        contract_status: "not_received",
        disclosure_status: "not_started",
        payment_status: "not_due",
      })
      .select("id,brand_name,opportunity_title,stage,compensation_type,compensation_amount,deliverables,contract_status,disclosure_status,payment_status")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "NIL opportunity could not be saved.");
      setSaving(false);
      return;
    }

    setDeals((current) => [mapDeal(data as NILDealRow), ...current]);
    setBrandName("");
    setOpportunityTitle("");
    setCompensationType("");
    setCompensationAmount("");
    setMessage("NIL opportunity added to your private athlete record.");
    setSaving(false);
  }

  async function updateDeal(id: string, patch: Partial<Pick<NILDeal, "stage" | "contractStatus" | "disclosureStatus" | "paymentStatus">>) {
    if (!ownerId) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    const databasePatch: Record<string, string> = {};
    if (patch.stage) databasePatch.stage = patch.stage;
    if (patch.contractStatus) databasePatch.contract_status = patch.contractStatus;
    if (patch.disclosureStatus) databasePatch.disclosure_status = patch.disclosureStatus;
    if (patch.paymentStatus) databasePatch.payment_status = patch.paymentStatus;

    const { error: updateError } = await supabase
      .from("nil_deals")
      .update(databasePatch)
      .eq("id", id)
      .eq("scholar_id", ownerId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setDeals((current) => current.map((deal) => deal.id === id ? { ...deal, ...patch } : deal));
    setMessage("NIL record updated.");
    setSaving(false);
  }

  if (loading) {
    return <PlaybookPage><div data-testid="nil-readiness" style={loadingState}>Connecting your private NIL record…</div></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="nil-readiness" data-visual-canon="PGNR-001">
        <PlaybookHero
          eyebrow="NIL Deal Readiness"
          title="Track the opportunity without losing sight of the obligations."
          subtitle="Keep NIL opportunities, deal stage, contract status, disclosure status, and payment status visible in the same private Scholar-Athlete record. This tracker organizes your record; it does not replace legal, tax, school, conference, or governing-body advice."
        >
          <div style={heroActions}>
            <PlaybookButton href="/scholar-athlete-os">Scholar-Athlete OS</PlaybookButton>
            <PlaybookButton href="/recruiting/profile" variant="secondary">Athlete Profile & Film</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? <div role="alert" style={errorState}><strong>NIL record needs attention.</strong> {error}</div> : null}
        {message ? <div role="status" style={successState}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Tracked opportunities" value={String(summary.totalDeals)} />
          <PlaybookMetric label="Active" value={String(summary.activeDeals)} />
          <PlaybookMetric label="Completed" value={String(summary.completedDeals)} />
          <PlaybookMetric label="Tracked cash value" value={formatCurrency(summary.trackedCashValue)} />
        </PlaybookMetrics>

        <div style={workspaceGrid}>
          <section style={panel} aria-labelledby="add-nil-heading">
            <PlaybookPill>Opportunity record</PlaybookPill>
            <h2 id="add-nil-heading" style={sectionTitle}>Add an NIL opportunity</h2>
            <p style={muted}>Record only a real opportunity you are considering or working on. Starting a record does not mean the deal is approved, compliant, signed, or paid.</p>
            <form onSubmit={addDeal} style={formGrid}>
              <label style={field}>Brand or organization<span style={required}>Required</span><input required value={brandName} onChange={(event) => setBrandName(event.target.value)} style={input} /></label>
              <label style={field}>Opportunity title<span style={required}>Required</span><input required value={opportunityTitle} onChange={(event) => setOpportunityTitle(event.target.value)} style={input} placeholder="Social campaign" /></label>
              <label style={field}>Compensation type<select value={compensationType} onChange={(event) => setCompensationType(event.target.value as typeof compensationType)} style={input}><option value="">Not specified</option><option value="cash">Cash</option><option value="product">Product</option><option value="equity">Equity</option><option value="mixed">Mixed</option></select></label>
              <label style={field}>Compensation amount<input inputMode="decimal" value={compensationAmount} onChange={(event) => setCompensationAmount(event.target.value)} style={input} placeholder="0.00" /></label>
              <button type="submit" disabled={saving} style={primaryButton}>{saving ? "Saving…" : "Add NIL opportunity"}</button>
            </form>
          </section>

          <section style={panel} aria-labelledby="nil-pipeline-heading">
            <div style={panelHeading}>
              <div>
                <PlaybookPill>Deal awareness</PlaybookPill>
                <h2 id="nil-pipeline-heading" style={sectionTitle}>Your tracked NIL opportunities</h2>
              </div>
              <span style={recordTruth}>{deals.length === 0 ? "No recorded NIL activity" : `${deals.length} private record${deals.length === 1 ? "" : "s"}`}</span>
            </div>

            {deals.length === 0 ? (
              <div style={emptyState}>
                <h3 style={{ marginTop: 0 }}>No NIL opportunity has been recorded yet.</h3>
                <p style={muted}>Playbook will not invent a deal, valuation, sponsor, or payment. Add an opportunity only when it is real.</p>
              </div>
            ) : (
              <div style={dealList}>
                {deals.map((deal) => {
                  const readiness = evaluateNILDealReadiness(deal);
                  return (
                    <article key={deal.id} style={dealCard}>
                      <div style={dealHeader}>
                        <div>
                          <span style={stageLabel}>{formatLabel(deal.stage)}</span>
                          <h3 style={dealTitle}>{deal.opportunityTitle}</h3>
                          <p style={dealMeta}>{deal.brandName}{deal.compensationAmount != null ? ` · ${formatCurrency(deal.compensationAmount)}` : ""}</p>
                        </div>
                        <span style={readiness.ready ? readyBadge : warningBadge}>{readiness.ready ? "No tracker warning" : `${readiness.warnings.length} attention item${readiness.warnings.length === 1 ? "" : "s"}`}</span>
                      </div>

                      {!readiness.ready ? <ul style={warningList}>{readiness.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}

                      <div style={statusGrid}>
                        <label style={miniField}>Deal stage<select disabled={saving} value={deal.stage} onChange={(event) => void updateDeal(deal.id, { stage: event.target.value as NILDealStage })} style={select}>{dealStages.map((stage) => <option key={stage} value={stage}>{formatLabel(stage)}</option>)}</select></label>
                        <label style={miniField}>Contract<select disabled={saving} value={deal.contractStatus} onChange={(event) => void updateDeal(deal.id, { contractStatus: event.target.value as NILDeal["contractStatus"] })} style={select}>{contractStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}</select></label>
                        <label style={miniField}>Disclosure<select disabled={saving} value={deal.disclosureStatus} onChange={(event) => void updateDeal(deal.id, { disclosureStatus: event.target.value as NILDeal["disclosureStatus"] })} style={select}>{disclosureStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}</select></label>
                        <label style={miniField}>Payment<select disabled={saving} value={deal.paymentStatus} onChange={(event) => void updateDeal(deal.id, { paymentStatus: event.target.value as NILDeal["paymentStatus"] })} style={select}>{paymentStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}</select></label>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section style={agencyPanel}>
          <div>
            <p style={eyebrow}>Awareness, not approval</p>
            <h2 style={agencyTitle}>A green tracker is not legal or compliance clearance.</h2>
          </div>
          <p style={agencyCopy}>Playbook can flag internal record inconsistencies—such as an active deal without a signed-contract record or an unresolved disclosure status. Final eligibility, disclosure, contract, tax, and school requirements must come from the applicable authorized people and governing sources.</p>
        </section>
      </div>
    </PlaybookPage>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 750 };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const successState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontWeight: 800 };
const workspaceGrid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #DDE6EF", borderRadius: 24, padding: "clamp(20px,3vw,32px)", boxShadow: "0 16px 50px rgba(15,23,42,.06)" };
const panelHeading: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "start" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 10px", color: "#102238", fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.05 };
const muted: React.CSSProperties = { color: "#61748A", lineHeight: 1.65 };
const formGrid: React.CSSProperties = { display: "grid", gap: 14, marginTop: 20 };
const field: React.CSSProperties = { display: "grid", gap: 7, color: "#20364E", fontWeight: 800, fontSize: 13 };
const required: React.CSSProperties = { marginLeft: 8, color: "#A94422", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #C7D4E0", padding: "10px 12px", font: "inherit", color: "#102238", background: "#FFFFFF" };
const primaryButton: React.CSSProperties = { minHeight: 46, border: 0, borderRadius: 999, padding: "0 18px", background: "#102238", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const recordTruth: React.CSSProperties = { color: "#6B7F94", fontSize: 12, fontWeight: 800 };
const emptyState: React.CSSProperties = { marginTop: 20, padding: 22, borderRadius: 18, background: "#F4F8FB", border: "1px dashed #B8C9D8", color: "#20364E" };
const dealList: React.CSSProperties = { display: "grid", gap: 14, marginTop: 20 };
const dealCard: React.CSSProperties = { padding: 18, borderRadius: 18, border: "1px solid #DDE6EF", background: "#FBFCFE" };
const dealHeader: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "start" };
const stageLabel: React.CSSProperties = { color: "#D65F1F", fontSize: 10, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" };
const dealTitle: React.CSSProperties = { margin: "5px 0 3px", color: "#102238", fontSize: 22 };
const dealMeta: React.CSSProperties = { margin: 0, color: "#718399", fontSize: 13 };
const readyBadge: React.CSSProperties = { padding: "7px 10px", borderRadius: 999, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontSize: 11, fontWeight: 900 };
const warningBadge: React.CSSProperties = { ...readyBadge, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412" };
const warningList: React.CSSProperties = { margin: "14px 0 0", paddingLeft: 20, color: "#9A3412", lineHeight: 1.55 };
const statusGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid #E6EDF4" };
const miniField: React.CSSProperties = { display: "grid", gap: 6, color: "#52657B", fontSize: 11, fontWeight: 850 };
const select: React.CSSProperties = { minHeight: 40, borderRadius: 10, border: "1px solid #C7D4E0", padding: "8px 10px", background: "#FFFFFF", color: "#102238", fontWeight: 800 };
const agencyPanel: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", padding: "clamp(24px,4vw,38px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, alignItems: "center", borderRadius: "30px 8px 30px 8px", color: "#F8FAFC", background: "linear-gradient(145deg,#06172D,#0B2648)" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const agencyTitle: React.CSSProperties = { margin: "9px 0 0", fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.04 };
const agencyCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.7 };
