export type OnboardingFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "college"
  | "college-list"
  | "district"
  | "career"
  | "activity-list"
  | "invite-list"
  | "safety-agreement";

export type OnboardingField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: OnboardingFieldType;
  options?: string[];
};

export type OnboardingStep = {
  id: string;
  phase: string;
  title: string;
  body: string;
  fields: OnboardingField[];
};

export type OnboardingValue = string | string[] | boolean | number | null | undefined;
export type OnboardingData = Record<string, OnboardingValue>;
