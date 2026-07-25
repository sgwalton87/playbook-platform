export type DoctorStatus = "PASS" | "FAIL";

export interface DoctorCheck {
  id: string;
  name: string;
  status: DoctorStatus;
  message: string;
}

export interface DoctorReport {
  status: "HEALTHY" | "UNHEALTHY";
  generatedAt: string;
  checks: DoctorCheck[];
}
