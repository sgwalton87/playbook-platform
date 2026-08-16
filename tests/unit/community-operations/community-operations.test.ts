import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const events = read("app/events/page.tsx");
const mentorship = read("app/mentorship/page.tsx");
const migration = read("supabase/migrations/202608160036_canonical_events_mentorship.sql");
const projections = read("supabase/migrations/202608160037_community_operations_projections.sql");

describe("canonical community operations", () => {
  it("keeps Events on durable API-backed state instead of React seed arrays", () => {
    expect(events).toContain('/api/community/events');
    expect(events).toContain('rsvp(event, "going")');
    expect(events).not.toContain("const EVENTS");
    expect(events).not.toContain("Jun 22");
    expect(events).not.toContain("Jul 12");
  });

  it("keeps Mentorship Circles on governed membership and waitlist state", () => {
    expect(mentorship).toContain('/api/community/mentorship');
    expect(mentorship).toContain('changeMembership(circle, "join")');
    expect(mentorship).toContain("waitlisted");
    expect(mentorship).not.toContain("const MENTORS");
    expect(mentorship).not.toContain("const CIRCLES");
  });

  it("enforces capacity and operator/mentor authority in Postgres", () => {
    expect(migration).toContain("rsvp_community_event");
    expect(migration).toContain("Event is at capacity.");
    expect(migration).toContain("join_mentor_circle");
    expect(migration).toContain("waitlisted");
    expect(migration).toContain("current_user_is_platform_operator");
    expect(migration).toContain("current_user_is_mentor");
    expect(migration).toContain("verify_community_event_attendance");
  });

  it("uses bounded server projections for counts and member context", () => {
    expect(projections).toContain("get_community_events");
    expect(projections).toContain("get_mentor_circles");
    expect(projections).toContain("my_rsvp");
    expect(projections).toContain("my_membership");
    expect(projections).not.toContain("[p.first_name,p.last_name]");
  });
});
