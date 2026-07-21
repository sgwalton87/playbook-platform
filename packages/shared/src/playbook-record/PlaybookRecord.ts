import {
  Identity,
  School,
  Academics,
  Athletics,
  Recruiting,
  NIL,
  Background,
  Activities,
  SupportNetwork,
  Interests,
  Progress,
  Metadata,
} from "../models";

export interface PlaybookRecord {

  identity: Identity;

  school: School;

  academics: Academics;

  athletics: Athletics;

  recruiting: Recruiting;

  nil: NIL;

  background: Background;

  activities: Activities;

  support: SupportNetwork;

  interests: Interests;

  progress: Progress;

  metadata: Metadata;

}
