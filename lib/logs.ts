import { ActivityLogEntry, CheckinEntry, MealEntry, MedicationIntake, NoteEntry } from '@/types/app';

interface BuildLogsParams {
  intakes: MedicationIntake[];
  checkins: CheckinEntry[];
  notes: NoteEntry[];
  meals: MealEntry[];
}

const withinRange = (timestamp: number, start: number, end: number) => {
  return timestamp >= start && timestamp <= end;
};

const formatMealType = (type: MealEntry['type']) => {
  switch (type) {
    case 'fruehstueck':
      return 'Fruehstueck';
    case 'bioSnack':
      return 'Snack';
    case 'mittagessen':
      return 'Mittagessen';
    case 'abendessen':
      return 'Abendessen';
    default:
      return type;
  }
};

const formatCheckinKey = (key: string) => {
  switch (key) {
    case 'stimmung':
      return 'Stimmung';
    case 'fokus':
      return 'Fokus';
    case 'reizbarkeit':
      return 'Reizbarkeit';
    case 'unruhe':
      return 'Unruhe';
    default:
      return key;
  }
};

export const buildLogsForRange = (
  { intakes, checkins, notes, meals }: BuildLogsParams,
  start: number,
  end: number
): ActivityLogEntry[] => {
  const logs: ActivityLogEntry[] = [];

  intakes
    .filter((entry) => withinRange(entry.timestamp, start, end))
    .forEach((entry) => {
      logs.push({
        id: `med-${entry.id}`,
        type: 'medication',
        label: 'Medikinet Adult',
        value: `${entry.doseMg} mg, ${entry.withFood ? 'mit Nahrung' : 'ohne Nahrung'}`,
        timestamp: entry.timestamp,
      });
    });

  checkins
    .filter((entry) => withinRange(entry.timestamp, start, end))
    .forEach((entry) => {
      const values = Object.entries(entry.values)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${formatCheckinKey(key)}: ${value}/5`)
        .join(', ');
      const noteSuffix = entry.note ? `Notiz: ${entry.note}` : '';
      if (!values && !noteSuffix) {
        return;
      }
      logs.push({
        id: `chk-${entry.id}`,
        type: 'checkin',
        label: 'Check-in',
        value: [values, noteSuffix].filter(Boolean).join(' · '),
        timestamp: entry.timestamp,
      });
    });

  meals
    .filter((entry) => withinRange(entry.timestamp, start, end))
    .forEach((entry) => {
      logs.push({
        id: `meal-${entry.id}`,
        type: 'meal',
        label: `Mahlzeit: ${formatMealType(entry.type)}`,
        value: entry.description,
        timestamp: entry.timestamp,
      });
    });

  notes
    .filter((entry) => withinRange(entry.timestamp, start, end))
    .forEach((entry) => {
      logs.push({
        id: `note-${entry.id}`,
        type: 'note',
        label: entry.content.length > 30 ? `${entry.content.slice(0, 30)}...` : entry.content,
        timestamp: entry.timestamp,
      });
    });

  return logs.sort((a, b) => b.timestamp - a.timestamp);
};
