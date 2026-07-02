export function skillsFromPillars(pillars: string[] = []) {
  return pillars.map((pillar) => ({
    name: pillar,
    source: "Playbook Pillar",
  }));
}
