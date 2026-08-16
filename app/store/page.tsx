"use client";

import { useEffect, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type StoreItem = { id: string; name: string; description: string; coin_cost: number; inventory: number | null; fulfillment_type: string; status: string; image_url: string | null };
type Redemption = { id: string; item_id: string; coin_cost: number; status: string; redeemed_at: string; fulfilled_at: string | null };
type StoreResponse = { items?: StoreItem[]; redemptions?: Redemption[]; balance?: number; xp?: number; error?: string };

async function getStore(): Promise<StoreResponse> {
  const response = await fetch("/api/rewards/store", { cache: "no-store" });
  const result = await response.json() as StoreResponse;
  if (!response.ok) throw new Error(result.error || "Reward Store could not be loaded.");
  return result;
}

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [balance, setBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading governed reward balance…");
  const [error, setError] = useState("");

  async function load() {
    const result = await getStore();
    setItems(result.items || []);
    setRedemptions(result.redemptions || []);
    setBalance(result.balance || 0);
    setXp(result.xp || 0);
    setMessage("Reward balance and inventory are current.");
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    void getStore().then((result) => {
      if (!active) return;
      setItems(result.items || []); setRedemptions(result.redemptions || []); setBalance(result.balance || 0); setXp(result.xp || 0);
      setMessage("Reward balance and inventory are current.");
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Reward Store could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function redeem(item: StoreItem) {
    setBusy(item.id); setError("");
    try {
      const response = await fetch("/api/rewards/store", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId: item.id }) });
      const result = await response.json() as { redemption?: { remaining_coins?: number; redemption_status?: string }; error?: string };
      if (!response.ok) throw new Error(result.error || "Reward could not be redeemed.");
      setMessage(`${item.name} redeemed. Fulfillment status: ${result.redemption?.redemption_status || "pending"}.`);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Reward could not be redeemed."); }
    finally { setBusy(null); }
  }

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook Reward Store" title="Spend what you actually earned" subtitle="Coins come from the audited reward ledger. Redemptions are durable transactions with inventory and fulfillment state—not a front-end counter." />
      <PlaybookMetrics>
        <PlaybookMetric label="Coin balance" value={loading ? "…" : String(balance)} />
        <PlaybookMetric label="XP earned" value={loading ? "…" : String(xp)} />
        <PlaybookMetric label="Redemptions" value={loading ? "…" : String(redemptions.length)} />
        <PlaybookMetric label="Available rewards" value={loading ? "…" : String(items.length)} />
      </PlaybookMetrics>
      <p role="status" aria-live="polite" style={status}>{loading ? "Loading…" : message}</p>
      {error && <div role="alert" style={alert}>{error} <button onClick={() => void load()}>Retry</button></div>}

      <PlaybookGrid min={300}>
        {items.map((item) => {
          const affordable = balance >= item.coin_cost;
          const available = item.inventory == null || item.inventory > 0;
          return <PlaybookCard key={item.id} eyebrow={item.fulfillment_type} title={item.name}>
            <div style={price}>{item.coin_cost}<span> coins</span></div>
            <p style={copy}>{item.description}</p>
            <div style={pillRow}><PlaybookPill>{item.inventory == null ? "No fixed inventory" : `${item.inventory} remaining`}</PlaybookPill><PlaybookPill>{item.fulfillment_type}</PlaybookPill></div>
            <button type="button" disabled={busy === item.id || !affordable || !available} onClick={() => void redeem(item)} style={affordable && available ? primaryButton : disabledButton}>
              {busy === item.id ? "Redeeming…" : !available ? "Out of stock" : affordable ? "Redeem reward" : `Need ${item.coin_cost - balance} more coins`}
            </button>
          </PlaybookCard>;
        })}
      </PlaybookGrid>

      <section style={sectionHeader}><p style={eyebrow}>Your redemption history</p><h2 style={heading}>Fulfillment is visible</h2></section>
      {redemptions.length === 0 ? <PlaybookCard eyebrow="Reward history" title="No redemptions yet"><p style={copy}>Complete governed learning and milestone actions to earn coins, then redeem when you have enough.</p></PlaybookCard> :
        <PlaybookGrid min={290}>{redemptions.map((redemption) => {
          const item = items.find((entry) => entry.id === redemption.item_id);
          return <PlaybookCard key={redemption.id} eyebrow={redemption.status} title={item?.name || redemption.item_id}><PlaybookPill>{redemption.coin_cost} coins</PlaybookPill><p style={copy}>Redeemed {new Date(redemption.redeemed_at).toLocaleString()}</p>{redemption.fulfilled_at && <p style={copy}>Fulfilled {new Date(redemption.fulfilled_at).toLocaleString()}</p>}</PlaybookCard>;
        })}</PlaybookGrid>}
    </PlaybookPage>
  );
}

const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", color: "#334155" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", padding: 13, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" };
const price: React.CSSProperties = { color: "#F97316", fontSize: 38, fontWeight: 950, lineHeight: 1, margin: "8px 0 14px" };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const pillRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", margin: "14px 0" };
const baseButton: React.CSSProperties = { width: "100%", borderRadius: 999, padding: "11px 14px", fontWeight: 900 };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF", cursor: "pointer" };
const disabledButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" };
const sectionHeader: React.CSSProperties = { maxWidth: 1180, margin: "30px auto 16px" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "7px 0", color: "#0F172A", fontSize: "clamp(28px,4vw,42px)" };
