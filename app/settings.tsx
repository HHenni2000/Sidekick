import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { ToggleRow } from '@/components/ToggleRow';

export default function SettingsScreen() {
  const router = useRouter();
  const metabolismOffsetMinutes = useAppStore((state) => state.metabolismOffsetMinutes);
  const setMetabolismOffset = useAppStore((state) => state.setMetabolismOffset);
  const notificationSettings = useAppStore((state) => state.notificationSettings);
  const setNotificationSetting = useAppStore((state) => state.setNotificationSetting);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.foreground} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Einstellungen</Text>
          <Text style={styles.headerSubtitle}>Erweiterte Anpassungen</Text>
        </View>
      </View>
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Benachrichtigungen</Text>
          <Text style={styles.cardSubtitle}>Individuell aktivierbar</Text>
          <ToggleRow
            label="Erinnerung an Nahrung"
            description="Direkt nach Einnahme ohne Nahrung"
            value={notificationSettings.mealReminder}
            onChange={(value) => void setNotificationSetting('mealReminder', value)}
          />
          <ToggleRow
            label="Snack Alarm"
            description="3,5 Stunden nach Einnahme"
            value={notificationSettings.snackReminder}
            onChange={(value) => void setNotificationSetting('snackReminder', value)}
          />
          <ToggleRow
            label="Rebound Hinweis"
            description="8 Stunden nach Einnahme"
            value={notificationSettings.reboundReminder}
            onChange={(value) => void setNotificationSetting('reboundReminder', value)}
          />
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Stoffwechsel-Offset</Text>
          <Text style={styles.cardSubtitle}>{metabolismOffsetMinutes} Minuten</Text>
          <Slider
            value={metabolismOffsetMinutes}
            minimumValue={-60}
            maximumValue={60}
            step={5}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={Colors.primary}
            onValueChange={setMetabolismOffset}
          />
          <Text style={styles.helper}>
            Nutze den Offset nur, wenn die Wirkung deutlich frueher oder spaeter einsetzt.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowCard,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.foreground,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  stack: {
    gap: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.foreground,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginBottom: 10,
  },
  helper: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.mutedForeground,
  },
});
