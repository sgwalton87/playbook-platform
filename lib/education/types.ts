export type EducationOption = {
  id: string;
  label: string;
  value: string;
};

export type SchoolOption = EducationOption & {
  district?: string | null;
  county?: string | null;
  city?: string | null;
  state?: string | null;
  source?: string | null;

  cdsCode?: string | null;
  status?: string | null;
  schoolType?: string | null;
  ncesDistrict?: string | null;
  ncesSchool?: string | null;
};

export type CollegeOption = EducationOption & {
  city?: string | null;
  state?: string | null;
  conference?: string | null;
  division?: string | null;
  source?: string | null;
};

export type MajorOption = EducationOption & {
  cipCode?: string | null;
};

export type AcademicPathInput = {
  school?: string | null;
  school_district?: string | null;
  grade?: string | null;
  gpa?: string | number | null;
  graduation_year?: string | number | null;
  ela_score?: string | number | null;
  math_score?: string | number | null;
  dream_school?: string | null;
  top_schools?: unknown[];
};

export type AcademicValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};
