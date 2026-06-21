import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { storage } from "../utils/storage";
import { LANGUAGES, DEFAULT_LANGUAGE_CODE, type Language } from "./languages";
import { dictionaries } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguageCode: (code: string) => void;
  languages: Language[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const STORAGE_KEY = "ippoo_cash_language";

function resolve(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string>(() => {
    const stored = storage.get<string>(STORAGE_KEY);
    return stored && LANGUAGES.some((l) => l.code === stored) ? stored : DEFAULT_LANGUAGE_CODE;
  });

  const language = resolve(code);

  useEffect(() => {
    document.documentElement.lang = language.bcp47;
  }, [language.bcp47]);

  const setLanguageCode = (next: string) => {
    setCode(next);
    storage.set(STORAGE_KEY, next);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const dict = dictionaries[language.code] ?? dictionaries.fr;
    const fr = dictionaries.fr;
    const value = dict[key] ?? fr[key] ?? key;
    return format(value, params);
  }, [language.code]);

  return (
    <LanguageContext.Provider value={{ language, setLanguageCode, languages: LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const fallbackT: LanguageContextValue["t"] = (key, params) => {
  const value = dictionaries.fr[key] ?? key;
  return format(value, params);
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { language: LANGUAGES[0], setLanguageCode: () => {}, languages: LANGUAGES, t: fallbackT };
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
