"use client";

import { useRef, useState } from "react";

const SUBJECTS = [
  ["A", "History / Social Science", 2],
  ["B", "English", 4],
  ["C", "Mathematics", 3],
  ["D", "Laboratory Science", 2],
  ["E", "Language Other Than English", 2],
  ["F", "Visual & Performing Arts", 1],
  ["G", "College-Preparatory Elective", 1],
] as const;

type DraftSubject = {
  years_required: number;
  years_completed: number;
  in_progress: boolean;
  courses_taken: string[];
  current_course: string | null;
};
type Draft = Record<string, DraftSubject>;

export default function TranscriptUploadCard({ onParsed }: { onParsed?: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("Upload a PDF or image transcript. Nothing updates your A–G record until you confirm the extracted coursework.");
  const [busy, setBusy] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  async function fileToBase64(file: File) {
    const buffer = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function updateSubject(key: string, patch: Partial<DraftSubject>) {
    setDraft(current => current ? { ...current, [key]: { ...current[key], ...patch } } : current);
  }

  async function handleFile(file?: File) {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) { setStatus("Transcript must be 12 MB or smaller."); return; }

    setBusy(true);
    setDraft(null);
    setSubmissionId(null);
    setStatus("Securing and analyzing transcript evidence...");

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/parse-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType: file.type || "application/pdf", fileName: file.name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus(json.error || "Could not analyze transcript. Try another file.");
      } else {
        setSubmissionId(json.submissionId);
        setDraft(json.draft);
        setStatus(json.reviewStatus === "CONFIRMED"
          ? "This exact transcript is already confirmed. You can review the stored extraction below."
          : `Analysis complete using ${json.parsingMode === "ANTHROPIC" ? "transcript intelligence" : "local text-PDF parsing"}. Review every category before confirming.`);
      }
    } catch {
      setStatus("Could not analyze transcript. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmTranscript() {
    if (!submissionId || !draft) return;
    setBusy(true);
    setStatus("Confirming reviewed coursework and updating A–G readiness...");
    try {
      const res = await fetch("/api/confirm-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, draft }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus(json.error || "Could not confirm transcript review.");
      } else {
        setStatus(`Confirmed. ${json.agUpdates || 0} A–G areas updated from scholar-reviewed transcript evidence.`);
        onParsed?.();
      }
    } catch {
      setStatus("Could not confirm transcript review. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={card}>
      <div>
        <div style={eyebrow}>Transcript Intelligence · Phase 9</div>
        <h2 style={title}>Upload. Review. Confirm your academic record.</h2>
        <p style={body}>
          Playbook stores the source transcript privately, extracts A–G coursework, and requires your review before anything changes your readiness record.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button disabled={busy} onClick={() => inputRef.current?.click()} style={button}>
        {busy ? "Working..." : draft ? "Choose Different Transcript" : "Upload Transcript"}
      </button>

      <p role="status" aria-live="polite" style={statusStyle}>{status}</p>

      {draft && (
        <div style={reviewPanel}>
          <div style={{ marginBottom: 14 }}>
            <div style={reviewEyebrow}>Scholar review required</div>
            <h3 style={reviewTitle}>Verify the extracted coursework</h3>
            <p style={reviewCopy}>Correct any course names or completion totals before confirming. Parsed data is a draft until you approve it.</p>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {SUBJECTS.map(([key, name, required]) => {
              const value = draft[key] ?? { years_required: required, years_completed: 0, in_progress: false, courses_taken: [], current_course: null };
              return (
                <div key={key} style={subjectCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <strong>{key} · {name}</strong>
                    <span style={{ fontSize: 12, opacity: .65 }}>{required} year{required === 1 ? "" : "s"} required</span>
                  </div>
                  <div style={fieldGrid}>
                    <label style={label}>Years completed
                      <input
                        aria-label={`${key} years completed`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={value.years_completed}
                        onChange={event => updateSubject(key, { years_completed: Math.max(0, Number(event.target.value) || 0) })}
                        style={input}
                      />
                    </label>
                    <label style={label}>Current / in-progress course
                      <input
                        aria-label={`${key} current course`}
                        value={value.current_course ?? ""}
                        onChange={event => updateSubject(key, { current_course: event.target.value || null, in_progress: Boolean(event.target.value) })}
                        style={input}
                        placeholder="Optional"
                      />
                    </label>
                  </div>
                  <label style={label}>Completed courses · one per line
                    <textarea
                      aria-label={`${key} completed courses`}
                      value={value.courses_taken.join("\n")}
                      onChange={event => updateSubject(key, { courses_taken: event.target.value.split("\n").map(item => item.trim()).filter(Boolean) })}
                      style={textarea}
                      rows={Math.max(2, Math.min(5, value.courses_taken.length + 1))}
                    />
                  </label>
                </div>
              );
            })}
          </div>

          <button disabled={busy} onClick={confirmTranscript} style={confirmButton}>
            {busy ? "Confirming..." : "Confirm Transcript & Update A–G"}
          </button>
        </div>
      )}
    </section>
  );
}

const card: React.CSSProperties = { background: "#0F172A", color: "#F8F7F4", borderRadius: 22, padding: 24, marginBottom: 20 };
const eyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "#F4B942", marginBottom: 8 };
const title: React.CSSProperties = { margin: 0, fontSize: 28, lineHeight: 1.05 };
const body: React.CSSProperties = { color: "rgba(248,247,244,.72)", lineHeight: 1.6, maxWidth: 760 };
const button: React.CSSProperties = { background: "#F4B942", color: "#0F172A", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const statusStyle: React.CSSProperties = { color: "rgba(248,247,244,.72)", fontSize: 13, marginTop: 12, lineHeight: 1.5 };
const reviewPanel: React.CSSProperties = { marginTop: 20, background: "#F8F7F4", color: "#0F172A", borderRadius: 18, padding: 18 };
const reviewEyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#C25E18", fontWeight: 700 };
const reviewTitle: React.CSSProperties = { margin: "4px 0 4px", fontSize: 22 };
const reviewCopy: React.CSSProperties = { margin: 0, color: "#64748B", lineHeight: 1.5, fontSize: 13 };
const subjectCard: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 14, padding: 14, background: "#FFFFFF" };
const fieldGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginTop: 10 };
const label: React.CSSProperties = { display: "grid", gap: 5, fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".04em", marginTop: 8 };
const input: React.CSSProperties = { width: "100%", border: "1px solid #CBD5E1", borderRadius: 10, padding: "9px 10px", font: "inherit", color: "#0F172A", background: "#FFFFFF", textTransform: "none", letterSpacing: 0 };
const textarea: React.CSSProperties = { ...input, resize: "vertical", minHeight: 64 };
const confirmButton: React.CSSProperties = { marginTop: 16, width: "100%", background: "#10B981", color: "#052E23", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
