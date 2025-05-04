
import React, { createContext, useContext, useState, useEffect } from "react";

// Define supported languages
export type SupportedLanguage = "sk" | "cs" | "en";

// Define the context type
type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "sk",
  setLanguage: () => {},
  t: (key: string) => key
});

// Translation data
const translations: Record<SupportedLanguage, Record<string, string>> = {
  sk: {
    // Slovak translations
    "welcome": "Vitajte na Majstri.com",
    "platform_description": "Platforma spájajúca profesionálnych remeselníkov s ľuďmi, ktorí hľadajú ich služby",
    "craftsman": "Som remeselník",
    "customer": "Som zákazník",
    "craftsman_desc": "Prezentujte svoje zručnosti a nájdite nových klientov vo vašom okolí",
    "customer_desc": "Nájdite spoľahlivých remeselníkov pre vaše projekty a vylepšenia domácnosti",
    "login": "Prihlásenie",
    "register": "Registrovať sa",
    "start": "Začať",
    "copyright": "Spájame remeselníkov a zákazníkov"
  },
  cs: {
    // Czech translations
    "welcome": "Vítejte na Majstri.com",
    "platform_description": "Platforma spojující profesionální řemeslníky s lidmi, kteří hledají jejich služby",
    "craftsman": "Jsem řemeslník",
    "customer": "Jsem zákazník",
    "craftsman_desc": "Prezentujte své dovednosti a najděte nové klienty ve vašem okolí",
    "customer_desc": "Najděte spolehlivé řemeslníky pro vaše projekty a vylepšení domácnosti",
    "login": "Přihlášení",
    "register": "Registrovat se",
    "start": "Začít",
    "copyright": "Spojujeme řemeslníky a zákazníky"
  },
  en: {
    // English translations
    "welcome": "Welcome to Majstri.com",
    "platform_description": "A platform connecting professional craftsmen with people looking for their services",
    "craftsman": "I am a craftsman",
    "customer": "I am a customer",
    "craftsman_desc": "Showcase your skills and find new clients in your area",
    "customer_desc": "Find reliable craftsmen for your projects and home improvements",
    "login": "Login",
    "register": "Register",
    "start": "Start",
    "copyright": "Connecting craftsmen and customers"
  }
};

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get initial language from localStorage or use browser language or default to Slovak
  const getInitialLanguage = (): SupportedLanguage => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && ["sk", "cs", "en"].includes(savedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }
    
    // Check browser language
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "cs") return "cs";
    if (browserLang === "en") return "en";
    
    // Default to Slovak
    return "sk";
  };

  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Update language and save to localStorage
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  // Set html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
