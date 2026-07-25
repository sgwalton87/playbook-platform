export interface ValidationCheck {
  name: string;
  status: "PASS" | "FAIL";
  message: string;
}

export interface ValidationContext {
  repository: any;
  planning: any;
}

export interface ValidationResult {
  status: "PASS" | "FAIL";
  selectedGate: string;
  checks: ValidationCheck[];
}
