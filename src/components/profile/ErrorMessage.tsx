
import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ErrorMessageProps {
  type: 'access' | 'database' | 'unknown';
  isCurrentUser?: boolean;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ type, isCurrentUser, onRetry }) => {
  const { t } = useLanguage();
  
  let title = '';
  let message = '';
  let action = null;

  switch (type) {
    case 'access':
      title = t("profile_access_error");
      message = t("profile_access_message");
      
      if (isCurrentUser) {
        action = (
          <>
            <p className="text-sm text-amber-600 mb-4">
              {t("rls_block_message")}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                {t("create_profile_again")}
              </Button>
            )}
          </>
        );
      }
      break;
      
    case 'database':
      title = t("database_error");
      message = t("database_error_message");
      action = (
        <Button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
          {t("refresh_page")}
        </Button>
      );
      break;
      
    case 'unknown':
    default:
      title = t("unexpected_error");
      message = t("try_again_later");
      action = (
        <Button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
          {t("refresh_page")}
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

