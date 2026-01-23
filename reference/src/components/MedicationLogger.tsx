import { Pill, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicationLoggerProps {
  takenAt: Date | null;
  onLogMedication: () => void;
}

export const MedicationLogger = ({ takenAt, onLogMedication }: MedicationLoggerProps) => {
  const isTakenToday = takenAt && new Date().toDateString() === takenAt.toDateString();
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card-wellness p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isTakenToday ? "bg-sage" : "bg-peach"
          )}>
            <Pill className={cn(
              "w-6 h-6",
              isTakenToday ? "text-sage-dark" : "text-peach-dark"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Medikinet Adult</h3>
            <p className="text-sm text-muted-foreground">
              {isTakenToday ? `Taken at ${formatTime(takenAt!)}` : 'Not taken yet'}
            </p>
          </div>
        </div>
        
        {isTakenToday && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
      
      <button
        onClick={onLogMedication}
        disabled={isTakenToday}
        className={cn(
          "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200",
          isTakenToday 
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "btn-log"
        )}
      >
        {isTakenToday ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Logged for Today
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            Log Medication Now
          </span>
        )}
      </button>
    </div>
  );
};
