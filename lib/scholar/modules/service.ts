export function buildService(
  activities:any[]=[]
){

  const volunteerHours=
    activities.reduce(
      (t,a)=>t+(a.hours||0),
      0
    );

  return{

    volunteerHours,

    activities,

  };

}
