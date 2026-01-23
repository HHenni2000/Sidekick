import { CheckinEntry, DayContext, MealEntry, MedicationIntake, NoteEntry } from '@/types/app';
import { endOfDay, formatDateShort, formatTime, startOfDay, toDateKey } from '@/lib/date';

interface ExportParams {
  days: number;
  intakes: MedicationIntake[];
  checkins: CheckinEntry[];
  notes: NoteEntry[];
  meals: MealEntry[];
  dayContexts: Record<string, DayContext>;
}

const formatDose = (doseMg: number, withFood: boolean) => {
  const foodLabel = withFood ? 'mit Nahrung' : 'ohne Nahrung';
  return `${doseMg} mg, ${foodLabel}`;
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

export const buildExportMarkdown = (params: ExportParams) => {
  const { days, intakes, checkins, notes, meals, dayContexts } = params;
  const now = new Date();
  const dates: Date[] = [];

  for (let i = 0; i < days; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    dates.push(date);
  }

  let output = `# Sidekick Bericht (${days} Tage)\n\n`;

  dates.forEach((date) => {
    const dayStart = startOfDay(date).getTime();
    const dayEnd = endOfDay(date).getTime();
    const dateKey = toDateKey(date);
    const context = dayContexts[dateKey];

    const timeline: { timestamp: number; label: string }[] = [];

    intakes
      .filter((entry) => entry.timestamp >= dayStart && entry.timestamp <= dayEnd)
      .forEach((entry) => {
        timeline.push({
          timestamp: entry.timestamp,
          label: `Einnahme ${formatDose(entry.doseMg, entry.withFood)}`,
        });
      });

    meals
      .filter((entry) => entry.timestamp >= dayStart && entry.timestamp <= dayEnd)
      .forEach((entry) => {
        timeline.push({
          timestamp: entry.timestamp,
          label: `${formatMealType(entry.type)}: ${entry.description}`,
        });
      });

    checkins
      .filter((entry) => entry.timestamp >= dayStart && entry.timestamp <= dayEnd)
      .forEach((entry) => {
        const values = Object.entries(entry.values)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${formatCheckinKey(key)} ${value}/5`)
          .join(', ');
        const noteSuffix = entry.note ? ` (Notiz: ${entry.note})` : '';
        if (!values && !noteSuffix) {
          return;
        }
        timeline.push({
          timestamp: entry.timestamp,
          label: `Check-in ${values}${noteSuffix}`.trim(),
        });
      });

    notes
      .filter((entry) => entry.timestamp >= dayStart && entry.timestamp <= dayEnd)
      .forEach((entry) => {
        timeline.push({
          timestamp: entry.timestamp,
          label: `Notiz: ${entry.content}`,
        });
      });

    if (context?.sleepQuality) {
      const timestamp = context.sleepLoggedAt ?? dayStart + 7 * 60 * 60 * 1000;
      timeline.push({
        timestamp,
        label: `Morgen-Check Schlafqualitaet ${context.sleepQuality}/5`,
      });
    }

    output += `## ${formatDateShort(date)}\n\n`;

    if (timeline.length === 0) {
      output += `- Keine Eintraege\n\n`;
      return;
    }

    timeline
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((entry) => {
        output += `- ${formatTime(new Date(entry.timestamp))} ${entry.label}\n`;
      });
    output += `\n`;
  });

  output += `---\n`;
  output += `Hinweis: Der Bericht ist fuer die Analyse in einem KI-Agenten gedacht.`;

  return output;
};
