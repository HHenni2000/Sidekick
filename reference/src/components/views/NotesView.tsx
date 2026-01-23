import { useState } from "react";
import { Send, Lightbulb, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

interface NotesViewProps {
  notes: Note[];
  onAddNote: (content: string) => void;
}

export const NotesView = ({ notes, onAddNote }: NotesViewProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onAddNote(input.trim());
      setInput("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickNotes = [
    "Feeling focused",
    "Appetite low",
    "Slight headache",
    "Very productive",
    "Feeling anxious",
    "Calm & clear",
  ];

  return (
    <div className="px-4 pb-24 pt-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quick Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Capture thoughts for pattern analysis
        </p>
      </div>

      {/* Quick note buttons */}
      <div className="flex flex-wrap gap-2">
        {quickNotes.map((note) => (
          <button
            key={note}
            onClick={() => onAddNote(note)}
            className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-sage hover:text-sage-dark transition-colors"
          >
            {note}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="card-wellness p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="What's on your mind..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
            input.trim() 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="card-wellness p-6 text-center">
            <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No notes yet. Capture a thought!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="card-wellness p-4">
              <p className="text-sm text-foreground">{note.content}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTime(note.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export type { Note };
