import { X } from 'lucide-react';

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-950 border border-red-800 text-red-200 px-5 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3">
      {message}
      <button onClick={onDismiss} className="text-red-400 hover:text-red-200">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
