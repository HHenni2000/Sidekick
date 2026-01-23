import * as Notifications from 'expo-notifications';
import { NotificationSettings, MedicationIntake } from '@/types/app';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const ensureNotificationPermissions = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
};

const scheduleAt = async (date: Date, title: string, body: string) => {
  if (date.getTime() <= Date.now()) {
    return null;
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: false,
    },
    trigger: date,
  });
};

export const scheduleIntakeNotifications = async (
  intake: MedicationIntake,
  settings: NotificationSettings
) => {
  const ids: string[] = [];
  const baseTime = intake.timestamp;

  if (!intake.withFood && settings.mealReminder) {
    const id = await scheduleAt(
      new Date(baseTime + 1 * 60 * 1000),
      'Erinnerung an Nahrung',
      'Bitte iss etwas, um die Wirkung zu stabilisieren.'
    );
    if (id) ids.push(id);
  }

  if (settings.snackReminder) {
    const id = await scheduleAt(
      new Date(baseTime + 3.5 * 60 * 60 * 1000),
      'Snack Erinnerung',
      'Zeit fuer einen kleinen Snack in der Uebergangsphase.'
    );
    if (id) ids.push(id);
  }

  if (settings.reboundReminder) {
    const id = await scheduleAt(
      new Date(baseTime + 8 * 60 * 60 * 1000),
      'Rebound Hinweis',
      'Achte auf moegliche Rebound-Effekte und plane Ruhe ein.'
    );
    if (id) ids.push(id);
  }

  return ids;
};

export const cancelNotifications = async (ids: string[] | undefined) => {
  if (!ids || ids.length === 0) {
    return;
  }
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
};
