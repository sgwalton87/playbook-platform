"use client";

import { useState } from "react";

type Props = {
  targetType: "post" | "comment" | "profile" | "event" | "album";
  targetId: string;
  targetUserId?: string | null;
  canBlock?: boolean;
};

export default function ContentSafetyMenu({
  targetType,
  targetId,
  targetUserId,
  canBlock = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState("");

  async function report() {
    const reason = window.prompt(
      "Why are you reporting this content?"
    );

    if (!reason?.trim()) return;

    const res = await fetch("/api/trust/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType,
        targetId,
        reason,
      }),
    });

    if (res.ok) {
      setDone("Reported");
      setOpen(false);
    }
  }


  async function block() {
    if (!targetUserId) return;

    if (
      !window.confirm(
        "Block this member? Their content will be removed from your experience."
      )
    ) {
      return;
    }

    const res = await fetch("/api/trust/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blockedUserId: targetUserId,
      }),
    });

    if (res.ok) {
      setDone("Blocked");
      setOpen(false);
      window.location.reload();
    }
  }


  async function mute() {
    if (!targetUserId) return;

    const res = await fetch("/api/trust/mute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mutedUserId: targetUserId,
      }),
    });

    if (res.ok) {
      setDone("Muted");
      setOpen(false);
      window.location.reload();
    }
  }


  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Safety options"
        style={menuButton}
      >
        •••
      </button>

      {done && (
        <span style={status}>
          {done}
        </span>
      )}

      {open && (
        <div style={menu}>
          <button onClick={report} style={item}>
            Report
          </button>

          {canBlock && targetUserId && (
            <>
              <button onClick={mute} style={item}>
                Mute member
              </button>

              <button onClick={block} style={dangerItem}>
                Block member
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const menuButton: React.CSSProperties = {
  border: 0,
  background: "transparent",
  cursor: "pointer",
  fontWeight: 900,
  color: "#64748B",
};

const menu: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 28,
  width: 160,
  padding: 8,
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  boxShadow: "0 12px 30px rgba(15,23,42,.12)",
  zIndex: 30,
};

const item: React.CSSProperties = {
  display: "block",
  width: "100%",
  border: 0,
  background: "transparent",
  textAlign: "left",
  padding: "9px 10px",
  cursor: "pointer",
  borderRadius: 8,
  color: "#334155",
};

const dangerItem: React.CSSProperties = {
  ...item,
  color: "#B91C1C",
};

const status: React.CSSProperties = {
  fontSize: 10,
  color: "#64748B",
};
