import { useState } from "react";
import { Coffee, Moon, Utensils, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckinViewProps {
  onLogMeal: () => void;
  onLogSleep: (quality: number) => void;
}

export const CheckinView = ({ onLogMeal, onLogSleep }: CheckinViewProps) => {
  const [mealLogged, setMealLogged] = useState(false);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  
  const handleMealLog = () => {
    setMealLogged(true);
    onLogMeal();
    setTimeout(() => setMealLogged(false), 3000);
  };

  const handleSleepLog = (quality: number) => {
    setSleepQuality(quality);
    onLogSleep(quality);
  };

  const sleepOptions = [
    { value: 1, label: "Poor", emoji: "😴" },
    { value: 2, label: "Fair", emoji: "😐" },
    { value: 3, label: "Good", emoji: "😊" },
    { value: 4, label: "Great", emoji: "🌟" },
  ];

  return (
    <div className="px-4 pb-24 pt-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track factors that affect your medication
        </p>
      </div>

      {/* Meal Tracking */}
      <div className="card-wellness p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-peach flex items-center justify-center">
            <Utensils className="w-5 h-5 text-peach-dark" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Meals</h3>
            <p className="text-xs text-muted-foreground">
              Food affects absorption timing
            </p>
          </div>
        </div>
        
        <button
          onClick={handleMealLog}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
            mealLogged 
              ? "bg-sage text-sage-dark" 
              : "btn-checkin"
          )}
        >
          {mealLogged ? (
            <>
              <Check className="w-4 h-4" />
              Meal Logged
            </>
          ) : (
            <>
              <Coffee className="w-4 h-4" />
              Log Meal
            </>
          )}
        </button>
      </div>

      {/* Sleep Quality */}
      <div className="card-wellness p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center">
            <Moon className="w-5 h-5 text-lavender-dark" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Last Night's Sleep</h3>
            <p className="text-xs text-muted-foreground">
              Sleep impacts medication effectiveness
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {sleepOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSleepLog(option.value)}
              className={cn(
                "py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200",
                sleepQuality === option.value 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                  : "bg-muted hover:bg-sage/50"
              )}
            >
              <span className="text-lg">{option.emoji}</span>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="card-wellness p-4 bg-gradient-to-br from-teal-light to-sage/30">
        <h4 className="font-semibold text-foreground text-sm mb-2">💡 Tip</h4>
        <p className="text-sm text-muted-foreground">
          Taking Medikinet with food can delay the first peak by 30-60 minutes but may reduce side effects.
        </p>
      </div>
    </div>
  );
};
