import { AlertTriangle } from 'lucide-react';

interface ConfirmSheetProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmSheet({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }: ConfirmSheetProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-color)] rounded-t-2xl shadow-2xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-accent/10'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-accent'}`} />
          </div>
          <h3 className="text-base text-[var(--text-primary)] font-bold">{title}</h3>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-6 ml-[52px]">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-accent hover:bg-accent-dim text-[var(--text-primary)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
