export function buildLeadership(
  badges:any[]=[],
  activities:any[]=[]
){

  return{

    badges,

    activities,

    leadershipScore:
      badges.length*10+
      activities.length*5,

  };

}
