"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";

type RecommenderRequest = {
  id: string;
  scholar_name: string;
  recommender_name: string;
  recommender_role: string;
  opportunity_name: string;
  status: string;
  letter_text: string | null;
  created_at: string;
  approved_at: string | null;
};
type ResponseEnvelope = { ok?: boolean; request?: RecommenderRequest; error?: string };

export default function RecommenderApprovalPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params?.requestId ?? "";
  const router = useRouter();
  const [record, setRecord] = useState<RecommenderRequest | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!requestId) return;
    setState("loading");
    setError("");
    setRecord(null);
    try {
      const response = await fetch(`/api/recommenders/${encodeURIComponent(requestId)}`, { cache: "no-store" });
      if (response.status === 401) { router.replace("/login"); return; }
      if (response.status === 404) { setState("missing"); return; }
      const payload = await response.json() as ResponseEnvelope;
      if (!response.ok || !payload.ok || !payload.request) {
        throw new Error(payload.error || "Recommendation request could not be loaded.");
      }
      setRecord(payload.request);
      setState("ready");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Recommendation request could not be loaded.");
      setState("error");
    }
  }, [requestId, router]);

  useEffect(() => { void Promise.resolve().then(() => load()); }, [load]);

  return (
    <PlaybookPage>
      <div data-testid="governed-recommendation-request">
        <PlaybookHero
          eyebrow="Recommendation Request"
          title={record ? `Recommendation for ${record.scholar_name}` : "Your recommendation request"}
          subtitle="Requests are loaded from Playbook's authenticated, permission-scoped records. A demonstration letter or local approval is never presented as a real decision."
        />
        {state === "loading" && <p role="status">Loading the authorized request…</p>}
        {state === "missing" && (
          <PlaybookCard eyebrow="Unavailable" title="Request not found">
            <p>This request does not exist or is not accessible to the signed-in account. No Scholar information is exposed.</p>
            <Link href="/application-workspaces">Return to application workspaces</Link>
          </PlaybookCard>
        )}
        {state === "error" && (
          <PlaybookCard eyebrow="Error" title="Unable to load request">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => void load()}>Retry request</button>
          </PlaybookCard>
        )}
        {state === "ready" && record && (
          <PlaybookGrid min={320}>
            <PlaybookCard eyebrow="Actual saved request" title={record.opportunity_name}>
              <p><strong>Scholar:</strong> {record.scholar_name}</p>
              <p><strong>Recommender:</strong> {record.recommender_name}</p>
              <p><strong>Role:</strong> {record.recommender_role}</p>
              <PlaybookPill>{record.status.replaceAll("_", " ")}</PlaybookPill>
              <p><strong>Created:</strong> {new Date(record.created_at).toLocaleDateString()}</p>
            </PlaybookCard>
            <PlaybookCard eyebrow="Submitted letter" title={record.letter_text ? "Saved letter text" : "No letter submitted"}>
              {record.letter_text ? <p style={{ whiteSpace: "pre-wrap" }}>{record.letter_text}</p> : <p>No final recommendation letter is saved for this request.</p>}
              <p>Approve and request-revision actions are unavailable until versioned letter submission, Scholar consent, decision authority and durable review receipts are certified. No status is changed by viewing this page.</p>
              <p><Link href="/application-workspaces">Open application workspaces</Link></p>
            </PlaybookCard>
          </PlaybookGrid>
        )}
      </div>
    </PlaybookPage>
  );
}
