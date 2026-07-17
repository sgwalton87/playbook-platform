import type { ScholarRecordArtifact } from "../types";

export function buildAchievements({
  certificates=[],
  badges=[],
  posts=[],
  activities=[],
}: {
  certificates?: ScholarRecordArtifact[];
  badges?: ScholarRecordArtifact[];
  posts?: ScholarRecordArtifact[];
  activities?: ScholarRecordArtifact[];
}){

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
