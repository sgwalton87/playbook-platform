"use client";

import Link from "next/link";
import SupportNetworkLiveCenter from "@/components/support-network-live/SupportNetworkLiveCenter";

export default function PlaybookInbox() {
  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Playbook Inbox</p>
        <h1 style={title}>Messages, support threads, and shared actions.</h1>
        <p style={sub}>
          This is the free-flowing inbox for scholars and their support network.
        </p>

        <div style={actions}>
          <Link href="/support-messages" style={button}>Open support thread →</Link>
          <Link href="/scholar-network" style={secondary}>View scholar network →</Link>
        </div>
      </section>

      <SupportNetworkLiveCenter />
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
};

const hero: React.CSSProperties = {
  margin: 32,
  background: "#0F172A",
  color: "#fff",
  borderRadius: 30,
  padding: 34,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 950,
  color: "#F97316",
  margin: 0,
};

const title: React.CSSProperties = {
  fontSize: 52,
  lineHeight: 1,
  margin: "12px 0",
};

const sub: React.CSSProperties = {
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 18,
};

const button: React.CSSProperties = {
  background: "#F97316",
  color: "#fff",
  borderRadius: 999,
  padding: "10px 13px",
  textDecoration: "none",
  fontWeight: 900,
};

const secondary: React.CSSProperties = {
  background: "#fff",
  color: "#0F172A",
  borderRadius: 999,
  padding: "10px 13px",
  textDecoration: "none",
  fontWeight: 900,
};
