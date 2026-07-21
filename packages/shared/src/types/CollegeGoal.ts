export interface CollegeGoal {
  dreamSchoolName?: string;
  dreamSchoolId?: string;

  intendedMajor?: string;

  desiredDivision?:
    | "NAIA"
    | "NCAA D1"
    | "NCAA D2"
    | "NCAA D3"
    | "JUCO";

  recruitingInterest?: boolean;
}
