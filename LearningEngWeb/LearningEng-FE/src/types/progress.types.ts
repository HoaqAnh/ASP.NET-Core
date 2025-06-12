export type ActivityType = 'reading' | 'listening' | 'writing';

export interface MarkProgressPayload {
  activityType: ActivityType;
  activityId: number;
}