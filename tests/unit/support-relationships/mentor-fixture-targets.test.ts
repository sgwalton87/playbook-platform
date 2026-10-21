import { expect, it } from "vitest";
import { assertIsolatedMentorTargets } from "../../helpers/isolated-mentor-targets";
it("allows local database and app combinations", () => {
 expect(() => assertIsolatedMentorTargets("http://127.0.0.1:54321", "http://localhost:3000")).not.toThrow();
 expect(() => assertIsolatedMentorTargets("http://[::1]:54321", "http://127.0.0.1:3000")).not.toThrow();
});
it.each([
 ["https://project.supabase.co", "http://localhost:3000"],
 ["http://127.0.0.1:54321", "https://the-playbook-five.vercel.app"],
 ["https://localhost.attacker.test", "http://localhost:3000"],
 ["file://localhost/database", "http://localhost:3000"],
 ["http://user:password@localhost:54321", "http://localhost:3000"],
 ["http://127.0.0.1:54321", ""],
])("rejects non-isolated fixture targets %s / %s before mutations", (database, app) => {
 expect(() => assertIsolatedMentorTargets(database, app)).toThrow();
});
