export function buildCareer(profile:any){

  return{

    idealProfession:
      profile?.ideal_profession,

    desiredSalaryRange:
      profile?.desired_salary_range,

  };

}
