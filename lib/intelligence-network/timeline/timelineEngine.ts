export function buildLivingTimeline(events: string[] = []) {
  const base = events.length
    ? events
    : [
        "Joined Playbook",
        "Transcript imported",
        "Academic DNA updated",
        "Opportunity matched",
        "Compass briefing created",
      ];

  return base.map((event, index) => ({
    id: `timeline-${index + 1}`,
    title: event,
    order: index + 1,
    type: index === 0 ? "origin" : "milestone",
  }));
}
