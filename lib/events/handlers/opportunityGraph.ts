import { onEvent } from "../bus";
import { handleTranscriptImportedForOpportunityGraph } from "@/lib/opportunity-graph";

export function registerOpportunityGraphHandlers() {
  onEvent("TranscriptImported", async (event) => {
    await handleTranscriptImportedForOpportunityGraph(event.payload);
  });
}
