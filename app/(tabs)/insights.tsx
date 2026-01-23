import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { RecentLogs } from '@/components/RecentLogs';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { buildExportMarkdown } from '@/lib/export';
import { buildLogsForRange } from '@/lib/logs';
import { endOfDay, startOfDay } from '@/lib/date';

export default function InsightsScreen() {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const [days, setDays] = useState(3);
  const [visibleLogCount, setVisibleLogCount] = useState(10);
  const router = useRouter();
  const intakes = useAppStore((state) => state.intakes);
  const checkins = useAppStore((state) => state.checkins);
  const notes = useAppStore((state) => state.notes);
  const meals = useAppStore((state) => state.meals);
  const dayContexts = useAppStore((state) => state.dayContexts);

  const todayStart = startOfDay(new Date()).getTime();
  const todayEnd = endOfDay(new Date()).getTime();

  const todayLogs = useMemo(
    () => buildLogsForRange({ intakes, checkins, notes, meals }, todayStart, todayEnd),
    [intakes, checkins, notes, meals, todayStart, todayEnd]
  );
  const allLogs = useMemo(
    () => buildLogsForRange({ intakes, checkins, notes, meals }, 0, Number.MAX_SAFE_INTEGER),
    [intakes, checkins, notes, meals]
  );

  const stats = useMemo(
    () => ({
      totalLogs: todayLogs.length,
      checkins: checkins.filter((entry) => entry.timestamp >= todayStart && entry.timestamp <= todayEnd).length,
      notes: notes.filter((entry) => entry.timestamp >= todayStart && entry.timestamp <= todayEnd).length,
      streak: 7,
    }),
    [todayLogs.length, checkins, notes, todayStart, todayEnd]
  );

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setVisibleLogCount(10);
      return () => undefined;
    }, [])
  );

  const handleExport = async () => {
    const markdown = buildExportMarkdown({
      days,
      intakes,
      checkins,
      notes,
      meals,
      dayContexts,
    });
    await Clipboard.setStringAsync(markdown);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Export kopiert', 'Der Bericht liegt in der Zwischenablage.');
  };

  return (
    <Screen scrollRef={scrollRef}>
      <SectionHeader
        title="Auswertung"
        subtitle="Muster erkennen und fuer KI-Analyse exportieren"
        right={(
          <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Feather name="settings" size={18} color={Colors.foreground} />
          </Pressable>
        )}
      />

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Logs heute</Text>
          <Text style={styles.statValue}>{stats.totalLogs}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Check-ins</Text>
          <Text style={styles.statValue}>{stats.checkins}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{stats.streak}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Notizen</Text>
          <Text style={styles.statValue}>{stats.notes}</Text>
        </Card>
      </View>

      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Exportbereich</Text>
          <Text style={styles.cardSubtitle}>Waehle die Anzahl der Tage (1-7)</Text>
          <View style={styles.chipRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <Pressable
                key={value}
                style={[styles.chip, days === value ? styles.chipActive : null]}
                onPress={() => setDays(value)}
              >
                <Text style={[styles.chipText, days === value ? styles.chipTextActive : null]}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton label="Export in Zwischenablage" onPress={handleExport} />
        </Card>
        <View>
          <RecentLogs
            logs={allLogs}
            title="Aktivitaeten Historie"
            emptyText="Noch keine Aktivitaeten vorhanden."
            limit={visibleLogCount}
            showDate
          />
          {visibleLogCount < allLogs.length ? (
            <SecondaryButton
              label="Mehr..."
              onPress={() => setVisibleLogCount((count) => Math.min(count + 10, allLogs.length))}
              style={styles.loadMore}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
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
  },
  stack: {
    gap: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flexBasis: '48%',
    padding: 14,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.foreground,
    marginTop: 6,
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
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    minWidth: 34,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.muted,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.foreground,
  },
  chipTextActive: {
    color: Colors.primaryForeground,
  },
  loadMore: {
    marginTop: 10,
  },
});
