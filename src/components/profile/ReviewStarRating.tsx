
import React from "react";
import { Star, StarIcon } from "lucide-react";

interface StarRatingProps {
  value: number;
  onClick?: (value: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
}

const ReviewStarRating: React.FC<StarRatingProps> = ({
  value,
  onClick,
  size = 'medium',
  readonly = false
}) => {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };
  
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onClick && onClick(star)}
          className={`focus:outline-none ${readonly ? 'cursor-default' : ''}`}
          disabled={readonly}
        >
          {star <= value ? (
            <StarIcon className={`${sizeClass[size]} fill-current text-yellow-500`} />
          ) : (
            <Star className={`${sizeClass[size]} text-gray-300`} />
          )}
        </button>
      ))}
    </div>
  );
};

export default ReviewStarRating;
