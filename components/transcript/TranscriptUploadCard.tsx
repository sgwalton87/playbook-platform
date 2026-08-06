"use client";

import { useRef, useState } from "react";

export default function TranscriptUploadCard({ onParsed }: { onParsed?: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("Upload a PDF or image transcript.");
  const [busy, setBusy] = useState(false);

  async function fileToBase64(file: File) {
    const buffer = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function handleFile(file?: File) {
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) { setStatus("Transcript must be 12 MB or smaller."); return; }

    setBusy(true);
    setStatus("Reading transcript...");

    const base64 = await fileToBase64(file);

    const res = await fetch("/api/parse-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, mediaType: file.type || "application/pdf" }),
    });

    const json = await res.json();

    if (!res.ok) {
      setStatus(json.error || "Could not parse transcript. Try another file.");
    } else {
      setStatus(`Transcript parsed. ${json.agUpdates || 0} A-G areas updated. Refreshing tracker...`);
      onParsed?.();
    }

    setBusy(false);
  }

  return (
    <section style={card}>
      <div>
        <div style={eyebrow}>Transcript Upload</div>
        <h2 style={title}>Upload transcript to activate A–G intelligence</h2>
        <p style={body}>
          Playbook reads the transcript, updates A–G progress, and powers Compass,
          opportunities, applications, and scholar-athlete readiness.
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
        {busy ? "Reading..." : "Upload Transcript"}
      </button>

      <p role="status" aria-live="polite" style={statusStyle}>{status}</p>
    </section>
  );
}

const card: React.CSSProperties = {
  background: "#0F172A",
  color: "#F8F7F4",
  borderRadius: 22,
  padding: 24,
  marginBottom: 20,
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "#F4B942",
  marginBottom: 8,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.05,
};

const body: React.CSSProperties = {
  color: "rgba(248,247,244,.72)",
  lineHeight: 1.6,
};

const button: React.CSSProperties = {
  background: "#F4B942",
  color: "#0F172A",
  border: "none",
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer",
};

const statusStyle: React.CSSProperties = {
  color: "rgba(248,247,244,.72)",
  fontSize: 13,
  marginTop: 12,
};
