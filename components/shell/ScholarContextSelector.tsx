"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Context = { relationshipId: string; scholarId: string; relationship: string; scholar: { full_name?: string | null; username?: string | null } };

export default function ScholarContextSelector() {
  const router = useRouter();
  const [contexts, setContexts] = useState<Context[]>([]);
  const [activeScholarId, setActiveScholarId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/scholar-context").then(async (response) => response.ok ? response.json() : null).then((result) => {
      if (!result) return;
      setContexts(result.contexts || []);
      setActiveScholarId(result.activeScholarId || "");
    });
  }, []);

  if (contexts.length === 0) return null;
  return <label className="playbook-section-label" style={{ display: "grid", gap: 6 }}>
    Active Scholar
    <select value={activeScholarId} disabled={saving} onChange={async (event) => {
      const scholarId = event.target.value;
      setSaving(true);
      const response = await fetch("/api/scholar-context", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scholarId }) });
      if (response.ok) { setActiveScholarId(scholarId); router.refresh(); }
      setSaving(false);
    }}>
      <option value="">Select a Scholar</option>
      {contexts.map((context) => <option key={context.relationshipId} value={context.scholarId}>{context.scholar.full_name || context.scholar.username || "Scholar"} · {context.relationship.replaceAll("_", " ")}</option>)}
    </select>
  </label>;
}
