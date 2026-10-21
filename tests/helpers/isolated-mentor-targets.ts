/** Fixture mutations may run only when both the app and database are local. */
export function assertIsolatedMentorTargets(databaseUrl: string, applicationUrl: string) {
  for (const value of [databaseUrl, applicationUrl]) {
    const target = new URL(value);
    if (!["http:", "https:"].includes(target.protocol)
      || !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)
      || target.username || target.password) {
      throw new Error("Mentor fixture acceptance requires isolated local application and Supabase; hosted targets are prohibited.");
    }
  }
}
