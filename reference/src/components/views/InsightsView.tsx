import { Download, TrendingUp, Calendar, BarChart2 } from "lucide-react";
import { LogEntry } from "@/components/RecentLogs";
import { Note } from "@/components/views/NotesView";
import { cn } from "@/lib/utils";

interface InsightsViewProps {
  logs: LogEntry[];
  notes: Note[];
  medicationTakenAt: Date | null;
}

export const InsightsView = ({ logs, notes, medicationTakenAt }: InsightsViewProps) => {
  
  const generateExport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    
    let exportText = `# Sidekick Daily Report - ${dateStr}\n\n`;
    
    exportText += `## Medication\n`;
    if (medicationTakenAt && medicationTakenAt.toDateString() === now.toDateString()) {
      exportText += `- Medikinet Adult taken at ${medicationTakenAt.toLocaleTimeString()}\n\n`;
    } else {
      exportText += `- Not taken today\n\n`;
    }
    
    exportText += `## Activity Log\n`;
    if (logs.length > 0) {
      logs.forEach(log => {
        exportText += `- [${log.timestamp.toLocaleTimeString()}] ${log.label}`;
        if (log.value) exportText += ` - ${log.value}`;
        exportText += `\n`;
      });
    } else {
      exportText += `- No activities logged\n`;
    }
    exportText += `\n`;
    
    exportText += `## Notes\n`;
    if (notes.length > 0) {
      notes.forEach(note => {
        exportText += `- [${note.timestamp.toLocaleTimeString()}] ${note.content}\n`;
      });
    } else {
      exportText += `- No notes captured\n`;
    }
    
    exportText += `\n---\n`;
    exportText += `*Export this to ChatGPT for personalized insights and pattern analysis*`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
      alert('Report copied to clipboard! Paste into ChatGPT for analysis.');
    });
  };

  const stats = {
    totalLogs: logs.length,
    checkins: logs.filter(l => l.type === 'checkin').length,
    notes: notes.length,
    streak: 7, // Placeholder
  };

  return (
    <div className="px-4 pb-24 pt-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track patterns and export for AI analysis
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-wellness p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Today's Logs</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalLogs}</p>
        </div>
        
        <div className="card-wellness p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-sage-dark" />
            <span className="text-xs text-muted-foreground">Check-ins</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.checkins}</p>
        </div>
        
        <div className="card-wellness p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-peach-dark" />
            <span className="text-xs text-muted-foreground">Day Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
        </div>
        
        <div className="card-wellness p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">💭</span>
            <span className="text-xs text-muted-foreground">Notes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.notes}</p>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={generateExport}
        className="w-full btn-log py-4 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Export for ChatGPT Analysis
      </button>

      {/* Export Preview */}
      <div className="card-wellness p-4 bg-gradient-to-br from-cream to-muted">
        <h4 className="font-semibold text-sm text-foreground mb-2">
          What gets exported?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Medication timing</li>
          <li>• Focus/irritability/restlessness levels</li>
          <li>• Meal and sleep logs</li>
          <li>• All notes with timestamps</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Paste into ChatGPT to discover patterns and get personalized insights.
        </p>
      </div>
    </div>
  );
};
