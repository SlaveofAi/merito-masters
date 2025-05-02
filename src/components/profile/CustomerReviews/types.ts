
import { CraftsmanReview } from "@/types/profile";

// Extended type to include the craftsman data from the query
export type CraftsmanReviewWithCraftsman = CraftsmanReview & { 
  craftsman: { 
    id: string; 
    name: string; 
    trade_category: string; 
    profile_image_url: string | null;
  } 
};
