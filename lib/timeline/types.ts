export type TimelineEventType =
  | "academic"
  | "certificate"
  | "badge"
  | "activity"
  | "post"
  | "athletic"
  | "career"
  | "service"
  | "leadership";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date?: string;
  source?: string;
  verified?: boolean;
}
