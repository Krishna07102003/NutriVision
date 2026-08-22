import { useState } from 'react';
import { X, MessageSquareWarning, Bug, Lightbulb, Heart, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { sanitizeText, isValidEmail } from '../utils/validation';
import { checkLimit } from '../utils/rateLimit';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug Report', emoji: '🐛', description: 'Something is broken or not working' },
  { id: 'suggestion', label: 'Suggestion', emoji: '💡', description: 'An idea to make the app better' },
  { id: 'feedback', label: 'General Feedback', emoji: '💬', description: 'Your thoughts or impressions' },
  { id: 'love', label: 'I Love It!', emoji: '❤️', description: 'Share what you enjoy most' },
] as const;

interface FeedbackFormProps {
  userId: string;
  userName?: string;
  onClose: () => void;
}

export default function FeedbackForm({ userId, userName, onClose }: FeedbackFormProps) {
  const [type, setType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = checkLimit('FEEDBACK');
    if (!limit.allowed) {
      setError(`Too many submissions. Please wait ${limit.retryAfter} seconds.`);
      return;
    }
    if (!type || !message.trim()) {
      setError('Please select a type and write your message.');
      return;
    }
    if (email.trim() && !isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('feedback').insert({
        user_id: userId,
        user_name: userName || 'Anonymous',
        type,
        message: sanitizeText(message.trim()),
        email: email.trim() || null,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError('Failed to submit feedback. ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
        <div
          className="w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Thank You!</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Your feedback helps us make NutriVision better. We read every submission.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-dim transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Send Feedback</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Feedback Type */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2 font-semibold uppercase tracking-wider">
              What is this about?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FEEDBACK_TYPES.map((ft) => (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => { setType(ft.id); setError(''); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                    type === ft.id
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)]/30'
                  }`}
                >
                  <span className="text-xl">{ft.emoji}</span>
                  <span className="text-xs font-bold leading-tight">{ft.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-semibold uppercase tracking-wider">
              Your message *
            </label>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(''); }}
              placeholder={
                type === 'bug'
                  ? "Describe the issue. What did you expect vs what happened?"
                  : type === 'suggestion'
                  ? "Tell us your idea. What would you love to see?"
                  : type === 'love'
                  ? "What do you love about NutriVision?"
                  : "Share your thoughts..."
              }
              rows={4}
              maxLength={2000}
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 resize-none"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">{message.length}/2000</p>
          </div>

          {/* Optional Email */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-semibold uppercase tracking-wider">
              Email (optional)
              <span className="normal-case tracking-normal ml-1 font-normal">— if you want us to reply</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!type || !message.trim() || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-dim disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] transition-colors"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
