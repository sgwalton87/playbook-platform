export function buildAthletics(profile:any){

  return{

    sport:profile?.sport,

    position:profile?.position,

    height:profile?.height,

    weight:profile?.weight,

    coachName:profile?.coach_name,

    coachEmail:profile?.coach_email,

    travelTeam:profile?.travel_team,

    recruitingStatus:
      profile?.recruiting_status ||
      profile?.recruiting_interest,

    highlightVideo:
      profile?.highlight_video ||
      profile?.highlight_reel_url,

  };

}
