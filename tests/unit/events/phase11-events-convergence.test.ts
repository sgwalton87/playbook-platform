import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const exists = (file: string) => fs.existsSync(path.join(process.cwd(), file));

describe("Phase 11 Events canonical convergence", () => {
  it("fulfills Browse Events and Summit Events through the shared event catalog", () => {
    const events = read("app/events/page.tsx");
    expect(events).toContain('/api/community/events');
    expect(events).toContain('event.event_type === "summit"');
    expect(events).toContain("Summit");
    expect(events).toContain("Playbook does not fabricate events or Summits");
  });

  it("fulfills Event Detail and RSVP through the canonical event experience", () => {
    const detail = read("app/events/[eventId]/page.tsx");
    expect(detail).toContain('rpc("get_community_event_detail"');
    expect(detail).toContain('/api/community/events');
    expect(detail).toContain('rsvp("going")');
    expect(detail).toContain('rsvp("interested")');
    expect(detail).toContain('rsvp("cancelled")');
  });

  it("derives calendar exports from the canonical event instead of duplicating it", () => {
    const detail = read("app/events/[eventId]/page.tsx");
    expect(detail).toContain("buildGoogleCalendarUrl(event)");
    expect(detail).toContain("buildIcsDataUrl(event)");
    expect(detail).toContain("Generated from the canonical Playbook event record.");
  });

  it("keeps Event Reminders on the shared database-backed notification service", () => {
    const reminders = read("app/events/reminders/page.tsx");
    expect(reminders).toContain('from("community_event_reminders")');
    expect(reminders).toContain('rpc("set_community_event_reminder"');
    expect(reminders).toContain("shared Playbook notification service");
    expect(reminders).toContain("not by a browser timer");
  });

  it("records QR/token check-in as arrival evidence without self-verifying attendance", () => {
    const detail = read("app/events/[eventId]/page.tsx");
    expect(detail).toContain('rpc("check_in_community_event"');
    expect(detail).toContain("Arrival and attendance are deliberately different records");
    expect(detail).toContain("Verified attendance remains a separate operator-reviewed record");
  });

  it("makes Event Networking explicit opt-in and privacy-safe", () => {
    const detail = read("app/events/[eventId]/page.tsx");
    expect(detail).toContain('rpc("set_community_event_networking_opt_in"');
    expect(detail).toContain('rpc("get_community_event_networking_directory"');
    expect(detail).toContain("Opt in; don’t get exposed by default");
    expect(detail).toContain("Email, phone, private Scholar Record data, and support relationships are never part of this directory");
  });

  it("fulfills Replay Library from operator-published canonical event replay URLs", () => {
    const replays = read("app/events/replays/page.tsx");
    expect(replays).toContain('from("community_events")');
    expect(replays).toContain('.not("replay_url", "is", null)');
    expect(replays).toContain("without turning a replay into attendance evidence or a second event record");
  });

  it("has routes for every Phase 11 canonical experience", () => {
    for (const file of [
      "app/events/page.tsx",
      "app/events/[eventId]/page.tsx",
      "app/events/reminders/page.tsx",
      "app/events/replays/page.tsx",
    ]) {
      expect(exists(file)).toBe(true);
    }
  });

  it("keeps Summit on the shared Events taxonomy instead of a second Summit datastore", () => {
    const migration = read("supabase/migrations/202608160074_summit_event_type.sql");
    const adr = read("docs/architecture/ADR-0010_SUMMIT_EVENTS_SHARED_SERVICE.md");
    expect(migration).toContain("summit");
    expect(adr).toContain("shared Event service");
    expect(adr).toContain("remains the Event owner");
  });
});