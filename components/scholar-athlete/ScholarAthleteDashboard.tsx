"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlaybookBadge } from "@/components/ui/PlaybookBadge";
import { PlaybookButton } from "@/components/ui/PlaybookButton";
import { PlaybookCard } from "@/components/ui/PlaybookCard";
import { PlaybookMetricCard } from "@/components/ui/PlaybookMetricCard";
import {
  ATHLETE_LEVELS,
  ATHLETE_VISIBILITY,
  NIL_OPPORTUNITY_TYPES,
} from "@/lib/scholar-athlete/contracts";
import {
  calculateAthleteProfileReadiness,
  getNILNextStage,
  type NILDealProjection,
  type ScholarAthleteDashboardData,
} from "@/lib/scholar-athlete/dashboard";

type WorkspaceTab = "overview" | "profile" | "recruiting" | "nil";
type RequestState = { state: "idle" | "saving" | "success" | "error"; message?: string };

const EMPTY_REQUEST: RequestState = { state: "idle" };

function list(value: FormDataEntryValue | null): string[] {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

async function requestJson(url: string, method: "POST" | "PUT" | "PATCH", body: unknown) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new Error(payload?.error ?? "The request could not be completed.");
  return payload;
}

export default function ScholarAthleteDashboard({
  initialData,
}: {
  initialData: ScholarAthleteDashboardData;
}) {
  const router = useRouter();
  const data = initialData;
  const [tab, setTab] = useState<WorkspaceTab>("overview");
  const [request, setRequest] = useState<RequestState>(EMPTY_REQUEST);
  const readiness = useMemo(
    () => calculateAthleteProfileReadiness(data.athleteProfile),
    [data.athleteProfile],
  );
  const recruitingOffers = data.recruitingTargets.filter((target) => target.stage === "offer").length;
  const activeNIL = data.nilDeals.filter((deal) => deal.stage === "active").length;

  async function submit(
    operation: () => Promise<unknown>,
    success: string,
    resetForm?: HTMLFormElement,
  ) {
    setRequest({ state: "saving", message: "Saving governed athlete data…" });
    try {
      await operation();
      resetForm?.reset();
      setRequest({ state: "success", message: success });
      router.refresh();
    } catch (error) {
      setRequest({
        state: "error",
        message: error instanceof Error ? error.message : "The athlete command failed safely.",
      });
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void submit(
      () => requestJson("/api/athlete/profile", "PUT", {
        sport: form.get("sport"), secondarySport: form.get("secondarySport"),
        position: form.get("position"), secondaryPosition: form.get("secondaryPosition"),
        graduationYear: form.get("graduationYear"), athleteLevel: form.get("athleteLevel"),
        governingPath: form.get("governingPath"), bio: form.get("bio"), location: form.get("location"),
        highlightUrl: form.get("highlightUrl"), teams: list(form.get("teams")), leagues: list(form.get("leagues")),
        awards: list(form.get("awards")), leadershipExperience: list(form.get("leadershipExperience")),
        visibility: form.get("visibility"),
      }),
      "Athlete profile saved. Verification state was not changed.",
    );
  }

  function addRecruitingTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    void submit(
      () => requestJson("/api/athlete/recruiting", "POST", {
        schoolName: form.get("schoolName"), athleticProgram: form.get("athleticProgram"),
        division: form.get("division"), coachName: form.get("coachName"), coachEmail: form.get("coachEmail"),
        stage: form.get("stage"), nextAction: form.get("nextAction"), nextActionDueAt: form.get("nextActionDueAt"),
        notes: form.get("notes"),
      }),
      "Program added to your recruiting pipeline.",
      target,
    );
  }

  function addNILOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    void submit(
      () => requestJson("/api/athlete/nil", "POST", {
        brandName: form.get("brandName"), opportunityTitle: form.get("opportunityTitle"),
        opportunityType: form.get("opportunityType"), compensationType: form.get("compensationType"),
        compensationAmount: form.get("compensationAmount"), sourceName: form.get("sourceName"),
        sourceUrl: form.get("sourceUrl"), jurisdiction: form.get("jurisdiction"),
        institutionName: form.get("institutionName"),
      }),
      "NIL lead recorded without implying a guaranteed opportunity or earning.",
      target,
    );
  }

  function saveNILProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data.athleteProfile) return;
    const form = new FormData(event.currentTarget);
    void submit(
      () => requestJson("/api/athlete/nil-profile", "PUT", {
        athleteProfileId: data.athleteProfile?.id, brandStatement: form.get("brandStatement"),
        brandValues: list(form.get("brandValues")), brandCategories: list(form.get("brandCategories")),
        partnershipInterests: list(form.get("partnershipInterests")), socialPresence: [],
        visibility: form.get("nilVisibility"), discoverable: form.get("discoverable") === "on",
        marketplaceConsent: form.get("marketplaceConsent") === "on",
      }),
      "NIL identity and discovery consent saved.",
    );
  }

  function advanceNIL(deal: NILDealProjection) {
    const nextStage = getNILNextStage(deal.stage);
    if (!nextStage) return;
    void submit(
      () => requestJson("/api/athlete/nil", "PATCH", {
        action: "transition", dealId: deal.id, nextStage,
        reason: `Athlete advanced ${deal.opportunityTitle} from ${deal.stage} to ${nextStage}.`,
      }),
      `NIL opportunity advanced to ${nextStage.replaceAll("_", " ")}.`,
    );
  }

  function submitCompliance(event: FormEvent<HTMLFormElement>, deal: NILDealProjection) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void submit(
      () => requestJson("/api/athlete/nil", "PATCH", {
        action: "submit_compliance", dealId: deal.id, agreementReference: form.get("agreementReference"),
        jurisdiction: form.get("jurisdiction"), institutionName: form.get("institutionName"),
        reason: form.get("reason"),
      }),
      "Compliance package submitted for an authorized human decision.",
    );
  }

  return (
    <main className="athlete-os-shell">
      <header className="athlete-os-hero">
        <div>
          <p className="athlete-os-eyebrow">Scholar-Athlete OS · athlete-owned</p>
          <h1>{data.scholar.name}&apos;s athlete command center</h1>
          <p>Academics remain first. Build verified athletic identity, manage recruiting decisions, and govern NIL work without promised outcomes.</p>
        </div>
        <div className="athlete-os-identity">
          <PlaybookBadge>{data.athleteProfile?.verificationState ?? "profile not started"}</PlaybookBadge>
          <strong>{data.athleteProfile?.sport ?? "Choose your primary sport"}</strong>
          <span>{data.scholar.school ?? "School not connected"}</span>
        </div>
      </header>

      <nav className="athlete-os-tabs" aria-label="Athlete workspace">
        {(["overview", "profile", "recruiting", "nil"] as const).map((item) => (
          <button key={item} type="button" aria-current={tab === item ? "page" : undefined} onClick={() => setTab(item)}>
            {item === "nil" ? "NIL" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      {request.state !== "idle" && (
        <div className={`athlete-os-notice athlete-os-notice--${request.state}`} role={request.state === "error" ? "alert" : "status"} aria-live="polite">
          {request.message}
        </div>
      )}

      {tab === "overview" && (
        <>
          <section className="athlete-os-metrics" aria-label="Athlete readiness metrics">
            <PlaybookMetricCard label="Profile readiness" value={`${readiness.score}%`} detail={readiness.missing.length ? `${readiness.missing.length} evidence gaps` : "Core profile complete"} />
            <PlaybookMetricCard label="Recruiting programs" value={String(data.recruitingTargets.length)} detail={`${recruitingOffers} tracked offers`} />
            <PlaybookMetricCard label="NIL pipeline" value={String(data.nilDeals.length)} detail={`${activeNIL} active agreements`} />
            <PlaybookMetricCard label="Academic GPA" value={data.scholar.gpa?.toFixed(2) ?? "Not connected"} detail="Academic truth remains authoritative" />
          </section>
          <section className="athlete-os-grid">
            <PlaybookCard className="athlete-os-card">
              <p className="athlete-os-eyebrow">Athlete identity</p><h2>Build a verified profile</h2>
              <p>{readiness.missing.length ? `Next evidence gaps: ${readiness.missing.slice(0, 3).join(", ")}.` : "Your core profile fields are complete. Continue verification through evidence workflows."}</p>
              <PlaybookButton onClick={() => setTab("profile")}>Open profile</PlaybookButton>
            </PlaybookCard>
            <PlaybookCard className="athlete-os-card">
              <p className="athlete-os-eyebrow">Recruiting</p><h2>Own every relationship</h2>
              <p>Track athlete-to-school and coach-to-athlete activity, next actions, visits, offers, and decisions without implying selection.</p>
              <PlaybookButton onClick={() => setTab("recruiting")}>Open recruiting</PlaybookButton>
            </PlaybookCard>
            <PlaybookCard className="athlete-os-card">
              <p className="athlete-os-eyebrow">NIL governance</p><h2>Education before monetization</h2>
              <p>Record opportunities, agreements, disclosure state, human compliance decisions, payments, and deliverables. Earnings are never guaranteed.</p>
              <PlaybookButton onClick={() => setTab("nil")}>Open NIL workspace</PlaybookButton>
            </PlaybookCard>
          </section>
        </>
      )}

      {tab === "profile" && <ProfileWorkspace data={data} onSubmit={saveProfile} />}
      {tab === "recruiting" && <RecruitingWorkspace data={data} onSubmit={addRecruitingTarget} />}
      {tab === "nil" && (
        <NILWorkspace
          data={data}
          onDealSubmit={addNILOpportunity}
          onProfileSubmit={saveNILProfile}
          onAdvance={advanceNIL}
          onComplianceSubmit={submitCompliance}
        />
      )}
    </main>
  );
}

function Field({ label, name, defaultValue, required, type = "text", placeholder }: { label: string; name: string; defaultValue?: string | number | null; required?: boolean; type?: string; placeholder?: string }) {
  return <label className="athlete-os-field"><span>{label}</span><input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} /></label>;
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: readonly string[] }) {
  return <label className="athlete-os-field"><span>{label}</span><select name={name} defaultValue={defaultValue}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>;
}

function ProfileWorkspace({ data, onSubmit }: { data: ScholarAthleteDashboardData; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const profile = data.athleteProfile;
  return <section className="athlete-os-workspace"><div className="athlete-os-section-heading"><div><p className="athlete-os-eyebrow">Athlete Profile Application</p><h2>Athletic identity under your control</h2></div><PlaybookBadge>{profile?.visibility ?? "private"}</PlaybookBadge></div>
    <form className="athlete-os-form" onSubmit={onSubmit}>
      <Field label="Primary sport" name="sport" defaultValue={profile?.sport} required /><Field label="Secondary sport" name="secondarySport" defaultValue={profile?.secondarySport} />
      <Field label="Primary position" name="position" defaultValue={profile?.position} /><Field label="Secondary position" name="secondaryPosition" defaultValue={profile?.secondaryPosition} />
      <Field label="Graduation year" name="graduationYear" type="number" defaultValue={profile?.graduationYear ?? new Date().getFullYear() + 1} required />
      <SelectField label="Athlete level" name="athleteLevel" defaultValue={profile?.athleteLevel ?? "high_school"} options={ATHLETE_LEVELS} />
      <SelectField label="Governing path" name="governingPath" defaultValue={profile?.governingPath ?? "undecided"} options={["undecided","ncaa_d1","ncaa_d2","ncaa_d3","naia","juco"]} />
      <SelectField label="Audience" name="visibility" defaultValue={profile?.visibility ?? "private"} options={ATHLETE_VISIBILITY} />
      <Field label="Location" name="location" defaultValue={profile?.location} /><Field label="Highlight reel HTTPS URL" name="highlightUrl" type="url" defaultValue={profile?.highlightUrl} />
      <Field label="Teams (comma separated)" name="teams" defaultValue={profile?.teams.join(", ")} /><Field label="Leagues (comma separated)" name="leagues" defaultValue={profile?.leagues.join(", ")} />
      <Field label="Awards (comma separated)" name="awards" defaultValue={profile?.awards.join(", ")} /><Field label="Leadership (comma separated)" name="leadershipExperience" defaultValue={profile?.leadershipExperience.join(", ")} />
      <label className="athlete-os-field athlete-os-field--wide"><span>Athlete biography</span><textarea name="bio" rows={5} defaultValue={profile?.bio ?? ""} maxLength={1000} /></label>
      <div className="athlete-os-form-actions"><button className="playbook-button" type="submit">Save athlete profile</button><small>Self-reported updates never mark statistics or achievements verified.</small></div>
    </form>
  </section>;
}

function RecruitingWorkspace({ data, onSubmit }: { data: ScholarAthleteDashboardData; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className="athlete-os-workspace"><div className="athlete-os-section-heading"><div><p className="athlete-os-eyebrow">Recruiting Application</p><h2>Athlete-controlled pipeline</h2></div><PlaybookBadge>{data.recruitingTargets.length} programs</PlaybookBadge></div>
    <form className="athlete-os-form athlete-os-form--compact" onSubmit={onSubmit}>
      <Field label="School" name="schoolName" required /><Field label="Athletic program" name="athleticProgram" /><Field label="Division" name="division" />
      <Field label="Coach name" name="coachName" /><Field label="Coach email" name="coachEmail" type="email" />
      <SelectField label="Pipeline stage" name="stage" defaultValue="researching" options={["researching","watchlist","contacted","conversation","visit","offer","committed","closed"]} />
      <Field label="Next action" name="nextAction" /><Field label="Due date" name="nextActionDueAt" type="datetime-local" />
      <label className="athlete-os-field athlete-os-field--wide"><span>Private notes</span><textarea name="notes" rows={3} maxLength={2000} /></label>
      <div className="athlete-os-form-actions"><button className="playbook-button" type="submit">Add recruiting target</button><small>Tracking interest does not guarantee recruiting contact, an offer, or admission.</small></div>
    </form>
    <div className="athlete-os-list">{data.recruitingTargets.length === 0 ? <p className="athlete-os-empty">No programs yet. Add a program when you are ready to plan an athlete-owned next action.</p> : data.recruitingTargets.map((target) => <article key={target.id} className="athlete-os-list-card"><div><PlaybookBadge>{target.stage}</PlaybookBadge><h3>{target.schoolName}</h3><p>{[target.athleticProgram,target.division].filter(Boolean).join(" · ") || "Program details not set"}</p></div><dl><div><dt>Coach</dt><dd>{target.coachName ?? "Not recorded"}</dd></div><div><dt>Next action</dt><dd>{target.nextAction ?? "Choose a next action"}</dd></div></dl></article>)}</div>
  </section>;
}

function NILWorkspace({ data, onDealSubmit, onProfileSubmit, onAdvance, onComplianceSubmit }: { data: ScholarAthleteDashboardData; onDealSubmit: (event: FormEvent<HTMLFormElement>) => void; onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void; onAdvance: (deal: NILDealProjection) => void; onComplianceSubmit: (event: FormEvent<HTMLFormElement>, deal: NILDealProjection) => void }) {
  const nilProfile = data.nilProfile;
  return <section className="athlete-os-workspace"><div className="athlete-os-section-heading"><div><p className="athlete-os-eyebrow">NIL Operating System</p><h2>Brand, opportunity, compliance, and agency</h2></div><PlaybookBadge>{nilProfile?.discoverable ? "marketplace opt-in" : "not discoverable"}</PlaybookBadge></div>
    {!data.athleteProfile ? <p className="athlete-os-empty">Create your athlete profile before activating NIL identity or opportunity tracking.</p> : <form className="athlete-os-form" onSubmit={onProfileSubmit}>
      <label className="athlete-os-field athlete-os-field--wide"><span>Brand statement</span><textarea name="brandStatement" rows={3} defaultValue={nilProfile?.brandStatement ?? ""} maxLength={1000} /></label>
      <Field label="Brand values (comma separated)" name="brandValues" defaultValue={nilProfile?.brandValues.join(", ")} /><Field label="Brand categories" name="brandCategories" defaultValue={nilProfile?.brandCategories.join(", ")} />
      <Field label="Partnership interests" name="partnershipInterests" defaultValue={nilProfile?.partnershipInterests.join(", ")} />
      <SelectField label="NIL audience" name="nilVisibility" defaultValue={nilProfile?.visibility ?? "private"} options={["private","network","marketplace"]} />
      <label className="athlete-os-check"><input name="marketplaceConsent" type="checkbox" defaultChecked={Boolean(nilProfile?.marketplaceConsentAt)} /><span>I explicitly consent to the allowlisted marketplace profile projection.</span></label>
      <label className="athlete-os-check"><input name="discoverable" type="checkbox" defaultChecked={nilProfile?.discoverable} /><span>Make me discoverable to registered brand partners. Minor athletes also require verified guardian consent.</span></label>
      <div className="athlete-os-form-actions"><button className="playbook-button" type="submit">Save NIL identity</button><small>Audience demographics and private data are never included in brand discovery.</small></div>
    </form>}
    <div className="athlete-os-divider" />
    <h3>Record an opportunity</h3><form className="athlete-os-form athlete-os-form--compact" onSubmit={onDealSubmit}>
      <Field label="Brand or partner" name="brandName" required /><Field label="Opportunity title" name="opportunityTitle" required />
      <SelectField label="Opportunity type" name="opportunityType" defaultValue="sponsorship" options={NIL_OPPORTUNITY_TYPES} />
      <SelectField label="Compensation type" name="compensationType" defaultValue="" options={["","cash","product","equity","mixed"]} />
      <Field label="Tracked amount" name="compensationAmount" type="number" /><Field label="Source" name="sourceName" />
      <Field label="Source HTTPS URL" name="sourceUrl" type="url" /><Field label="State / jurisdiction" name="jurisdiction" /><Field label="Institution" name="institutionName" />
      <div className="athlete-os-form-actions"><button className="playbook-button" type="submit">Record NIL lead</button><small>Recording an opportunity does not guarantee selection, compensation, approval, or payment.</small></div>
    </form>
    <div className="athlete-os-list">{data.nilDeals.length === 0 ? <p className="athlete-os-empty">No NIL opportunities recorded. Education and profile development can continue without marketplace participation.</p> : data.nilDeals.map((deal) => <NILDealCard key={deal.id} deal={deal} onAdvance={onAdvance} onComplianceSubmit={onComplianceSubmit} />)}</div>
  </section>;
}

function NILDealCard({ deal, onAdvance, onComplianceSubmit }: { deal: NILDealProjection; onAdvance: (deal: NILDealProjection) => void; onComplianceSubmit: (event: FormEvent<HTMLFormElement>, deal: NILDealProjection) => void }) {
  const next = getNILNextStage(deal.stage);
  const complianceRequired = ["negotiation","review"].includes(deal.stage) && deal.complianceStatus !== "approved";
  const canAdvance = Boolean(next) && !(next === "signed" && deal.complianceStatus !== "approved");
  return <article className="athlete-os-list-card athlete-os-list-card--nil"><div><div className="athlete-os-badges"><PlaybookBadge>{deal.stage}</PlaybookBadge><PlaybookBadge>{deal.complianceStatus}</PlaybookBadge></div><h3>{deal.opportunityTitle}</h3><p>{deal.brandName} · {deal.opportunityType.replaceAll("_", " ")}</p></div>
    <dl><div><dt>Agreement</dt><dd>{deal.contractStatus}</dd></div><div><dt>Disclosure</dt><dd>{deal.disclosureStatus}</dd></div><div><dt>Payment</dt><dd>{deal.paymentStatus}</dd></div></dl>
    {complianceRequired && <form className="athlete-os-compliance" onSubmit={(event) => onComplianceSubmit(event, deal)}><strong>Submit compliance package</strong><Field label="Agreement reference" name="agreementReference" required /><Field label="Jurisdiction" name="jurisdiction" defaultValue={deal.jurisdiction} required /><Field label="Institution" name="institutionName" defaultValue={deal.institutionName} /><Field label="Submission reason" name="reason" required /><button className="playbook-button" type="submit">Submit for human review</button></form>}
    {canAdvance && <button className="playbook-button playbook-button--secondary" type="button" onClick={() => onAdvance(deal)}>Advance to {next?.replaceAll("_", " ")}</button>}
    {next === "signed" && !canAdvance && <p className="athlete-os-guardrail">Signed and active stages remain locked until an authorized compliance reviewer approves the submitted agreement.</p>}
  </article>;
}
