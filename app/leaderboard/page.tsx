"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

/**
 * DYN-001 fail-closed scoreboard:
 * This route does not manufacture members, rank, school, XP or coin history.
 * The same governed reward ledger service as /store provides only the
 * authenticated caller's counts. Public standings require a separately
 * reviewed opt-in projection, privacy proof and release certification.
 */
type RewardSummary = { xp: number; balance: number };
type RewardEnvelope = { xp?: unknown; balance?: unknown; error?: string };

function safeCount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/rewards/store", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      const result = await response.json() as RewardEnvelope;
      if (!response.ok) throw new Error(result.error || "Your reward summary is unavailable.");
      const xp = safeCount(result.xp);
      const balance = safeCount(result.balance);
      if (xp === null || balance === null) throw new Error("The reward service returned incomplete data.");
      setSummary({ xp, balance });
      setState("ready");
    } catch (cause) {
      setSummary(null);
      setError(cause instanceof Error ? cause.message : "Your reward summary is unavailable.");
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    // Schedule the initial load after the effect to avoid synchronous state cascades.
    void Promise.resolve().then(() => load());
  }, [load]);

  return (
    <PlaybookPage>
      <div data-testid="truthful-rewards-standings" data-visual-canon="PBOS-DYN-001">
        <PlaybookHero
          eyebrow="Playbook Rewards"
          title="Your progress, backed by real activity."
          subtitle="Your earned XP and coin balance are read from your private reward ledger. Playbook will never show fictional classmates, schools, rankings or fabricated progress as your own."
        />
        <PlaybookMetrics>
          <PlaybookMetric label="Your verified XP" value={state === "ready" ? String(summary?.xp ?? 0) : state === "loading" ? "…" : "Unavailable"} />
          <PlaybookMetric label="Your current coins" value={state === "ready" ? String(summary?.balance ?? 0) : state === "loading" ? "…" : "Unavailable"} />
          <PlaybookMetric label="Your public rank" value="Not available" />
        </PlaybookMetrics>
        <div role="status" aria-live="polite" style={{ maxWidth: 1180, margin: "0 auto 16px" }}>
          {state === "loading" ? "Loading your private rewards…" : state === "ready" ? "Reward totals loaded from the authenticated ledger." : null}
        </div>
        {state === "error" && (
          <div role="alert" style={{ maxWidth: 1180, margin: "0 auto 16px", padding: 16, background: "#FEF2F2", borderRadius: 12 }}>
            <p>{error}</p>
            <button type="button" onClick={() => void load()} style={{ padding: "8px 16px", cursor: "pointer" }}>Retry</button>
          </div>
        )}
        <PlaybookGrid min={300}>
          <PlaybookCard eyebrow="Public rankings" title="Rankings aren't published yet">
            <p>Playbook has not certified a privacy-safe, opt-in public leaderboard. Only your own reward totals are displayed. No other member&apos;s identity, school, or progress is exposed here.</p>
            <p>When a governed ranking service is approved, it must use real ledger events, explicit member consent, bounded public identity and verified rank computation.</p>
          </PlaybookCard>
          <PlaybookCard eyebrow="Keep building" title="Earn authentic progress">
            <p>Complete real learning modules and authorized milestones to earn rewards. Totals refresh from the same reward service used by the Store.</p>
            <p><Link href="/courses">Explore courses</Link> · <Link href="/reward-economy">Reward economy</Link> · <Link href="/store">Reward Store</Link></p>
            <button type="button" onClick={() => void load()} disabled={state === "loading"} style={{ padding: "8px 16px", cursor: "pointer" }}>
              {state === "loading" ? "Refreshing…" : "Refresh my progress"}
            </button>
          </PlaybookCard>
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}
