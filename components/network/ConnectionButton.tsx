"use client";

import { useEffect, useState } from "react";
import {
  acceptConnectionRequest,
  declineConnectionRequest,
  getConnectionStatus,
  removeConnection,
  sendConnectionRequest,
  type ConnectionStatus,
} from "@/lib/network";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  targetUserId: string;
};

export default function ConnectionButton({ targetUserId }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("none");
  const [loading, setLoading] = useState(true);

  async function refresh(userId?: string) {
    const id = userId || currentUserId;
    if (!id || !targetUserId) return;

    setLoading(true);
    const next = await getConnectionStatus(id, targetUserId);
    setStatus(next);
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(data.user.id);
      await refresh(data.user.id);
    }

    load();
  }, [targetUserId]);

  async function act() {
    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    if (status === "none") {
      await sendConnectionRequest(currentUserId, targetUserId);
    }

    if (status === "pending_received") {
      await acceptConnectionRequest(currentUserId, targetUserId);
    }

    if (status === "connected") {
      await removeConnection(currentUserId, targetUserId);
    }

    await refresh(currentUserId);
  }

  async function decline() {
    if (!currentUserId) return;
    setLoading(true);
    await declineConnectionRequest(currentUserId, targetUserId);
    await refresh(currentUserId);
  }

  if (status === "self") return null;

  if (status === "pending_received") {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={act} disabled={loading} style={primary}>
          Accept Connection
        </button>
        <button onClick={decline} disabled={loading} style={secondary}>
          Decline
        </button>
      </div>
    );
  }

  const label =
    status === "connected"
      ? "Connected ✓"
      : status === "pending_sent"
        ? "Request Sent"
        : "Add Connection";

  return (
    <button
      onClick={act}
      disabled={loading || status === "pending_sent"}
      style={status === "connected" ? secondary : primary}
    >
      {loading ? "Checking..." : label}
    </button>
  );
}

const primary: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  background: "#F97316",
  color: "#FFFFFF",
  padding: "12px 18px",
  fontWeight: 950,
  cursor: "pointer",
};

const secondary: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 999,
  background: "#FFFFFF",
  color: "#0F172A",
  padding: "12px 18px",
  fontWeight: 950,
  cursor: "pointer",
};
