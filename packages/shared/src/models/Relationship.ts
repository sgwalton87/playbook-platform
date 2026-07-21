import type { RelationshipType } from "../enums/RelationshipType";

export interface Relationship {
  id: string;
  type: RelationshipType;
  name: string;
  email?: string;
}
