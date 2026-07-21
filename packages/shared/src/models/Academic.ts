import type { GPA } from "../value-objects/GPA";
import type { EducationLevel } from "../enums/EducationLevel";

export interface Academic {
  level: EducationLevel;
  school?: string;
  graduationYear?: number;
  intendedMajor?: string;
  gpa?: GPA;
}
