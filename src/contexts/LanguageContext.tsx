
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
    "copyright": "Spájame remeselníkov a zákazníkov",
    
    // Navbar translations
    "home": "Domov",
    "categories": "Kategórie",
    "find_craftsman": "Nájsť remeselníka",
    "jobs": "Zákazky",
    "how_it_works": "Ako to funguje",
    "benefits": "Výhody",
    "messages": "Správy",
    "my_profile": "Môj profil",
    "sign_out": "Odhlásiť sa",
    "sign_in": "Prihlásiť sa",
    
    // Index page translations
    "professional_craftsmen": "Profesionálni remeselníci na jednom mieste",
    "find_best": "Nájdite najlepších",
    "craftsmen": "remeselníkov",
    "platform_connecting": "Platforma, ktorá spája profesionálnych remeselníkov a ľudí, ktorí potrebujú kvalitné služby remeselníkov priamo na Slovensku.",
    "search_profession": "Hľadajte podľa profesie alebo lokality...",
    "search": "Vyhľadať",
    "craftsmen_count": "500+ Remeselníkov",
    "cities_count": "100+ Miest",
    "categories_count": "20+ Kategórií",
    "find_best_craftsmen": "Nájdite najlepších remeselníkov",
    "search_name_craft": "Hľadajte podľa mena alebo remesla...",
    "enter_location": "Zadajte lokalitu...",
    "filter_category": "Filter podľa kategórie",
    "all_categories": "Všetky kategórie",
    "reset": "Reset",
    "view_all_categories": "Zobraziť všetky kategórie",
    "featured_profiles": "Zvýraznené profily sú zobrazené na vrchu",
    "error_loading": "Nastala chyba pri načítaní remeselníkov. Skúste to prosím neskôr.",
    "try_again": "Skúsiť znova",
    "no_craftsmen_found": "Nenašli sa žiadni remeselníci podľa vašich kritérií. Skúste upraviť vyhľadávanie.",
    "show_all_craftsmen": "Zobraziť všetkých remeselníkov",
    
    // About page
    "about_us": "O nás"
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
    "copyright": "Spojujeme řemeslníky a zákazníky",
    
    // Navbar translations
    "home": "Domů",
    "categories": "Kategorie",
    "find_craftsman": "Najít řemeslníka",
    "jobs": "Zakázky",
    "how_it_works": "Jak to funguje",
    "benefits": "Výhody",
    "messages": "Zprávy",
    "my_profile": "Můj profil",
    "sign_out": "Odhlásit se",
    "sign_in": "Přihlásit se",
    
    // Index page translations
    "professional_craftsmen": "Profesionální řemeslníci na jednom místě",
    "find_best": "Najděte nejlepší",
    "craftsmen": "řemeslníky",
    "platform_connecting": "Platforma, která spojuje profesionální řemeslníky a lidi, kteří potřebují kvalitní služby řemeslníků přímo v Česku.",
    "search_profession": "Hledejte podle profese nebo lokality...",
    "search": "Vyhledat",
    "craftsmen_count": "500+ Řemeslníků",
    "cities_count": "100+ Měst",
    "categories_count": "20+ Kategorií",
    "find_best_craftsmen": "Najděte nejlepší řemeslníky",
    "search_name_craft": "Hledejte podle jména nebo řemesla...",
    "enter_location": "Zadejte lokalitu...",
    "filter_category": "Filtrovat podle kategorie",
    "all_categories": "Všechny kategorie",
    "reset": "Reset",
    "view_all_categories": "Zobrazit všechny kategorie",
    "featured_profiles": "Zvýrazněné profily jsou zobrazeny nahoře",
    "error_loading": "Nastala chyba při načítání řemeslníků. Zkuste to prosím později.",
    "try_again": "Zkusit znovu",
    "no_craftsmen_found": "Nenašli se žádní řemeslníci podle vašich kritérií. Zkuste upravit vyhledávání.",
    "show_all_craftsmen": "Zobrazit všechny řemeslníky",
    
    // About page
    "about_us": "O nás"
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
    "copyright": "Connecting craftsmen and customers",
    
    // Navbar translations
    "home": "Home",
    "categories": "Categories",
    "find_craftsman": "Find a craftsman",
    "jobs": "Jobs",
    "how_it_works": "How it works",
    "benefits": "Benefits",
    "messages": "Messages",
    "my_profile": "My profile",
    "sign_out": "Sign out",
    "sign_in": "Sign in",
    
    // Index page translations
    "professional_craftsmen": "Professional craftsmen in one place",
    "find_best": "Find the best",
    "craftsmen": "craftsmen",
    "platform_connecting": "A platform that connects professional craftsmen and people who need quality craftsman services.",
    "search_profession": "Search by profession or location...",
    "search": "Search",
    "craftsmen_count": "500+ Craftsmen",
    "cities_count": "100+ Cities",
    "categories_count": "20+ Categories",
    "find_best_craftsmen": "Find the best craftsmen",
    "search_name_craft": "Search by name or craft...",
    "enter_location": "Enter location...",
    "filter_category": "Filter by category",
    "all_categories": "All categories",
    "reset": "Reset",
    "view_all_categories": "View all categories",
    "featured_profiles": "Featured profiles are displayed at the top",
    "error_loading": "There was an error loading craftsmen. Please try again later.",
    "try_again": "Try again",
    "no_craftsmen_found": "No craftsmen found matching your criteria. Try adjusting your search.",
    "show_all_craftsmen": "Show all craftsmen",
    
    // About page
    "about_us": "About us"
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
