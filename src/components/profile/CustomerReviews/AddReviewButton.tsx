
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddReviewButtonProps {
  onClick: () => void;
}

const AddReviewButton: React.FC<AddReviewButtonProps> = ({ onClick }) => {
  const { t } = useLanguage();
  
  return (
    <button 
      onClick={onClick} 
      className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
    >
      {t("add_new_review")}
    </button>
  );
};

export default AddReviewButton;
