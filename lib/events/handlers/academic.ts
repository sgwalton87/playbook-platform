import { onEvent } from "../bus";
import {
  handleTranscriptImportedForAcademic,
  handleCourseCompletedForAcademic,
} from "@/lib/engines/academic/academicEngine";

export function registerAcademicHandlers() {
  onEvent("TranscriptImported", async (event) => {
    await handleTranscriptImportedForAcademic(event.payload);
  });

  onEvent("CourseCompleted", async (event) => {
    await handleCourseCompletedForAcademic(event.payload);
  });
}
