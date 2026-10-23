"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Relationship = {
  id: string;
  scholar_id: string;
  supporter_id: string | null;
  avatar_url?: string | null;
  supporter_name: string | null;
  supporter_email: string;
  relationship: string;
  status: string;
  perspective: "scholar" | "supporter";
};

export default function SupportNetworkMap() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    void fetch("/api/support-relationships", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Cannot load Support Network.");
        if (mounted) {
          setUserId(result.userId);
          setRelationships((result.relationships || []).filter((item: Relationship) => item.status === "active" && item.supporter_id));
        }
      })
      .catch((failure) => { if (mounted) setError(failure instanceof Error ? failure.message : "Support Network unavailable."); });
    return () => { mounted = false; };
  }, []);

  const network = relationships.filter((item) => item.scholar_id === userId);
  return (
    <section style={{ padding: "20px 16px 170px", background: "#F8F7F4", color: "#0F172A" }} data-testid="live-support-network-map">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(28px,6vw,44px)", overflowWrap: "anywhere" }}>Your Support Network</h1>
        <p>Only accepted, active connections appear here. Pending invitations and restricted relationships do not grant access.</p>
        {error && <p role="alert">{error}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "center", padding: 24, background: "#EAF1F9", borderRadius: 24 }}>
          <div style={{ width: 118, height: 118, borderRadius: "50%", background: "#0F172A", color: "white", display: "grid", placeItems: "center", textAlign: "center", fontWeight: 800 }}>Scholar Record</div>
          {network.map((person) => (
            <div key={person.id} style={{ width: 128, display: "grid", justifyItems: "center", gap: 6, textAlign: "center" }}>
              <div role="img" aria-label={person.supporter_name || "Supporter"} style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#F97316", color: "white", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 24 }}>
                {person.avatar_url ? <Image src={person.avatar_url} width={72} height={72} unoptimized alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (person.supporter_name || person.supporter_email).trim().slice(0, 1).toUpperCase()}
              </div>
              <strong style={{ fontSize: 13, overflowWrap: "anywhere" }}>{person.supporter_name || person.supporter_email}</strong>
              <small>{person.relationship.replaceAll("_", " ")}</small>
              <Link href={`/messages?peer=${encodeURIComponent(person.supporter_id || "")}`} style={{ fontSize: 12 }}>Message supporter</Link>
            </div>
          ))}
          {!error && userId && network.length === 0 && <p>No active supporters yet. Start by inviting someone to your network.</p>}
        </div>
        <Link href="/invitations" style={{ display: "inline-block", marginTop: 18, padding: 12, background: "#F97316", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 800 }}>Invite a supporter</Link>
        <p style={{ fontSize: 13 }}>A connection becomes available for direct messaging only when its relationship is active and the messaging authority contract permits it.</p>
      </div>
    </section>
  );
}
