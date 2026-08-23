import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { sanitizeText } from '../utils/validation';
import type { ChatMessage } from '../types';

interface ChatPageProps {
  chatHistory: ChatMessage[];
  chatLoading: boolean;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  onSend: () => Promise<void>;
}

export default function ChatPage({ chatHistory, chatLoading, chatMessage, setChatMessage, onSend }: ChatPageProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Handle iOS keyboard open/close
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const height = window.innerHeight;
      const visibleHeight = vv.height;
      // If viewport shrunk significantly, keyboard is likely open
      const diff = height - visibleHeight;
      setKeyboardHeight(diff > 100 ? diff : 0);
    };

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, keyboardHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim() && !chatLoading) onSend();
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: keyboardHeight > 0
          ? `calc(100dvh - ${120 + keyboardHeight}px)`
          : 'calc(100dvh - 120px)',
        transition: 'height 0.2s ease',
      }}
    >
      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border-color)]">
        <button onClick={() => navigate('/')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm text-[var(--text-primary)] font-bold">NutriVision Coach</h2>
          <p className="text-[10px] text-[var(--text-muted)]">AI-powered nutrition assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4" style={{ scrollbarWidth: 'thin' }}>
        {chatHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Ask me anything about nutrition</p>
            <p className="text-xs text-[var(--text-muted)]">I know your goals, diet, and today's meals</p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-accent text-white rounded-br-md'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-md'
            }`}>
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
            )}
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input — stays above keyboard */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
        <input
          ref={inputRef}
          type="text"
          value={chatMessage}
          onChange={(e) => { const v = e.target.value; if (v.length <= 2000) setChatMessage(v); }}
          placeholder={t('typeMessage')}
          maxLength={2000}
          disabled={chatLoading}
          className="flex-1 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!chatMessage.trim() || chatLoading}
          className="w-12 h-12 bg-accent hover:bg-accent-dim disabled:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
