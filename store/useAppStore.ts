import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { cancelNotifications, ensureNotificationPermissions, scheduleIntakeNotifications } from '@/lib/notifications';
import { generateId } from '@/lib/utils';
import { toDateKey } from '@/lib/date';
import {
  CheckinCategory,
  CheckinEntry,
  DayContext,
  DoseMg,
  MealEntry,
  MealType,
  MedicationIntake,
  NoteEntry,
  NotificationSettings,
} from '@/types/app';

interface AppState {
  intakes: MedicationIntake[];
  checkins: CheckinEntry[];
  notes: NoteEntry[];
  meals: MealEntry[];
  dayContexts: Record<string, DayContext>;
  notificationSettings: NotificationSettings;
  metabolismOffsetMinutes: number;
  lastDoseMg: DoseMg;
  lastWithFood: boolean;
  logMedication: (payload: {
    timestamp: number;
    doseMg: DoseMg;
    withFood: boolean;
    note?: string;
  }) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Omit<MedicationIntake, 'id'>>) => Promise<void>;
  logCheckin: (payload: {
    values: Partial<Record<CheckinCategory, number>>;
    note?: string;
    timestamp?: number;
  }) => void;
  logNote: (content: string) => void;
  logMeal: (payload: { type: MealType; description: string; timestamp?: number }) => void;
  setDayContext: (payload: { date: Date; sleepQuality?: number }) => void;
  setNotificationSetting: (key: keyof NotificationSettings, value: boolean) => Promise<void>;
  setMetabolismOffset: (value: number) => void;
}

const clampOffset = (value: number) => Math.max(-60, Math.min(60, value));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      intakes: [],
      checkins: [],
      notes: [],
      meals: [],
      dayContexts: {},
      notificationSettings: {
        mealReminder: true,
        snackReminder: true,
        reboundReminder: true,
      },
      metabolismOffsetMinutes: 0,
      lastDoseMg: 10,
      lastWithFood: true,
      logMedication: async ({ timestamp, doseMg, withFood, note }) => {
        const id = generateId();
        const intake: MedicationIntake = {
          id,
          timestamp,
          doseMg,
          withFood,
          note,
        };

        let notificationIds: string[] = [];
        const hasPermission = await ensureNotificationPermissions();
        if (hasPermission) {
          notificationIds = await scheduleIntakeNotifications(intake, get().notificationSettings);
        }

        set((state) => ({
          intakes: [{ ...intake, notificationIds }, ...state.intakes],
          lastDoseMg: doseMg,
          lastWithFood: withFood,
        }));
      },
      updateMedication: async (id, updates) => {
        const state = get();
        const existing = state.intakes.find((entry) => entry.id === id);
        if (!existing) {
          return;
        }

        await cancelNotifications(existing.notificationIds);

        const updated: MedicationIntake = {
          ...existing,
          ...updates,
        };

        let notificationIds: string[] = [];
        const hasPermission = await ensureNotificationPermissions();
        if (hasPermission) {
          notificationIds = await scheduleIntakeNotifications(updated, get().notificationSettings);
        }

        const next = state.intakes.map((entry) =>
          entry.id === id ? { ...updated, notificationIds } : entry
        );

        set({
          intakes: next,
          lastDoseMg: updated.doseMg,
          lastWithFood: updated.withFood,
        });
      },
      logCheckin: ({ values, note, timestamp }) => {
        const id = generateId();
        const entry: CheckinEntry = {
          id,
          timestamp: timestamp ?? Date.now(),
          values,
          note,
        };
        set((state) => ({ checkins: [entry, ...state.checkins] }));
      },
      logNote: (content) => {
        const trimmed = content.trim();
        if (!trimmed) {
          return;
        }
        const entry: NoteEntry = {
          id: generateId(),
          timestamp: Date.now(),
          content: trimmed.slice(0, 500),
        };
        set((state) => ({ notes: [entry, ...state.notes] }));
      },
      logMeal: ({ type, description, timestamp }) => {
        const trimmed = description.trim();
        if (!trimmed) {
          return;
        }
        const entry: MealEntry = {
          id: generateId(),
          timestamp: timestamp ?? Date.now(),
          type,
          description: trimmed,
        };
        set((state) => ({ meals: [entry, ...state.meals] }));
      },
      setDayContext: ({ date, sleepQuality }) => {
        const dateKey = toDateKey(date);
        set((state) => ({
          dayContexts: {
            ...state.dayContexts,
            [dateKey]: {
              dateKey,
              sleepQuality: sleepQuality ?? state.dayContexts[dateKey]?.sleepQuality,
              sleepLoggedAt:
                sleepQuality !== undefined
                  ? Date.now()
                  : state.dayContexts[dateKey]?.sleepLoggedAt,
            },
          },
        }));
      },
      setNotificationSetting: async (key, value) => {
        const currentSettings = get().notificationSettings;
        const nextSettings = { ...currentSettings, [key]: value };
        set({ notificationSettings: nextSettings });

        const hasPermission = await ensureNotificationPermissions();
        if (!hasPermission) {
          return;
        }

        const now = Date.now();
        const intakes = get().intakes;
        const updatedIntakes: MedicationIntake[] = [];

        for (const intake of intakes) {
          if (intake.timestamp < now - 60 * 1000) {
            updatedIntakes.push(intake);
            continue;
          }
          await cancelNotifications(intake.notificationIds);
          const notificationIds = await scheduleIntakeNotifications(intake, nextSettings);
          updatedIntakes.push({ ...intake, notificationIds });
        }

        set({ intakes: updatedIntakes });
      },
      setMetabolismOffset: (value) => {
        set({ metabolismOffsetMinutes: clampOffset(value) });
      },
    }),
    {
      name: 'sidekick-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        intakes: state.intakes,
        checkins: state.checkins,
        notes: state.notes,
        meals: state.meals,
        dayContexts: state.dayContexts,
        notificationSettings: state.notificationSettings,
        metabolismOffsetMinutes: state.metabolismOffsetMinutes,
        lastDoseMg: state.lastDoseMg,
        lastWithFood: state.lastWithFood,
      }),
    }
  )
);
