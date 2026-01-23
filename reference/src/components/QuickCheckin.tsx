import { useState } from "react";
import { Focus, Zap, Wind, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckinItem {
  id: string;
  icon: typeof Focus;
  label: string;
  color: string;
  bgColor: string;
}

const checkinItems: CheckinItem[] = [
  { id: "focus", icon: Focus, label: "Focus", color: "text-teal-dark", bgColor: "bg-teal-light" },
  { id: "irritability", icon: Zap, label: "Irritability", color: "text-peach-dark", bgColor: "bg-peach" },
  { id: "restlessness", icon: Wind, label: "Restless", color: "text-lavender-dark", bgColor: "bg-lavender" },
];

const levels = [
  { value: 1, label: "Low" },
  { value: 2, label: "Med" },
  { value: 3, label: "High" },
];

interface CheckinData {
  [key: string]: number | null;
}

interface QuickCheckinProps {
  onCheckin: (data: CheckinData) => void;
}

export const QuickCheckin = ({ onCheckin }: QuickCheckinProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [values, setValues] = useState<CheckinData>({});
  const [recentCheckin, setRecentCheckin] = useState<string | null>(null);

  const handleValueSelect = (itemId: string, value: number) => {
    const newValues = { ...values, [itemId]: value };
    setValues(newValues);
    setRecentCheckin(itemId);
    setActiveItem(null);
    onCheckin(newValues);
    
    setTimeout(() => setRecentCheckin(null), 2000);
  };

  return (
    <div className="card-wellness p-4">
      <h3 className="font-semibold text-foreground mb-4">Quick Check-in</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {checkinItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const currentValue = values[item.id];
          const justLogged = recentCheckin === item.id;
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => setActiveItem(isActive ? null : item.id)}
                className={cn(
                  "w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  isActive ? "ring-2 ring-primary ring-offset-2" : "",
                  justLogged ? "animate-pulse" : "",
                  item.bgColor
                )}
              >
                {justLogged ? (
                  <Check className={cn("w-6 h-6", item.color)} />
                ) : (
                  <Icon className={cn("w-6 h-6", item.color)} />
                )}
                <span className={cn("text-xs font-medium", item.color)}>
                  {item.label}
                </span>
                {currentValue && !justLogged && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center",
                    item.bgColor, item.color
                  )}>
                    {currentValue}
                  </span>
                )}
              </button>
              
              {isActive && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-card rounded-xl shadow-lg p-2 flex gap-1">
                  {levels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleValueSelect(item.id, level.value)}
                      className={cn(
                        "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors",
                        "hover:bg-muted",
                        currentValue === level.value && "bg-primary text-primary-foreground"
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
