import {
  Academics,
  Athletics,
  Background,
  Identity,
  Interests,
  Metadata,
  NIL,
  Progress,
  Recruiting,
  School,
  SupportNetwork,
  Activities,
} from ".";

export interface Participant {
  identity: Identity;

  school: School;

  academics: Academics;

  background: Background;

  athletics?: Athletics;

  recruiting?: Recruiting;

  nil?: NIL;

  interests: Interests;

  activities: Activities;

  supportNetwork: SupportNetwork;

  progress: Progress;

  metadata: Metadata;
}
