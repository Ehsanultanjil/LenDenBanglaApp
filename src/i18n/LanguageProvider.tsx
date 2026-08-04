import { createContext, useContext, useMemo, useState } from 'react';
import { translations, type Language, type Strings } from './translations';
import { toBanglaDigits } from './numerals';
import { formatBDT, formatDate } from '@/lib/format';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  strings: Strings;
  fontFamily: string;
  formatNumber: (n: number) => string;
  formatCurrency: (amount: number, compact?: boolean) => string;
  formatDate: (iso: string) => string;
  formatMonthYear: (iso: string) => string;
}

/** Bangla uses the Bengali calendar month names via the bn-BD locale. */
const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en-US',
  bn: 'bn-BD',
};

const FONT_BY_LANGUAGE: Record<Language, string> = {
  en: 'Inter_400Regular',
  bn: 'HindSiliguri_400Regular',
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const value = useMemo<LanguageContextValue>(() => {
    const localize = (s: string) => (language === 'bn' ? toBanglaDigits(s) : s);
    const t = translations[language];
    const locale = LOCALE_BY_LANGUAGE[language];
    return {
      language,
      setLanguage,
      strings: t,
      fontFamily: FONT_BY_LANGUAGE[language],
      formatNumber: (n: number) => localize(n.toLocaleString('en-US')),
      formatCurrency: (amount: number, compact = false) => localize(formatBDT(amount, compact)),
      // Relative labels come from the string table so they translate; only the
      // absolute fallback goes through toLocaleDateString.
      formatDate: (iso: string) =>
        localize(
          formatDate(iso, {
            today: t.common.today,
            yesterday: t.common.yesterday,
            daysAgo: t.common.daysAgo,
            locale,
          })
        ),
      formatMonthYear: (iso: string) =>
        localize(new Date(iso).toLocaleDateString(locale, { month: 'short', year: '2-digit' })),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
