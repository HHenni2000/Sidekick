import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Colors, Radii } from '@/constants/Colors';
import { CheckinCategory } from '@/types/app';

interface QuickCheckinProps {
  onCheckin: (values: Partial<Record<CheckinCategory, number>>) => void;
}

const items = [
  {
    id: 'stimmung' as const,
    label: 'Stimmung',
    icon: 'smile',
    color: Colors.accent,
    bg: Colors.cream,
  },
  {
    id: 'fokus' as const,
    label: 'Fokus',
    icon: 'target',
    color: Colors.tealDark,
    bg: Colors.tealLight,
  },
  {
    id: 'reizbarkeit' as const,
    label: 'Reizbarkeit',
    icon: 'zap',
    color: Colors.peachDark,
    bg: Colors.peach,
  },
  {
    id: 'unruhe' as const,
    label: 'Unruhe',
    icon: 'wind',
    color: Colors.lavenderDark,
    bg: Colors.lavender,
  },
];

const levels = [
  { value: 1, label: 'Sehr niedrig' },
  { value: 2, label: 'Niedrig' },
  { value: 3, label: 'Mittel' },
  { value: 4, label: 'Hoch' },
  { value: 5, label: 'Sehr hoch' },
];

export const QuickCheckin = ({ onCheckin }: QuickCheckinProps) => {
  const [activeId, setActiveId] = useState<CheckinCategory | null>(null);
  const [values, setValues] = useState<Partial<Record<CheckinCategory, number>>>({});
  const [recentId, setRecentId] = useState<CheckinCategory | null>(null);

  const handleValueSelect = (id: CheckinCategory, value: number) => {
    const nextValues = { ...values, [id]: value };
    setValues(nextValues);
    onCheckin(nextValues);
    setActiveId(null);
    setRecentId(id);
    setTimeout(() => setRecentId(null), 1500);
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Schnell-Check-in</Text>
      <View style={styles.grid}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          const currentValue = values[item.id];
          const isRecent = recentId === item.id;

          return (
            <View key={item.id} style={styles.cell}>
              <Pressable
                style={[
                  styles.itemButton,
                  { backgroundColor: item.bg },
                  isActive ? styles.activeRing : null,
                ]}
                onPress={() => setActiveId(isActive ? null : item.id)}
              >
                <Feather name={item.icon} size={26} color={item.color} />
                <Text style={[styles.itemLabel, { color: item.color }]} numberOfLines={1}>
                  {item.label}
                </Text>
                {currentValue ? (
                  <View style={[styles.valueBadge, { backgroundColor: item.bg }]}>
                    <Text style={[styles.valueText, { color: item.color }]}>
                      {currentValue}
                    </Text>
                  </View>
                ) : null}
                {isRecent ? <View style={styles.recentPulse} /> : null}
              </Pressable>
              {isActive ? (
                <View style={styles.levelPicker}>
                  {levels.map((level) => (
                    <Pressable
                      key={level.value}
                      style={[
                        styles.levelButton,
                        currentValue === level.value ? styles.levelActive : null,
                      ]}
                      onPress={() => handleValueSelect(item.id, level.value)}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          currentValue === level.value ? styles.levelTextActive : null,
                        ]}
                      >
                        {level.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    flexBasis: '48%',
    marginBottom: 10,
  },
  itemButton: {
    borderRadius: Radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  itemLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  valueBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeRing: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  levelPicker: {
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    padding: 6,
    shadowColor: Colors.shadowCard,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  levelButton: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  levelActive: {
    backgroundColor: Colors.primary,
  },
  levelText: {
    fontSize: 11,
    color: Colors.foreground,
  },
  levelTextActive: {
    color: Colors.primaryForeground,
    fontWeight: '600',
  },
  recentPulse: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
});
