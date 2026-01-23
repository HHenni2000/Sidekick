import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { TodayHeader } from '@/components/TodayHeader';
import { MedicationLogger } from '@/components/MedicationLogger';
import { EffectCurve } from '@/components/EffectCurve';
import { RecentLogs } from '@/components/RecentLogs';
import { Card } from '@/components/Card';
import { Sheet } from '@/components/Sheet';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { buildLogsForRange } from '@/lib/logs';
import { endOfDay, formatDateShort, formatTime, startOfDay, toDateKey } from '@/lib/date';
import { DoseMg, MedicationIntake } from '@/types/app';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const intakes = useAppStore((state) => state.intakes);
  const checkins = useAppStore((state) => state.checkins);
  const notes = useAppStore((state) => state.notes);
  const meals = useAppStore((state) => state.meals);
  const logMedication = useAppStore((state) => state.logMedication);
  const updateMedication = useAppStore((state) => state.updateMedication);
  const metabolismOffsetMinutes = useAppStore((state) => state.metabolismOffsetMinutes);
  const lastDoseMg = useAppStore((state) => state.lastDoseMg);
  const lastWithFood = useAppStore((state) => state.lastWithFood);
  const dayContexts = useAppStore((state) => state.dayContexts);
  const setDayContext = useAppStore((state) => state.setDayContext);

  const latestIntake = intakes[0] ?? null;
  const todayStart = startOfDay(new Date()).getTime();
  const todayEnd = endOfDay(new Date()).getTime();
  const todayKey = toDateKey(new Date());
  const latestIntakeToday =
    latestIntake && latestIntake.timestamp >= todayStart && latestIntake.timestamp <= todayEnd
      ? latestIntake
      : null;

  const recentLogs = useMemo(
    () => buildLogsForRange({ intakes, checkins, notes, meals }, 0, Number.MAX_SAFE_INTEGER),
    [intakes, checkins, notes, meals]
  );


  const [sheetMode, setSheetMode] = useState<'manual' | 'edit' | null>(null);
  const [activeIntake, setActiveIntake] = useState<MedicationIntake | null>(null);
  const [dose, setDose] = useState<DoseMg>(lastDoseMg);
  const [withFood, setWithFood] = useState<boolean>(lastWithFood);
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());
  const [morningVisible, setMorningVisible] = useState(false);
  const [sleepQuality, setSleepQuality] = useState<number>(3);

  const morningLogged = dayContexts[todayKey]?.sleepQuality;

  useEffect(() => {
    if (!morningLogged) {
      setSleepQuality(3);
    }
  }, [morningLogged]);

  useEffect(() => {
    if (morningLogged) {
      setMorningVisible(false);
    }
  }, [morningLogged]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      if (!morningLogged) {
        setMorningVisible(true);
      }
      return () => undefined;
    }, [morningLogged])
  );

  const openSheet = (mode: 'manual' | 'edit', intake?: MedicationIntake) => {
    setSheetMode(mode);
    if (mode === 'edit' && intake) {
      setActiveIntake(intake);
      setDose(intake.doseMg);
      setWithFood(intake.withFood);
      setTimestamp(new Date(intake.timestamp));
    } else {
      setActiveIntake(null);
      setDose(lastDoseMg);
      setWithFood(lastWithFood);
      setTimestamp(new Date());
    }
  };

  const closeSheet = () => {
    setSheetMode(null);
    setActiveIntake(null);
    setPickerMode(null);
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerValue(new Date(timestamp));
    setPickerMode(mode);
  };

  const cancelPicker = () => {
    setPickerMode(null);
    setPickerValue(new Date(timestamp));
  };

  const handleSaveMedication = async () => {
    if (sheetMode === 'edit' && activeIntake) {
      await updateMedication(activeIntake.id, {
        doseMg: dose,
        withFood,
        timestamp: timestamp.getTime(),
      });
    } else {
      await logMedication({
        doseMg: dose,
        withFood,
        timestamp: timestamp.getTime(),
      });
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeSheet();
  };

  const handlePickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (!selected || !pickerMode) {
      return;
    }
    const next = new Date(pickerValue);
    if (pickerMode === 'date') {
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    } else {
      next.setHours(selected.getHours(), selected.getMinutes());
    }
    setPickerValue(next);
  };

  const handleSaveMorning = () => {
    setDayContext({ date: new Date(), sleepQuality });
    setMorningVisible(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Screen scrollRef={scrollRef}>
      <TodayHeader />
      <View style={styles.stack}>
        <MedicationLogger
          latestIntake={latestIntakeToday}
          onLog={() => openSheet('manual')}
        />
        <EffectCurve intake={latestIntakeToday} offsetMinutes={metabolismOffsetMinutes} />
        <RecentLogs logs={recentLogs} title="Letzte Aktivitaeten" limit={3} />
      </View>

      <Sheet
        visible={sheetMode !== null}
        title={sheetMode === 'edit' ? 'Einnahme bearbeiten' : 'Einnahme erfassen'}
        onClose={closeSheet}
      >
        <View style={styles.sheetSection}>
          <Text style={styles.sheetLabel}>Dosis</Text>
          <View style={styles.row}>
            {[10, 20].map((value) => (
              <Pressable
                key={value}
                style={[styles.optionButton, dose === value ? styles.optionActive : null]}
                onPress={() => setDose(value as DoseMg)}
              >
                <Text style={[styles.optionText, dose === value ? styles.optionTextActive : null]}>
                  {value} mg
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.sheetSection}>
          <Text style={styles.sheetLabel}>Nahrung</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.optionButton, withFood ? styles.optionActive : null]}
              onPress={() => setWithFood(true)}
            >
              <Text style={[styles.optionText, withFood ? styles.optionTextActive : null]}>
                Mit Nahrung
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !withFood ? styles.optionActive : null]}
              onPress={() => setWithFood(false)}
            >
              <Text style={[styles.optionText, !withFood ? styles.optionTextActive : null]}>
                Ohne Nahrung
              </Text>
            </Pressable>
          </View>
        </View>
        {sheetMode === 'manual' || sheetMode === 'edit' ? (
          <View style={styles.sheetSection}>
            <Text style={styles.sheetLabel}>Zeitpunkt</Text>
            <View style={styles.pickerRow}>
              <Pressable style={styles.pickerButton} onPress={() => openPicker('date')}>
                <Text style={styles.pickerLabel}>Datum</Text>
                <Text style={styles.pickerValue}>{formatDateShort(timestamp)}</Text>
              </Pressable>
              <Pressable style={styles.pickerButton} onPress={() => openPicker('time')}>
                <Text style={styles.pickerLabel}>Uhrzeit</Text>
                <Text style={styles.pickerValue}>{formatTime(timestamp)}</Text>
              </Pressable>
            </View>
            {pickerMode ? (
              <View style={styles.inlinePicker}>
                <DateTimePicker
                  value={pickerValue}
                  mode={pickerMode}
                  display="spinner"
                  onChange={handlePickerChange}
                  textColor={Platform.OS === 'ios' ? Colors.foreground : undefined}
                  accentColor={Platform.OS === 'ios' ? Colors.primary : undefined}
                />
                <View style={styles.pickerActions}>
                  <SecondaryButton label="Abbrechen" onPress={cancelPicker} style={styles.pickerAction} />
                  <PrimaryButton
                    label="Fertig"
                    onPress={() => {
                      setTimestamp(new Date(pickerValue));
                      setPickerMode(null);
                    }}
                    style={styles.pickerAction}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
        <PrimaryButton label="Speichern" onPress={handleSaveMedication} />
        <SecondaryButton label="Abbrechen" onPress={closeSheet} style={styles.cancelButton} />
      </Sheet>

      <Sheet visible={morningVisible} title="Morgen-Check" onClose={() => setMorningVisible(false)}>
        <View style={styles.sheetSection}>
          <Text style={styles.sheetLabel}>Schlafqualitaet</Text>
          <View style={styles.sleepGrid}>
            {[
              { value: 1, label: 'Sehr schlecht' },
              { value: 2, label: 'Schlecht' },
              { value: 3, label: 'Okay' },
              { value: 4, label: 'Gut' },
              { value: 5, label: 'Sehr gut' },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.sleepButton,
                  sleepQuality === option.value ? styles.sleepButtonActive : null,
                ]}
                onPress={() => setSleepQuality(option.value)}
              >
                <Text
                  style={[
                    styles.sleepValue,
                    sleepQuality === option.value ? styles.sleepValueActive : null,
                  ]}
                >
                  {option.value}
                </Text>
                <Text style={styles.sleepLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <PrimaryButton label="Speichern" onPress={handleSaveMorning} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  sheetSection: {
    marginBottom: 16,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.muted,
  },
  optionActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 13,
    color: Colors.foreground,
    fontWeight: '600',
  },
  optionTextActive: {
    color: Colors.primaryForeground,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.muted,
  },
  pickerLabel: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: 4,
  },
  inlinePicker: {
    marginTop: 12,
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
  cancelButton: {
    marginTop: 10,
  },
  sleepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sleepButton: {
    width: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    alignItems: 'center',
  },
  sleepButtonActive: {
    backgroundColor: Colors.primary,
  },
  sleepValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  sleepValueActive: {
    color: Colors.primaryForeground,
  },
  sleepLabel: {
    fontSize: 10,
    color: Colors.mutedForeground,
    marginTop: 4,
    textAlign: 'center',
  },
});
