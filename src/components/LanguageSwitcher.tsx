
import React from "react";
import { Globe } from "lucide-react";
import { useLanguage, SupportedLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages: { code: SupportedLanguage; label: string }[] = [
  { code: "sk", label: "Slovenčina" },
  { code: "cs", label: "Čeština" },
  { code: "en", label: "English" }
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (code: SupportedLanguage) => {
    setLanguage(code);
    // Force reload the page to ensure all translations are applied
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block ml-1 uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            <span className="uppercase mr-2">{lang.code}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
