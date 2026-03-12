"use client";

import { createContext, useContext, useState } from "react";

const LanguageContext = createContext<{
  lang: string;
  setLang: (l: string) => void;
}>({ lang: "curl", setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("curl");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
