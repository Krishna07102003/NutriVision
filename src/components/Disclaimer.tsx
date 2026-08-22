import { AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="flex items-start gap-3 text-[var(--text-muted)]">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--text-muted)]" />
      <p className="text-xs leading-relaxed">
        This app provides general nutrition guidance and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.
      </p>
    </div>
  );
}
