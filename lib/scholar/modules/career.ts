export function buildCareer(profile:LegacyValue){

  return{

    idealProfession:
      profile?.ideal_profession,

    desiredSalaryRange:
      profile?.desired_salary_range,

  };

}
