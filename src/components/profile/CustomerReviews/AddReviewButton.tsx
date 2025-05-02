
import React from "react";

interface AddReviewButtonProps {
  onClick: () => void;
}

const AddReviewButton: React.FC<AddReviewButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
    >
      Pridať nové hodnotenie
    </button>
  );
};

export default AddReviewButton;
