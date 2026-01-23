import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from "recharts";

interface EffectCurveProps {
  takenAt: Date | null;
}

export const EffectCurve = ({ takenAt }: EffectCurveProps) => {
  // Medikinet Adult has biphasic release: 50% immediate, 50% delayed (~4h)
  // Peak 1: ~1-2h, Peak 2: ~5-6h, Duration: ~8h total
  
  const { data, currentHour, isActive } = useMemo(() => {
    const points = [];
    const now = new Date();
    
    for (let h = 0; h <= 10; h += 0.5) {
      // Biphasic curve modeling
      const immediate = Math.exp(-Math.pow(h - 1.5, 2) / 2) * 0.6;
      const delayed = Math.exp(-Math.pow(h - 5.5, 2) / 3) * 0.5;
      const effect = Math.max(0, (immediate + delayed) * 100);
      
      points.push({
        hour: h,
        effect: Math.round(effect),
        label: `${Math.floor(h)}h`,
      });
    }
    
    let currentHour = 0;
    let isActive = false;
    
    if (takenAt) {
      const hoursSinceTaken = (now.getTime() - takenAt.getTime()) / (1000 * 60 * 60);
      currentHour = Math.max(0, Math.min(10, hoursSinceTaken));
      isActive = hoursSinceTaken >= 0 && hoursSinceTaken <= 10;
    }
    
    return { data: points, currentHour, isActive };
  }, [takenAt]);

  const formatTime = (hour: number) => {
    if (!takenAt) return `+${hour}h`;
    const time = new Date(takenAt.getTime() + hour * 60 * 60 * 1000);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card-wellness p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Effect Timeline</h3>
        {isActive && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-sage text-sage-dark">
            Active
          </span>
        )}
      </div>
      
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="effectGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(168, 55%, 45%)" stopOpacity={0.6} />
                <stop offset="50%" stopColor="hsl(15, 70%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(180, 20%, 75%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(200, 10%, 50%)' }}
              tickFormatter={(h) => h % 2 === 0 ? `${h}h` : ''}
            />
            <YAxis hide domain={[0, 70]} />
            {isActive && (
              <ReferenceLine 
                x={currentHour} 
                stroke="hsl(168, 45%, 35%)" 
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
            <Area
              type="monotone"
              dataKey="effect"
              stroke="hsl(168, 45%, 35%)"
              strokeWidth={2}
              fill="url(#effectGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Peak 1 (~1.5h)</span>
        <span>Peak 2 (~5.5h)</span>
        <span>Fade (~8h)</span>
      </div>
    </div>
  );
};
