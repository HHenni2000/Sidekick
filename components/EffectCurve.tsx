import { Card } from '@/components/Card';
import { Colors } from '@/constants/Colors';
import { formatTime } from '@/lib/date';
import { buildEffectPoints, EFFECT_WINDOW, getCurrentHourMarker, getEffectAtHour } from '@/lib/effectCurve';
import { MedicationIntake } from '@/types/app';
import { scaleLinear } from 'd3-scale';
import { area, curveCatmullRom, line } from 'd3-shape';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

interface EffectCurveProps {
  intake: MedicationIntake | null;
  offsetMinutes: number;
}

export const EffectCurve = ({ intake, offsetMinutes }: EffectCurveProps) => {
  const [width, setWidth] = useState(0);
  const height = 140;
  const chartPaddingBottom = 15;
  const dose = intake?.doseMg ?? 10;
  const takenAt = intake ? new Date(intake.timestamp) : null;
  const hasIntake = Boolean(intake);
  const axisLabelWidth = 52;

  const points = useMemo(() => buildEffectPoints(dose, offsetMinutes), [dose, offsetMinutes]);
  const { currentHour, isActive } = useMemo(
    () => getCurrentHourMarker(takenAt, offsetMinutes),
    [takenAt, offsetMinutes]
  );
  const axisTicks = useMemo(() => {
    const ticks: number[] = [];
    const stepHours = 2;
    for (let h = EFFECT_WINDOW.startHours; h <= EFFECT_WINDOW.endHours; h += stepHours) {
      ticks.push(h);
    }
    if (ticks[ticks.length - 1] !== EFFECT_WINDOW.endHours) {
      ticks.push(EFFECT_WINDOW.endHours);
    }

    const formatRelative = (hour: number) => {
      const totalMinutes = Math.max(0, Math.round(hour * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = String(totalMinutes % 60).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return ticks.map((hour) => ({
      hour,
      label: takenAt
        ? formatTime(new Date(takenAt.getTime() + hour * 60 * 60 * 1000))
        : formatRelative(hour),
    }));
  }, [takenAt]);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const xScale = useMemo(() => {
    if (width === 0) {
      return null;
    }
    return scaleLinear()
      .domain([EFFECT_WINDOW.startHours, EFFECT_WINDOW.endHours])
      .range([axisLabelWidth / 2, width - axisLabelWidth / 2]);
  }, [width, axisLabelWidth]);

  const yScale = useMemo(() => {
    if (width === 0) {
      return null;
    }
    const maxEffect = points.reduce((max, point) => Math.max(max, point.effect), 0);
    const upper = Math.max(60, Math.ceil(maxEffect * 1.05));
    return scaleLinear().domain([0, upper]).range([height - chartPaddingBottom, 0]);
  }, [width, points, chartPaddingBottom]);

  const pathData = useMemo(() => {
    if (width === 0) {
      return { areaPath: '', linePath: '' };
    }

    const areaPath = area<{ hour: number; effect: number }>()
      .x((d) => (xScale ? xScale(d.hour) : 0))
      .y0(height - chartPaddingBottom)
      .y1((d) => (yScale ? yScale(d.effect) : 0))
      .curve(curveCatmullRom.alpha(0.5))(points);

    const linePath = line<{ hour: number; effect: number }>()
      .x((d) => (xScale ? xScale(d.hour) : 0))
      .y((d) => (yScale ? yScale(d.effect) : 0))
      .curve(curveCatmullRom.alpha(0.5))(points);

    return { areaPath: areaPath ?? '', linePath: linePath ?? '' };
  }, [points, width, xScale, yScale]);

  const currentX = xScale ? xScale(currentHour) : 0;

  const currentEffect = useMemo(() => {
    return getEffectAtHour(currentHour, offsetMinutes, dose);
  }, [currentHour, offsetMinutes, dose]);

  const currentY = yScale ? yScale(currentEffect) : 0;

  const axisPositions = useMemo(() => {
    if (!xScale || width === 0) {
      return [];
    }
    const positions = axisTicks.map((tick) => ({
      ...tick,
      left: xScale(tick.hour) - axisLabelWidth / 2,
    }));

    if (positions.length <= 2) {
      return positions;
    }

    const placed: { hour: number; label: string; left: number }[] = [];
    positions.forEach((tick) => {
      const overlaps = placed.some((prev) => Math.abs(prev.left - tick.left) < axisLabelWidth * 0.85);
      if (!overlaps) {
        placed.push(tick);
      }
    });

    return placed;
  }, [axisTicks, xScale, width, axisLabelWidth]);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Wirkstoffkurve</Text>
        {isActive ? <Text style={styles.activeBadge}>Aktiv</Text> : null}
      </View>
      <View style={styles.chart} onLayout={onLayout}>
        {width > 0 ? (
          hasIntake ? (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id="effectGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={Colors.curveActive} stopOpacity={0.6} />
                  <Stop offset="50%" stopColor={Colors.curvePeak} stopOpacity={0.3} />
                  <Stop offset="100%" stopColor={Colors.curveFade} stopOpacity={0.1} />
                </LinearGradient>
              </Defs>
              {pathData.areaPath ? (
                <Path d={pathData.areaPath} fill="url(#effectGradient)" />
              ) : null}
              {pathData.linePath ? (
                <Path d={pathData.linePath} stroke={Colors.primary} strokeWidth={2} fill="none" />
              ) : null}
              {isActive ? (
                <Line
                  x1={currentX}
                  x2={currentX}
                  y1={0}
                  y2={height}
                  stroke={Colors.sageDark}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              ) : null}
              {isActive ? (
                <>
                  <Circle
                    cx={currentX}
                    cy={currentY}
                    r={5}
                    fill={Colors.card}
                    stroke={Colors.primary}
                    strokeWidth={2}
                  />
                </>
              ) : null}
            </Svg>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Noch keine Einnahme erfasst</Text>
              <Text style={styles.emptyText}>Die Wirkstoffkurve erscheint nach der Einnahme.</Text>
            </View>
          )
        ) : null}
      </View>
      {hasIntake ? (
        <View style={styles.axisRow}>
          {axisPositions.map((tick) => (
            <Text key={`${tick.label}-${tick.hour}`} style={[styles.axisLabel, { left: tick.left }]}>
              {tick.label}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.foreground,
  },
  activeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.sageDark,
    backgroundColor: Colors.sage,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chart: {
    height: 120,
    width: '100%',
  },
  axisRow: {
    marginTop: 6,
    height: 26,
    position: 'relative',
    overflow: 'visible',
  },
  axisLabel: {
    position: 'absolute',
    width: 52,
    textAlign: 'center',
    fontSize: 10,
    color: Colors.mutedForeground,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.foreground,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 11,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
});
