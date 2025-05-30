
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAverageRating(rating: number | null, reviewCount: number | null): string {
  if (!rating || !reviewCount || reviewCount === 0) {
    return "0.0";
  }
  return rating.toFixed(1);
}
