"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function CommunityEventsPage() {
  const [userId, setUserId] = useState("");
  const [events, setEvents] = useState<LegacyValue[]>([]);
  const [title, setTitle] = useState("Financial Literacy Night");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");

  async function load() {
    const res = await fetch("/api/community-events");
    const json = await res.json();
    setEvents(json.events || []);
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || "");
      await load();
    }
    init();
  }, []);

  async function createEvent() {
    if (!userId || !title.trim()) return;

    await fetch("/api/community-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, location, startsAt }),
    });

    await load();
  }

  async function rsvp(eventId: string) {
    if (!userId) return;

    await fetch("/api/community-events/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, eventId, status: "going" }),
    });

    await load();
  }

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Community Events"
        title="Real-life connection matters."
        subtitle="Students can attend workshops, mentor mixers, panels, campus visits, recruiting sessions, and community gatherings."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/feed">Share Event Update</PlaybookButton>
          <PlaybookButton href="/mentor-connect" variant="secondary">Find Mentors</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookCard eyebrow="Create Event" title="Add a community opportunity">
        <div style={form}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" style={input} />
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={input} />
          <button onClick={createEvent} style={button}>Create</button>
        </div>
      </PlaybookCard>

      <PlaybookGrid>
        {events.map((event) => (
          <PlaybookCard key={event.id} eyebrow={event.event_type} title={event.title}>
            <p style={body}>{event.description || "No description yet."}</p>
            <p style={body}>📍 {event.location || "Location TBD"}</p>
            <p style={body}>🗓 {event.starts_at ? new Date(event.starts_at).toLocaleString() : "Date TBD"}</p>
            <PlaybookPill>{event.community_event_rsvps?.length || 0} RSVPs</PlaybookPill>
            <div style={{ marginTop: 14 }}>
              <button onClick={() => rsvp(event.id)} style={button}>RSVP</button>
            </div>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const form: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 220px auto", gap: 10 };
const input: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 12, padding: 12 };
const button: React.CSSProperties = { border: 0, borderRadius: 12, background: "#0F172A", color: "#F8F7F4", padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
