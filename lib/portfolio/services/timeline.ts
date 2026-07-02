import { PortfolioEvent } from "../events";

export function sortTimeline(events: PortfolioEvent[]) {
  return [...events].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}
