export type DoseMg = 10 | 20;
export type MealType = 'fruehstueck' | 'bioSnack' | 'mittagessen' | 'abendessen';
export type CheckinCategory = 'stimmung' | 'fokus' | 'reizbarkeit' | 'unruhe';

export type LogType = 'medication' | 'checkin' | 'meal' | 'sleep' | 'note';

export interface MedicationIntake {
  id: string;
  timestamp: number;
  doseMg: DoseMg;
  withFood: boolean;
  note?: string;
  notificationIds?: string[];
}

export interface CheckinEntry {
  id: string;
  timestamp: number;
  values: Partial<Record<CheckinCategory, number>>;
  note?: string;
}

export interface NoteEntry {
  id: string;
  timestamp: number;
  content: string;
}

export interface MealEntry {
  id: string;
  timestamp: number;
  type: MealType;
  description: string;
}

export interface DayContext {
  dateKey: string;
  sleepQuality?: number;
  sleepLoggedAt?: number;
}

export interface NotificationSettings {
  mealReminder: boolean;
  snackReminder: boolean;
  reboundReminder: boolean;
}

export interface ActivityLogEntry {
  id: string;
  type: LogType;
  label: string;
  value?: string;
  timestamp: number;
}
