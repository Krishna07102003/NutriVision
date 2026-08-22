import { useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function UndoToast({ message, onUndo, onDismiss, duration = 5000 }: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (100 / (duration / 50));
        if (next <= 0) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-sm">
      <div className="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl shadow-2xl overflow-hidden border border-[var(--border-color)]">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-bold">{message}</span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-dim transition-colors"
          >
            <Undo2 className="w-3 h-3" />
            Undo
          </button>
        </div>
        <div className="h-[2px] bg-[var(--text-muted)]">
          <div
            className="h-full bg-accent transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
