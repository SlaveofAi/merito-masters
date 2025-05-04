
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
    "about_us": "O nás",
    
    // Footer translations
    "for_craftsmen": "Pre remeselníkov",
    "registration": "Registrácia",
    "pricing": "Cenník služieb",
    "registration_benefits": "Výhody registrácie",
    "for_customers": "Pre zákazníkov",
    "find_craftsmen": "Vyhľadať remeselníkov",
    "service_categories": "Kategórie služieb",
    "how_it_works_footer": "Ako to funguje",
    "reviews_ratings": "Hodnotenia a recenzie",
    "company": "Spoločnosť",
    "about_us_footer": "O nás",
    "contact": "Kontakt",
    "privacy": "Ochrana súkromia",
    "terms": "Podmienky používania",
    "all_rights_reserved": "Všetky práva vyhradené",
    
    // Profile translations
    "edit_profile": "Upraviť profil",
    "portfolio": "Portfólio",
    "reviews": "Hodnotenia",
    "calendar": "Kalendár",
    "contact_us": "Kontaktujte nás",
    "loading": "Načítavam...",
    "set_availability": "Nastavte svoju dostupnosť v sekcii \"Kalendár dostupnosti\" vyššie na tejto stránke.",
    "contact_message": "Tu môžete vidieť dostupnosť remeselníka a kontaktovať ho prostredníctvom správy.",
    "send_message": "Poslať správu",
    "book_appointment": "Rezervácia termínu",
    "send_message_tab": "Poslať správu",
    "select_date": "1. Vyberte dátum",
    "select_time": "2. Vyberte čas",
    "request_details": "3. Detaily požiadavky",
    "job_description": "Popis práce*",
    "job_description_placeholder": "Opíšte, akú prácu potrebujete vykonať...",
    "address": "Adresa*",
    "address_placeholder": "Zadajte adresu, kde sa má práca vykonať",
    "estimated_price": "Predpokladaná cena",
    "estimated_price_placeholder": "Zadajte predpokladanú cenu",
    "add_photo": "Pridať fotografiu (voliteľné)",
    "upload_image": "Nahrať obrázok",
    "submit_request": "Odoslať požiadavku",
    "sending": "Odosielam...",
    "hourly_rate": "Hodinová sadzba",
    "loading_dates": "Načítavam dostupné termíny...",
    "craftsman_available": "Remeselník je dostupný v označené dni",
    "no_time_slots": "Žiadne dostupné termíny",
    "contact_craftsman": "Poslať správu remeselníkovi",
    "contact_message_desc": "Kliknite na tlačidlo nižšie pre kontaktovanie remeselníka priamo cez správy.",
    "go_to_messages": "Prejsť na správy",
    
    // Messages
    "messages_title": "Správy",
    "login_required": "Pre prístup k správam sa musíte prihlásiť",
    
    // Error messages
    "profile_access_error": "Chyba prístupu k profilu",
    "profile_access_message": "Nemáte oprávnenie na zobrazenie tohto profilu. Toto môže byť spôsobené nastaveniami Row Level Security (RLS) v databáze.",
    "rls_block_message": "Hoci ste prihlásený ako vlastník profilu, RLS pravidlá môžu blokovať prístup. Skúste sa odhlásiť a znova prihlásiť.",
    "create_profile_again": "Vytvoriť profil znova",
    "database_error": "Nastala chyba pripojenia k databáze",
    "database_error_message": "Nepodarilo sa spojiť s databázou. Skúste stránku obnoviť alebo to skúste znova neskôr.",
    "unexpected_error": "Nastala neočakávaná chyba",
    "try_again_later": "Skúste stránku obnoviť alebo to skúste znova neskôr.",
    "refresh_page": "Obnoviť stránku"
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
    "about_us": "O nás",
    
    // Footer translations
    "for_craftsmen": "Pro řemeslníky",
    "registration": "Registrace",
    "pricing": "Ceník služeb",
    "registration_benefits": "Výhody registrace",
    "for_customers": "Pro zákazníky",
    "find_craftsmen": "Vyhledat řemeslníky",
    "service_categories": "Kategorie služeb",
    "how_it_works_footer": "Jak to funguje",
    "reviews_ratings": "Hodnocení a recenze",
    "company": "Společnost",
    "about_us_footer": "O nás",
    "contact": "Kontakt",
    "privacy": "Ochrana soukromí",
    "terms": "Podmínky používání",
    "all_rights_reserved": "Všechna práva vyhrazena",
    
    // Profile translations
    "edit_profile": "Upravit profil",
    "portfolio": "Portfolio",
    "reviews": "Hodnocení",
    "calendar": "Kalendář",
    "contact_us": "Kontaktujte nás",
    "loading": "Načítám...",
    "set_availability": "Nastavte svou dostupnost v sekci \"Kalendář dostupnosti\" výše na této stránce.",
    "contact_message": "Zde můžete vidět dostupnost řemeslníka a kontaktovat ho prostřednictvím zprávy.",
    "send_message": "Poslat zprávu",
    "book_appointment": "Rezervace termínu",
    "send_message_tab": "Poslat zprávu",
    "select_date": "1. Vyberte datum",
    "select_time": "2. Vyberte čas",
    "request_details": "3. Detaily požadavku",
    "job_description": "Popis práce*",
    "job_description_placeholder": "Popište, jakou práci potřebujete vykonat...",
    "address": "Adresa*",
    "address_placeholder": "Zadejte adresu, kde se má práce vykonat",
    "estimated_price": "Předpokládaná cena",
    "estimated_price_placeholder": "Zadejte předpokládanou cenu",
    "add_photo": "Přidat fotografii (volitelné)",
    "upload_image": "Nahrát obrázek",
    "submit_request": "Odeslat požadavek",
    "sending": "Odesílám...",
    "hourly_rate": "Hodinová sazba",
    "loading_dates": "Načítám dostupné termíny...",
    "craftsman_available": "Řemeslník je dostupný v označené dny",
    "no_time_slots": "Žádné dostupné termíny",
    "contact_craftsman": "Poslat zprávu řemeslníkovi",
    "contact_message_desc": "Klikněte na tlačítko níže pro kontaktování řemeslníka přímo přes zprávy.",
    "go_to_messages": "Přejít na zprávy",
    
    // Messages
    "messages_title": "Zprávy",
    "login_required": "Pro přístup ke zprávám se musíte přihlásit",
    
    // Error messages
    "profile_access_error": "Chyba přístupu k profilu",
    "profile_access_message": "Nemáte oprávnění k zobrazení tohoto profilu. Toto může být způsobeno nastavením Row Level Security (RLS) v databázi.",
    "rls_block_message": "Přestože jste přihlášen jako vlastník profilu, RLS pravidla mohou blokovat přístup. Zkuste se odhlásit a znovu přihlásit.",
    "create_profile_again": "Vytvořit profil znovu",
    "database_error": "Nastala chyba připojení k databázi",
    "database_error_message": "Nepodařilo se spojit s databází. Zkuste stránku obnovit nebo to zkuste znovu později.",
    "unexpected_error": "Nastala neočekávaná chyba",
    "try_again_later": "Zkuste stránku obnovit nebo to zkuste znovu později.",
    "refresh_page": "Obnovit stránku"
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
    "about_us": "About us",
    
    // Footer translations
    "for_craftsmen": "For craftsmen",
    "registration": "Registration",
    "pricing": "Pricing",
    "registration_benefits": "Registration benefits",
    "for_customers": "For customers",
    "find_craftsmen": "Find craftsmen",
    "service_categories": "Service categories",
    "how_it_works_footer": "How it works",
    "reviews_ratings": "Reviews and ratings",
    "company": "Company",
    "about_us_footer": "About us",
    "contact": "Contact",
    "privacy": "Privacy policy",
    "terms": "Terms of use",
    "all_rights_reserved": "All rights reserved",
    
    // Profile translations
    "edit_profile": "Edit profile",
    "portfolio": "Portfolio",
    "reviews": "Reviews",
    "calendar": "Calendar",
    "contact_us": "Contact us",
    "loading": "Loading...",
    "set_availability": "Set your availability in the \"Calendar\" section above on this page.",
    "contact_message": "Here you can see the craftsman's availability and contact them through a message.",
    "send_message": "Send message",
    "book_appointment": "Book appointment",
    "send_message_tab": "Send message",
    "select_date": "1. Select date",
    "select_time": "2. Select time",
    "request_details": "3. Request details",
    "job_description": "Job description*",
    "job_description_placeholder": "Describe what work you need done...",
    "address": "Address*",
    "address_placeholder": "Enter the address where the work should be done",
    "estimated_price": "Estimated price",
    "estimated_price_placeholder": "Enter the estimated price",
    "add_photo": "Add photo (optional)",
    "upload_image": "Upload image",
    "submit_request": "Submit request",
    "sending": "Sending...",
    "hourly_rate": "Hourly rate",
    "loading_dates": "Loading available dates...",
    "craftsman_available": "Craftsman is available on highlighted days",
    "no_time_slots": "No available time slots",
    "contact_craftsman": "Contact craftsman",
    "contact_message_desc": "Click the button below to contact the craftsman directly through messages.",
    "go_to_messages": "Go to messages",
    
    // Messages
    "messages_title": "Messages",
    "login_required": "You must be logged in to access messages",
    
    // Error messages
    "profile_access_error": "Profile access error",
    "profile_access_message": "You do not have permission to view this profile. This may be due to Row Level Security (RLS) settings in the database.",
    "rls_block_message": "Although you are logged in as the profile owner, RLS rules may be blocking access. Try logging out and logging back in.",
    "create_profile_again": "Create profile again",
    "database_error": "Database connection error",
    "database_error_message": "Failed to connect to the database. Try refreshing the page or try again later.",
    "unexpected_error": "Unexpected error occurred",
    "try_again_later": "Try refreshing the page or try again later.",
    "refresh_page": "Refresh page"
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

