import type { PlaybookRecordArtifact } from "../types";

export function buildAchievements({
  certificates=[],
  badges=[],
  posts=[],
  activities=[],
}: {
  certificates?: PlaybookRecordArtifact[];
  badges?: PlaybookRecordArtifact[];
  posts?: PlaybookRecordArtifact[];
  activities?: PlaybookRecordArtifact[];
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
