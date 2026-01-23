import { Pill, Focus, Zap, Wind, Coffee, Moon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  type: 'medication' | 'checkin' | 'meal' | 'sleep' | 'note';
  label: string;
  value?: string;
  timestamp: Date;
}

interface RecentLogsProps {
  logs: LogEntry[];
}

const typeConfig = {
  medication: { icon: Pill, color: "text-primary", bg: "bg-sage" },
  checkin: { icon: Focus, color: "text-teal-dark", bg: "bg-teal-light" },
  meal: { icon: Coffee, color: "text-peach-dark", bg: "bg-peach" },
  sleep: { icon: Moon, color: "text-lavender-dark", bg: "bg-lavender" },
  note: { icon: MessageCircle, color: "text-muted-foreground", bg: "bg-muted" },
};

export const RecentLogs = ({ logs }: RecentLogsProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (logs.length === 0) {
    return (
      <div className="card-wellness p-4">
        <h3 className="font-semibold text-foreground mb-3">Today's Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No logs yet today. Start by logging your medication!
        </p>
      </div>
    );
  }

  return (
    <div className="card-wellness p-4">
      <h3 className="font-semibold text-foreground mb-3">Today's Activity</h3>
      
      <div className="space-y-2">
        {logs.slice(0, 5).map((log) => {
          const config = typeConfig[log.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={log.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                config.bg
              )}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {log.label}
                </p>
                {log.value && (
                  <p className="text-xs text-muted-foreground">
                    {log.value}
                  </p>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground">
                {formatTime(log.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export type { LogEntry };
