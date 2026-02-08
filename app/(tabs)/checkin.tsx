import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { Sheet } from '@/components/Sheet';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { CheckinCategory, MealType } from '@/types/app';
import { endOfDay, formatTime, startOfDay } from '@/lib/date';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const mealTypes: { id: MealType; label: string }[] = [
  { id: 'fruehstueck', label: 'Fruehstueck' },
  { id: 'bioSnack', label: 'Bio-Snack' },
  { id: 'mittagessen', label: 'Mittagessen' },
  { id: 'abendessen', label: 'Abendessen' },
];

export default function CheckinScreen() {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const logMeal = useAppStore((state) => state.logMeal);
  const logCheckin = useAppStore((state) => state.logCheckin);
  const meals = useAppStore((state) => state.meals);

  const [mealSheetVisible, setMealSheetVisible] = useState(false);
  const [mealType, setMealType] = useState<MealType>('fruehstueck');
  const [mealDescription, setMealDescription] = useState('');
  const [mealTimestamp, setMealTimestamp] = useState<Date>(new Date());
  const [mealTimePickerVisible, setMealTimePickerVisible] = useState(false);
  const [mealPickerValue, setMealPickerValue] = useState<Date>(new Date());

  const [checkinValues, setCheckinValues] = useState({
    stimmung: 0,
    fokus: 0,
    reizbarkeit: 0,
    unruhe: 0,
  });
  const [checkinNote, setCheckinNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return () => undefined;
    }, [])
  );

  const todayRange = useMemo(() => {
    const now = new Date();
    return {
      start: startOfDay(now).getTime(),
      end: endOfDay(now).getTime(),
    };
  }, []);

  const loggedMeals = useMemo(() => {
    const set = new Set<MealType>();
    meals.forEach((meal) => {
      if (meal.timestamp >= todayRange.start && meal.timestamp <= todayRange.end) {
        set.add(meal.type);
      }
    });
    return set;
  }, [meals, todayRange]);

  const scaleLabels = useMemo(
    () => ({
      stimmung: { min: 'Sehr schlecht gelaunt', max: 'Sehr gut gelaunt' },
      fokus: { min: 'Sehr schlechter Fokus', max: 'Sehr guter Fokus' },
      reizbarkeit: { min: 'Sehr gelassen', max: 'Sehr reizbar' },
      unruhe: { min: 'Sehr ruhig', max: 'Sehr unruhig' },
    }),
    []
  );

  const openMealSheet = (type: MealType) => {
    const now = new Date();
    setMealType(type);
    setMealDescription('');
    setMealTimestamp(now);
    setMealPickerValue(now);
    setMealTimePickerVisible(false);
    setMealSheetVisible(true);
  };

  const closeMealSheet = () => {
    setMealSheetVisible(false);
    setMealTimePickerVisible(false);
  };

  const handleSaveMeal = () => {
    logMeal({ type: mealType, description: mealDescription, timestamp: mealTimestamp.getTime() });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMealSheet();
  };

  const handleMealTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) {
      return;
    }
    const next = new Date(mealPickerValue);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setMealPickerValue(next);
  };

  const handleCheckinValue = (key: CheckinCategory, value: number) => {
    setCheckinValues((prev) => ({
      ...prev,
      [key]: prev[key] === value ? 0 : value,
    }));
  };

  const handleSaveCheckin = () => {
    const values: Partial<Record<CheckinCategory, number>> = {};
    (['stimmung', 'fokus', 'reizbarkeit', 'unruhe'] as const).forEach((key) => {
      if (checkinValues[key]) {
        values[key] = checkinValues[key];
      }
    });
    logCheckin({
      values,
      note: checkinNote.trim() || undefined,
    });
    setCheckinNote('');
    setCheckinValues({ stimmung: 0, fokus: 0, reizbarkeit: 0, unruhe: 0 });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isCheckinReady = useMemo(() => {
    const hasValue = Object.values(checkinValues).some((value) => value > 0);
    const hasNote = checkinNote.trim().length > 0;
    return hasValue || hasNote;
  }, [checkinValues, checkinNote]);

  return (
    <Screen scrollRef={scrollRef}>
      <SectionHeader
        title="Check-in"
        subtitle="Protokolliere Faktoren, die die Wirkung beeinflussen"
      />
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Mahlzeiten</Text>
          <Text style={styles.cardSubtitle}>Erfasse Mahlzeiten fuer besseres Timing</Text>
          <View style={styles.mealGrid}>
            {mealTypes.map((meal) => (
              <Pressable
                key={meal.id}
                style={[styles.mealButton, loggedMeals.has(meal.id) ? styles.mealButtonLogged : null]}
                onPress={() => openMealSheet(meal.id)}
              >
                <Text style={[styles.mealText, loggedMeals.has(meal.id) ? styles.mealTextLogged : null]}>
                  {meal.label}
                </Text>
                {loggedMeals.has(meal.id) ? (
                  <View style={styles.mealBadge}>
                    <MaterialCommunityIcons name="check" size={14} color={Colors.card} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Gefuehls-Check-in</Text>
          <Text style={styles.cardSubtitle}>Skala 1 bis 5 pro Kategorie</Text>
          {([
            { id: 'stimmung', label: 'Stimmung' },
            { id: 'fokus', label: 'Fokus' },
            { id: 'reizbarkeit', label: 'Reizbarkeit' },
            { id: 'unruhe', label: 'Unruhe' },
          ] as const).map((item) => (
            <View key={item.id} style={styles.checkinRow}>
              <Text style={styles.checkinLabel}>{item.label}</Text>
              <View style={styles.scaleRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.scaleButton,
                      checkinValues[item.id] === value ? styles.scaleActive : null,
                    ]}
                    onPress={() => handleCheckinValue(item.id, value)}
                  >
                    <Text
                      style={[
                        styles.scaleText,
                        checkinValues[item.id] === value ? styles.scaleTextActive : null,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleHint}>{scaleLabels[item.id].min}</Text>
                <Text style={styles.scaleHint}>{scaleLabels[item.id].max}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.fieldLabel}>Freitext Gefuehl</Text>
          <TextInput
            value={checkinNote}
            onChangeText={setCheckinNote}
            placeholder="Wie fuehlst du dich?"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
            maxLength={200}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => {
              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 120);
            }}
          />
          <PrimaryButton
            label="Check-in speichern"
            onPress={handleSaveCheckin}
            disabled={!isCheckinReady}
          />
        </Card>
      </View>

      <Sheet
        visible={mealSheetVisible}
        title="Mahlzeit erfassen"
        onClose={closeMealSheet}
      >
        <Text style={styles.sheetLabel}>Beschreibung</Text>
        <TextInput
          value={mealDescription}
          onChangeText={setMealDescription}
          placeholder="Kurzbeschreibung"
          placeholderTextColor={Colors.mutedForeground}
          style={styles.sheetInput}
          maxLength={120}
        />
        <Text style={styles.sheetLabel}>Uhrzeit</Text>
        <Pressable
          style={styles.timeButton}
          onPress={() => {
            setMealPickerValue(new Date(mealTimestamp));
            setMealTimePickerVisible(true);
          }}
        >
          <Text style={styles.timeButtonLabel}>Zeitpunkt</Text>
          <Text style={styles.timeButtonValue}>{formatTime(mealTimestamp)}</Text>
        </Pressable>
        {mealTimePickerVisible ? (
          <View style={styles.inlinePicker}>
            <DateTimePicker
              value={mealPickerValue}
              mode="time"
              display="spinner"
              onChange={handleMealTimeChange}
              textColor={Platform.OS === 'ios' ? Colors.foreground : undefined}
              accentColor={Platform.OS === 'ios' ? Colors.primary : undefined}
            />
            <View style={styles.pickerActions}>
              <SecondaryButton
                label="Abbrechen"
                onPress={() => {
                  setMealPickerValue(new Date(mealTimestamp));
                  setMealTimePickerVisible(false);
                }}
                style={styles.pickerAction}
              />
              <PrimaryButton
                label="Fertig"
                onPress={() => {
                  setMealTimestamp(new Date(mealPickerValue));
                  setMealTimePickerVisible(false);
                }}
                style={styles.pickerAction}
              />
            </View>
          </View>
        ) : null}
        <PrimaryButton label="Speichern" onPress={handleSaveMeal} disabled={!mealDescription.trim()} />
        <SecondaryButton label="Abbrechen" onPress={closeMealSheet} style={styles.sheetCancel} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 4,
    marginBottom: 12,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  mealButton: {
    flexBasis: '48%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    position: 'relative',
  },
  mealButtonLogged: {
    backgroundColor: Colors.sageDark,
  },
  mealText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.sageDark,
  },
  mealTextLogged: {
    color: Colors.card,
  },
  mealBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinRow: {
    marginTop: 12,
  },
  checkinLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 8,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scaleLabels: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleHint: {
    fontSize: 10,
    color: Colors.mutedForeground,
    maxWidth: '48%',
  },
  scaleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.muted,
    alignItems: 'center',
  },
  scaleActive: {
    backgroundColor: Colors.primary,
  },
  scaleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.foreground,
  },
  scaleTextActive: {
    color: Colors.primaryForeground,
  },
  input: {
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.foreground,
    minHeight: 96,
  },
  fieldLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.foreground,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 8,
  },
  sheetInput: {
    borderRadius: 12,
    backgroundColor: Colors.muted,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.foreground,
    marginBottom: 14,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    marginBottom: 14,
  },
  timeButtonLabel: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  timeButtonValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  inlinePicker: {
    marginTop: -4,
    marginBottom: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.muted,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  pickerAction: {
    flex: 1,
  },
  sheetCancel: {
    marginTop: 10,
  },
});
