import { Participant } from "../models";

export interface ProfileRecord {
  [key: string]: unknown;
}

export function participantToProfile(
  participant: Participant
): ProfileRecord {
  return {
    // TODO:
    // identity -> username
    // school -> school fields
    // academics -> GPA, dream school, etc.
    // athletics -> sport profile
    // background -> demographics
    // nil -> NIL fields
    // profile -> bio + pillars
  };
}
