import { DoseMg } from '@/types/app';
import { clamp } from '@/lib/date';

export interface EffectPoint {
  hour: number;
  effect: number;
}

export const EFFECT_WINDOW = {
  startHours: 0,
  endHours: 12,
};

const doseScaleFor = (doseMg: DoseMg) => {
  return doseMg === 20 ? 1.15 : 1;
};

const curve = {
  startHour: 0,
  peak1Hour: 1.5,
  plateauStartHour: 3,
  plateauEndHour: 4,
  peak2Hour: 5.5,
  endHour: 12,
  peak1Effect: 100,
  plateauEffect: 80,
  peak2Effect: 95,
};

const sampleStep = 0.5;
const displayExponent = 1.3;

const shapeEffect = (value: number) => {
  const normalized = clamp(value / 100, 0, 1);
  return clamp(Math.pow(normalized, displayExponent) * 100, 0, 100);
};

const baseEffectAtHour = (hour: number) => {
  if (hour <= curve.startHour) {
    return 0;
  }
  if (hour <= curve.peak1Hour) {
    const ratio = (hour - curve.startHour) / (curve.peak1Hour - curve.startHour);
    return curve.peak1Effect * ratio;
  }
  if (hour <= curve.plateauStartHour) {
    const ratio = (hour - curve.peak1Hour) / (curve.plateauStartHour - curve.peak1Hour);
    return curve.peak1Effect + (curve.plateauEffect - curve.peak1Effect) * ratio;
  }
  if (hour <= curve.plateauEndHour) {
    return curve.plateauEffect;
  }
  if (hour <= curve.peak2Hour) {
    const ratio = (hour - curve.plateauEndHour) / (curve.peak2Hour - curve.plateauEndHour);
    return curve.plateauEffect + (curve.peak2Effect - curve.plateauEffect) * ratio;
  }
  if (hour <= curve.endHour) {
    const tailTarget = 2;
    const decay = Math.log(curve.peak2Effect / tailTarget) / (curve.endHour - curve.peak2Hour);
    return curve.peak2Effect * Math.exp(-decay * (hour - curve.peak2Hour));
  }
  return 0;
};

export const getEffectAtHour = (hour: number, offsetMinutes: number, doseMg: DoseMg) => {
  if (hour <= 0) {
    return 0;
  }
  const offsetHours = offsetMinutes / 60;
  const effectiveHour = hour - offsetHours;
  const raw = baseEffectAtHour(effectiveHour) * doseScaleFor(doseMg);
  return shapeEffect(raw);
};

export const buildEffectPoints = (doseMg: DoseMg, offsetMinutes: number) => {
  const points: EffectPoint[] = [];

  for (let h = EFFECT_WINDOW.startHours; h <= EFFECT_WINDOW.endHours; h += sampleStep) {
    const effect = getEffectAtHour(h, offsetMinutes, doseMg);
    points.push({
      hour: Number(h.toFixed(2)),
      effect: Number(effect.toFixed(2)),
    });
  }

  return points;
};

export const getCurrentHourMarker = (takenAt: Date | null, offsetMinutes: number) => {
  if (!takenAt) {
    return { currentHour: 0, isActive: false };
  }

  const now = new Date();
  const hoursSince = (now.getTime() - takenAt.getTime()) / (1000 * 60 * 60);
  const adjusted = hoursSince - offsetMinutes / 60;
  const currentHour = clamp(adjusted, EFFECT_WINDOW.startHours, EFFECT_WINDOW.endHours);
  const isActive = adjusted >= EFFECT_WINDOW.startHours && adjusted <= EFFECT_WINDOW.endHours;

  return { currentHour, isActive };
};
