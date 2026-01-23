import { TodayHeader } from "@/components/TodayHeader";
import { MedicationLogger } from "@/components/MedicationLogger";
import { EffectCurve } from "@/components/EffectCurve";
import { QuickCheckin } from "@/components/QuickCheckin";
import { RecentLogs, LogEntry } from "@/components/RecentLogs";

interface HomeViewProps {
  medicationTakenAt: Date | null;
  onLogMedication: () => void;
  logs: LogEntry[];
  onCheckin: (data: Record<string, number | null>) => void;
}

export const HomeView = ({ medicationTakenAt, onLogMedication, logs, onCheckin }: HomeViewProps) => {
  return (
    <div className="px-4 pb-24 pt-2 space-y-4">
      <TodayHeader />
      <MedicationLogger 
        takenAt={medicationTakenAt} 
        onLogMedication={onLogMedication} 
      />
      <EffectCurve takenAt={medicationTakenAt} />
      <QuickCheckin onCheckin={onCheckin} />
      <RecentLogs logs={logs} />
    </div>
  );
};
