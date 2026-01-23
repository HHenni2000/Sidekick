import { StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/Colors';
import { ActivityLogEntry } from '@/types/app';
import { formatDateShort, formatTime } from '@/lib/date';

interface RecentLogsProps {
  logs: ActivityLogEntry[];
  title?: string;
  emptyText?: string;
  limit?: number;
  showDate?: boolean;
}

const typeConfig = {
  medication: { icon: 'pill', color: Colors.primary, bg: Colors.sage },
  checkin: { icon: 'target', color: Colors.tealDark, bg: Colors.tealLight },
  meal: { icon: 'coffee', color: Colors.peachDark, bg: Colors.peach },
  sleep: { icon: 'moon', color: Colors.lavenderDark, bg: Colors.lavender },
  note: { icon: 'message-circle', color: Colors.mutedForeground, bg: Colors.muted },
};

export const RecentLogs = ({
  logs,
  title = 'Letzte Aktivitaeten',
  emptyText = 'Noch keine Aktivitaeten erfasst.',
  limit = 3,
  showDate = false,
}: RecentLogsProps) => {
  const visibleLogs = limit ? logs.slice(0, limit) : logs;

  if (logs.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>{emptyText}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {visibleLogs.map((log) => {
          const config = typeConfig[log.type];
          const Icon = log.type === 'medication' ? MaterialCommunityIcons : Feather;
          const iconName = config.icon as any;
          const timestamp = new Date(log.timestamp);
          const timeLabel = showDate
            ? `${formatDateShort(timestamp)} ${formatTime(timestamp)}`
            : formatTime(timestamp);

          return (
            <View key={log.id} style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
                <Icon name={iconName} size={16} color={config.color} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.label} numberOfLines={1}>
                  {log.label}
                </Text>
                {log.value ? <Text style={styles.value}>{log.value}</Text> : null}
              </View>
              <Text style={styles.time}>{timeLabel}</Text>
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
  empty: {
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
    paddingVertical: 8,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.foreground,
  },
  value: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  time: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginLeft: 8,
  },
});
