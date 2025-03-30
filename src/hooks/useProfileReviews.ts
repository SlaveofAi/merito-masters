
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CraftsmanReview } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";

export const useProfileReviews = (id?: string) => {
  const { user } = useAuth();
  
  const fetchReviews = async (userId: string): Promise<CraftsmanReview[]> => {
    try {
      // Ensure we have a valid userId
      if (!userId || userId === ":id") {
        console.log("Invalid userId for fetching reviews:", userId);
        return [];
      }
      
      console.log("Fetching reviews for craftsman:", userId);
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      
      if (!data || !Array.isArray(data)) {
        console.log("No reviews found for craftsman:", userId);
        return [];
      }
      
      // Explicitly map the data to ensure it matches the CraftsmanReview type
      return data.map(review => ({
        id: review.id,
        craftsman_id: review.craftsman_id,
        customer_id: review.customer_id,
        customer_name: review.customer_name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      })) as CraftsmanReview[];
      
    } catch (error) {
      console.error("Error in fetchReviews:", error);
      return [];
    }
  };

  // Fix for handling URL parameters by resolving id to user.id when needed
  const userId = (!id || id === ":id") ? user?.id : id;

  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ['reviews', userId],
    queryFn: () => fetchReviews(userId || ''),
    enabled: !!userId,
  });

  return {
    reviews,
    isLoadingReviews,
    refetchReviews
  };
};
