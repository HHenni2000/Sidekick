import { Bell } from "lucide-react";

export const TodayHeader = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <header className="flex items-center justify-between py-4 px-1">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting} <span className="inline-block animate-pulse">💊</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatDate(now)}
        </p>
      </div>
      
      <button className="relative w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95">
        <Bell className="w-5 h-5 text-foreground" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full" />
      </button>
    </header>
  );
};
