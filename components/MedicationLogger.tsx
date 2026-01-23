import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/Colors';
import { MedicationIntake } from '@/types/app';
import { formatTime } from '@/lib/date';

interface MedicationLoggerProps {
  latestIntake: MedicationIntake | null;
  onLog: () => void;
}

export const MedicationLogger = ({ latestIntake, onLog }: MedicationLoggerProps) => {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, latestIntake ? styles.iconActive : styles.iconIdle]}>
          <MaterialCommunityIcons
            name="pill"
            size={22}
            color={latestIntake ? Colors.sageDark : Colors.peachDark}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Medikinet Adult</Text>
          {latestIntake ? (
            <Text style={styles.subtitle}>
              Letzte Einnahme {formatTime(new Date(latestIntake.timestamp))} - {latestIntake.doseMg} mg
            </Text>
          ) : (
            <Text style={styles.subtitle}>Heute noch nicht eingenommen</Text>
          )}
        </View>
      </View>
      <PrimaryButton label="Einnahme erfassen" onPress={onLog} />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconIdle: {
    backgroundColor: Colors.peach,
  },
  iconActive: {
    backgroundColor: Colors.sage,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.foreground,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.mutedForeground,
  },
});
