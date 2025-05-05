
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  type: 'access' | 'database' | 'unknown';
  isCurrentUser?: boolean;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ type, isCurrentUser, onRetry }) => {
  let title = '';
  let message = '';
  let action = null;

  switch (type) {
    case 'access':
      title = "Chyba prístupu k profilu";
      message = "Nemáte oprávnenie na zobrazenie tohto profilu. Toto môže byť spôsobené nastaveniami Row Level Security (RLS) v databáze.";
      
      if (isCurrentUser) {
        action = (
          <>
            <p className="text-sm text-amber-600 mb-4">
              Hoci ste prihlásený ako vlastník profilu, RLS pravidlá môžu blokovať prístup.
              Skúste sa odhlásiť a znova prihlásiť.
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                Vytvoriť profil znova
              </Button>
            )}
          </>
        );
      }
      break;
      
    case 'database':
      title = "Nastala chyba pripojenia k databáze";
      message = "Nepodarilo sa spojiť s databázou. Skúste stránku obnoviť alebo to skúste znova neskôr.";
      action = (
        <Button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
          Obnoviť stránku
        </Button>
      );
      break;
      
    case 'unknown':
    default:
      title = "Nastala neočakávaná chyba";
      message = "Skúste stránku obnoviť alebo to skúste znova neskôr.";
      action = (
        <Button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
          Obnoviť stránku
        </Button>
      );
      break;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-xl font-bold mb-4">{title}</h1>
        <p className="mb-4">{message}</p>
        {action}
      </div>
    </div>
  );
};

export default ErrorMessage;
