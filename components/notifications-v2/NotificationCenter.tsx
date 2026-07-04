"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getDemoNotifications,
  getUnreadCount,
  markNotificationRead,
  sortNotifications,
  type PlaybookNotification,
} from "@/lib/notifications-v2";

type Filter = "all" | "unread" | "messages" | "actions" | "intelligence";

export default function NotificationCenter() {
  const [notifications, setNotifications] =
    useState<PlaybookNotification[]>(getDemoNotifications());

  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const sorted = sortNotifications(notifications);

    if (filter === "unread") {
      return sorted.filter((notification) => !notification.read);
    }

    if (filter === "messages") {
      return sorted.filter((notification) =>
        ["message", "mail_reply"].includes(notification.type)
      );
    }

    if (filter === "actions") {
      return sorted.filter((notification) =>
        ["shared_action", "invitation"].includes(notification.type)
      );
    }

    if (filter === "intelligence") {
      return sorted.filter((notification) =>
        ["compass_alert", "network_blocker", "recommendation"].includes(
          notification.type
        )
      );
    }

    return sorted;
  }, [notifications, filter]);

  const unreadCount = getUnreadCount(notifications);

  function markRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? markNotificationRead(notification)
          : notification
      )
    );
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((notification) => markNotificationRead(notification))
    );
  }

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Notifications Center</p>
        <h1 style={title}>What needs your attention?</h1>
        <p style={sub}>
          Messages, invitations, shared actions, email replies, Compass alerts,
          and network blockers in one place.
        </p>

        <div style={heroStats}>
          <div style={heroStat}>
            <strong style={heroNumber}>{unreadCount}</strong>
            <span>Unread</span>
          </div>

          <div style={heroStat}>
            <strong style={heroNumber}>{notifications.length}</strong>
            <span>Total signals</span>
          </div>
        </div>
      </section>

      <section style={toolbar}>
        <div style={filters}>
          {(["all", "unread", "messages", "actions", "intelligence"] as Filter[]).map(
            (value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                style={{
                  ...filterButton,
                  ...(filter === value ? activeFilter : {}),
                }}
              >
                {value}
              </button>
            )
          )}
        </div>

        <button onClick={markAllRead} style={markAllButton}>
          Mark all read
        </button>
      </section>

      <section style={list}>
        {visible.map((notification) => (
          <article
            key={notification.id}
            style={{
              ...card,
              opacity: notification.read ? 0.68 : 1,
            }}
          >
            <div style={cardTop}>
              <div>
                <span style={typePill}>
                  {notification.type.replaceAll("_", " ")}
                </span>

                <h2 style={cardTitle}>{notification.title}</h2>
              </div>

              {!notification.read && <span style={unreadDot} />}
            </div>

            <p style={body}>{notification.body}</p>

            <div style={cardFooter}>
              <Link
                href={notification.href}
                onClick={() => markRead(notification.id)}
                style={openButton}
              >
                Open
              </Link>

              {!notification.read && (
                <button
                  onClick={() => markRead(notification.id)}
                  style={readButton}
                >
                  Mark read
                </button>
              )}

              <span style={priority}>
                {notification.priority} priority
              </span>
            </div>
          </article>
        ))}

        {visible.length === 0 && (
          <article style={emptyState}>
            <strong>Nothing needs attention in this view.</strong>
          </article>
        )}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
  padding: 32,
  fontFamily: "system-ui, sans-serif",
};

const hero: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  background: "#0F172A",
  color: "#FFFFFF",
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
  fontSize: 50,
  lineHeight: 1,
  margin: "12px 0",
};

const sub: React.CSSProperties = {
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 760,
};

const heroStats: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 20,
};

const heroStat: React.CSSProperties = {
  display: "grid",
  gap: 2,
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 16,
  padding: "12px 16px",
};

const heroNumber: React.CSSProperties = {
  fontSize: 24,
};

const toolbar: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 16px",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const filters: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const filterButton: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  background: "#FFFFFF",
  color: "#334155",
  borderRadius: 999,
  padding: "9px 12px",
  fontWeight: 850,
  cursor: "pointer",
  textTransform: "capitalize",
};

const activeFilter: React.CSSProperties = {
  background: "#0F172A",
  color: "#FFFFFF",
  borderColor: "#0F172A",
};

const markAllButton: React.CSSProperties = {
  border: "none",
  background: "#F97316",
  color: "#FFFFFF",
  borderRadius: 999,
  padding: "9px 13px",
  fontWeight: 900,
  cursor: "pointer",
};

const list: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  display: "grid",
  gap: 12,
};

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  padding: 18,
  boxShadow: "0 12px 32px rgba(15,23,42,.05)",
};

const cardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};

const typePill: React.CSSProperties = {
  display: "inline-flex",
  background: "#FFF7ED",
  color: "#9A3412",
  border: "1px solid #FED7AA",
  borderRadius: 999,
  padding: "5px 8px",
  fontSize: 10,
  fontWeight: 900,
  textTransform: "uppercase",
};

const cardTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 20,
  margin: "10px 0 0",
};

const unreadDot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "#F97316",
  flexShrink: 0,
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.55,
};

const cardFooter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const openButton: React.CSSProperties = {
  background: "#0F172A",
  color: "#FFFFFF",
  borderRadius: 999,
  padding: "8px 11px",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 12,
};

const readButton: React.CSSProperties = {
  background: "#FFFFFF",
  color: "#334155",
  border: "1px solid #E2E8F0",
  borderRadius: 999,
  padding: "8px 11px",
  fontWeight: 850,
  cursor: "pointer",
  fontSize: 12,
};

const priority: React.CSSProperties = {
  marginLeft: "auto",
  color: "#94A3B8",
  fontSize: 11,
  fontWeight: 800,
};

const emptyState: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  padding: 30,
  color: "#64748B",
  textAlign: "center",
};
