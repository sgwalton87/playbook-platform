export function buildAchievements({
  certificates=[],
  badges=[],
  posts=[],
  activities=[],
}:LegacyValue){

  return{

    certificates,

    badges,

    posts,

    activities,

    total:
      certificates.length+
      badges.length+
      posts.length+
      activities.length,

  };

}
