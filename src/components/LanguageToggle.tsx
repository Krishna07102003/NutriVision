import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const toggle = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors"
      title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <Languages className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      <span className="text-xs text-[var(--text-muted)] font-bold">
        {lang === 'en' ? 'HI' : 'EN'}
      </span>
    </button>
  );
}
