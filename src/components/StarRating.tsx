import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  interactive?: boolean;
  onRate?: (stars: number) => void;
  size?: 'sm' | 'md' | 'lg';
  userRated?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRate,
  size = 'md',
  userRated = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = currentDisplay >= starValue;
        const isHalf = !isFilled && currentDisplay >= starValue - 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={`${
              interactive
                ? 'cursor-pointer hover:scale-115 transition-transform p-0.5 rounded-sm focus-visible:ring-1 focus-visible:ring-amber-500'
                : 'cursor-default pointer-events-none'
            }`}
            aria-label={interactive ? `Noter ${starValue} étoiles sur ${maxStars}` : undefined}
          >
            <Star
              className={`${starSizes[size]} transition-colors ${
                isFilled
                  ? 'text-amber-500 fill-amber-500'
                  : isHalf
                  ? 'text-amber-500 fill-amber-500/50'
                  : 'text-stone-300 dark:text-stone-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
