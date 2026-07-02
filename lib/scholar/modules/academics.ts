export function buildAcademics(profile:any){

  return{

    gpa:profile?.gpa,

    weightedGpa:profile?.weighted_gpa,

    unweightedGpa:profile?.unweighted_gpa,

    dreamSchool:profile?.dream_school,

    intendedMajor:profile?.intended_major,

    sat:profile?.sat_score,

    act:profile?.act_score,

  };

}
