import { CollegeGoal, Transcript } from "../types";

export interface Academics {
  /*
   * Academic Performance
   */
  weightedGPA?: number;
  unweightedGPA?: number;

  classRank?: number;

  satScore?: number;
  actScore?: number;

  /*
   * Current Coursework
   */
  currentMath?: string;
  currentEnglish?: string;
  currentScience?: string;
  currentCourses: string[];

  /*
   * College Readiness
   */
  transcript: Transcript;

  aToGCompleted: string[];
  aToGMissing: string[];

  fafsaCompleted: boolean;

  /*
   * Goals
   */
  collegeGoal: CollegeGoal;

  idealProfession?: string;
  desiredSalaryRange?: string;
}
