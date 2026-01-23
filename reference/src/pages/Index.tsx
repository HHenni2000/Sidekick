import { useState, useCallback } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { HomeView } from "@/components/views/HomeView";
import { CheckinView } from "@/components/views/CheckinView";
import { NotesView, Note } from "@/components/views/NotesView";
import { InsightsView } from "@/components/views/InsightsView";
import { LogEntry } from "@/components/RecentLogs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [medicationTakenAt, setMedicationTakenAt] = useState<Date | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    setLogs(prev => [{
      ...entry,
      id: Date.now().toString(),
    }, ...prev]);
  }, []);

  const handleLogMedication = useCallback(() => {
    const now = new Date();
    setMedicationTakenAt(now);
    addLog({
      type: 'medication',
      label: 'Medikinet Adult',
      value: `Taken at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: now,
    });
  }, [addLog]);

  const handleCheckin = useCallback((data: Record<string, number | null>) => {
    const levelLabels = ['', 'Low', 'Medium', 'High'];
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        addLog({
          type: 'checkin',
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: levelLabels[value],
          timestamp: new Date(),
        });
      }
    });
  }, [addLog]);

  const handleLogMeal = useCallback(() => {
    addLog({
      type: 'meal',
      label: 'Meal logged',
      timestamp: new Date(),
    });
  }, [addLog]);

  const handleLogSleep = useCallback((quality: number) => {
    const qualityLabels = ['', 'Poor', 'Fair', 'Good', 'Great'];
    addLog({
      type: 'sleep',
      label: 'Sleep quality',
      value: qualityLabels[quality],
      timestamp: new Date(),
    });
  }, [addLog]);

  const handleAddNote = useCallback((content: string) => {
    const now = new Date();
    setNotes(prev => [{
      id: Date.now().toString(),
      content,
      timestamp: now,
    }, ...prev]);
    addLog({
      type: 'note',
      label: content.length > 30 ? content.slice(0, 30) + '...' : content,
      timestamp: now,
    });
  }, [addLog]);

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            medicationTakenAt={medicationTakenAt}
            onLogMedication={handleLogMedication}
            logs={logs}
            onCheckin={handleCheckin}
          />
        );
      case 'checkin':
        return (
          <CheckinView
            onLogMeal={handleLogMeal}
            onLogSleep={handleLogSleep}
          />
        );
      case 'notes':
        return (
          <NotesView
            notes={notes}
            onAddNote={handleAddNote}
          />
        );
      case 'insights':
        return (
          <InsightsView
            logs={logs}
            notes={notes}
            medicationTakenAt={medicationTakenAt}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MobileLayout>
      {renderView()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </MobileLayout>
  );
};

export default Index;
