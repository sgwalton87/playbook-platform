"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileAvatar from "@/components/ProfileAvatar";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type DirectoryPerson = { id: string; username: string | null; full_name: string | null; first_name: string | null; last_name: string | null; role: string | null; avatar_url: string | null; school: string | null; sport: string | null };
type Person = DirectoryPerson & { name: string; connected: boolean; requested: boolean; incoming: boolean; outgoingRequestId: string | null; incomingRequestId: string | null };
type Tab = "discover" | "connected" | "requests";

function personName(person: DirectoryPerson) { return person.full_name || [person.first_name, person.last_name].filter(Boolean).join(" ") || person.username || "Playbook member"; }
function roleLabel(role: string | null) { return String(role || "member").replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function chunks<T>(items: T[], size: number) { const result: T[][] = []; for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size)); return result; }

export default function ConnectionsPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [tab, setTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading your governed network…");
  const [error, setError] = useState("");

  const loadNetwork = useCallback(async (discoverySearch = "") => {
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) { router.replace("/login?next=/connections"); return; }
    const normalizedSearch = discoverySearch.trim();
    const [connectionsResult, sentResult, incomingResult, directoryResult] = await Promise.all([
      supabase.from("user_connections").select("connected_user_id").eq("user_id", user.id),
      supabase.from("connection_requests").select("id,recipient_id").eq("requester_id", user.id).eq("status", "pending"),
      supabase.from("connection_requests").select("id,requester_id").eq("recipient_id", user.id).eq("status", "pending"),
      supabase.rpc("get_public_network_directory", { search_text: normalizedSearch || null, result_limit: 100 }),
    ]);
    const firstError = connectionsResult.error || sentResult.error || incomingResult.error || directoryResult.error;
    if (firstError) throw new Error(firstError.message);
    const connectedIds = new Set((connectionsResult.data || []).map((row) => row.connected_user_id));
    const sentRequests = new Map((sentResult.data || []).map((row) => [row.recipient_id, row.id]));
    const incomingRequests = new Map((incomingResult.data || []).map((row) => [row.requester_id, row.id]));
    const relationshipIds = [...new Set([...connectedIds, ...sentRequests.keys(), ...incomingRequests.keys()])];
    const relationshipIdentityResults = await Promise.all(
      chunks(relationshipIds, 100).map((requestedIds) => supabase.rpc("get_network_member_identities", { requested_ids: requestedIds }))
    );
    const identityError = relationshipIdentityResults.find((result) => result.error)?.error;
    if (identityError) throw new Error(identityError.message);
    const byId = new Map<string, DirectoryPerson>();
    for (const person of (directoryResult.data || []) as DirectoryPerson[]) byId.set(person.id, person);
    for (const result of relationshipIdentityResults) {
      for (const person of (result.data || []) as DirectoryPerson[]) byId.set(person.id, person);
    }
    const next = [...byId.values()].map((person): Person => ({
      ...person,
      name: personName(person),
      connected: connectedIds.has(person.id),
      requested: sentRequests.has(person.id),
      incoming: incomingRequests.has(person.id),
      outgoingRequestId: sentRequests.get(person.id) || null,
      incomingRequestId: incomingRequests.get(person.id) || null,
    }));
    setPeople(next);
    setMessage(next.length ? (normalizedSearch ? `Showing Network results for “${normalizedSearch}”.` : "Network state is current.") : (normalizedSearch ? `No Network members match “${normalizedSearch}”.` : "No discoverable members or connection requests yet."));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const discoverySearch = tab === "discover" ? search : "";
    const id = window.setTimeout(() => {
      setLoading(true);
      void loadNetwork(discoverySearch).catch((cause) => { setError(cause instanceof Error ? cause.message : "Network could not be loaded."); setLoading(false); });
    }, tab === "discover" && search.trim() ? 250 : 0);
    return () => window.clearTimeout(id);
  }, [loadNetwork, search, tab]);

  async function mutate(action: "connect" | "cancel" | "accept" | "decline" | "disconnect", person: Person) {
    setBusy(person.id); setError("");
    try {
      if (action === "connect") {
        const result = await supabase.rpc("send_connection_request", { requested_recipient_id: person.id, requested_message: null });
        if (result.error) throw result.error;
      } else if (action === "cancel") {
        if (!person.outgoingRequestId) throw new Error("The outgoing request is no longer available. Refresh your Network and try again.");
        const result = await supabase.rpc("cancel_connection_request", { requested_request_id: person.outgoingRequestId });
        if (result.error) throw result.error;
      } else if (action === "accept" || action === "decline") {
        if (!person.incomingRequestId) throw new Error("The incoming request is no longer available. Refresh your Network and try again.");
        const result = await supabase.rpc("respond_to_connection_request", {
          requested_request_id: person.incomingRequestId,
          requested_decision: action === "accept" ? "accepted" : "declined",
        });
        if (result.error) throw result.error;
      } else {
        const result = await supabase.rpc("remove_connection", { requested_user_id: person.id });
        if (result.error) throw result.error;
      }
      await loadNetwork(tab === "discover" ? search : "");
      setMessage(action === "accept" ? "Connection accepted." : action === "connect" ? "Connection request sent." : action === "decline" ? "Connection request declined." : action === "cancel" ? "Connection request cancelled." : "Connection removed.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Network action failed."); }
    finally { setBusy(null); }
  }

  const discovered = people.filter((person) => !person.connected && !person.incoming);
  const connected = people.filter((person) => person.connected);
  const incoming = people.filter((person) => person.incoming);
  const source = tab === "discover" ? discovered : tab === "connected" ? connected : incoming;
  const visible = useMemo(() => {
    if (tab === "discover") return source;
    const query = search.trim().toLowerCase();
    if (!query) return source;
    return source.filter((person) => [person.name, person.username, person.role, person.school, person.sport].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [search, source, tab]);

  return <PlaybookPage>
    <PlaybookHero eyebrow="Playbook Network" title="Build the people around your next move" subtitle="Discover public Playbook members, manage connection requests, and keep relationship identity separate from private Scholar data." />
    <PlaybookMetrics><PlaybookMetric label="Connected" value={String(connected.length)} /><PlaybookMetric label="Incoming" value={String(incoming.length)} /><PlaybookMetric label="Discovery results" value={String(discovered.length)} /></PlaybookMetrics>
    <div role="status" aria-live="polite" style={status}>{loading ? "Loading…" : message}</div>
    {error && <div role="alert" style={alert}>{error} <button onClick={() => void loadNetwork(tab === "discover" ? search : "")}>Retry</button></div>}
    <section style={toolbar} aria-label="Network controls"><div style={tabs}>{(["discover", "connected", "requests"] as Tab[]).map((value) => <button key={value} type="button" onClick={() => setTab(value)} aria-pressed={tab === value} style={tab === value ? activeTab : tabButton}>{value === "discover" ? "Discover" : value === "connected" ? "Connected" : "Requests"}</button>)}</div><input aria-label="Search network" placeholder="Search name, role, school, or sport" value={search} onChange={(event) => setSearch(event.target.value)} style={searchInput} /></section>
    {!loading && visible.length === 0 ? <PlaybookCard eyebrow="Network" title="Nothing in this view yet"><p style={copy}>Public discovery respects profile visibility and active publication consent. Existing and pending connection partners remain resolvable through a separate relationship-aware identity boundary.</p></PlaybookCard> : <PlaybookGrid min={280}>{visible.map((person) => <PlaybookCard key={person.id} eyebrow={roleLabel(person.role)} title={person.name}><div style={identityRow}><ProfileAvatar src={person.avatar_url} name={person.name} size={54} /><div><p style={copy}>{person.school || "Playbook Network"}{person.sport ? ` · ${person.sport}` : ""}</p>{person.username && <Link href={`/u/${person.username}`} style={profileLink}>@{person.username}</Link>}</div></div><div style={actions}>{person.connected ? <><PlaybookPill>Connected</PlaybookPill><button disabled={busy === person.id} onClick={() => void mutate("disconnect", person)} style={secondaryButton}>Disconnect</button></> : person.incoming ? <><button disabled={busy === person.id} onClick={() => void mutate("accept", person)} style={primaryButton}>Accept</button><button disabled={busy === person.id} onClick={() => void mutate("decline", person)} style={secondaryButton}>Decline</button></> : person.requested ? <><PlaybookPill>Requested</PlaybookPill><button disabled={busy === person.id} onClick={() => void mutate("cancel", person)} style={secondaryButton}>Cancel request</button></> : <button disabled={busy === person.id} onClick={() => void mutate("connect", person)} style={primaryButton}>Connect</button>}</div></PlaybookCard>)}</PlaybookGrid>}
  </PlaybookPage>;
}

const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 12px", color: "#334155" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", padding: 12, borderRadius: 12, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B" };
const toolbar: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" };
const tabs: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const tabButton: React.CSSProperties = { border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", borderRadius: 999, padding: "10px 14px", fontWeight: 850, cursor: "pointer" };
const activeTab: React.CSSProperties = { ...tabButton, background: "#0F172A", color: "#FFFFFF", borderColor: "#0F172A" };
const searchInput: React.CSSProperties = { flex: "1 1 300px", maxWidth: 460, border: "1px solid #CBD5E1", borderRadius: 14, padding: "12px 14px", background: "#FFFFFF", color: "#0F172A" };
const identityRow: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", marginBottom: 16 };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.55, margin: 0 };
const profileLink: React.CSSProperties = { display: "inline-block", marginTop: 5, color: "#EA580C", fontWeight: 850, textDecoration: "none" };
const actions: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF" };
const secondaryButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" };
