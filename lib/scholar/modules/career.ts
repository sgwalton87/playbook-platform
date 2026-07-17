import type { ScholarProfile } from "../types";

export function buildCareer(profile: ScholarProfile){

  return{

    idealProfession:
      profile?.ideal_profession,

    desiredSalaryRange:
      profile?.desired_salary_range,

  };

}
