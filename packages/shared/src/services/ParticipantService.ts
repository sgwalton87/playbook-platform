import { Participant } from "../models";

export class ParticipantService {

  static create(participant: Participant): Participant {
    return participant;
  }

  static update(
    current: Participant,
    updates: Partial<Participant>
  ): Participant {

    return {
      ...current,
      ...updates,
    };

  }

}
