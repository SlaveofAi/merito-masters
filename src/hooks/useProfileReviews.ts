
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CraftsmanReview } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";

export const useProfileReviews = (id?: string) => {
  const { user } = useAuth();
  
  const fetchReviews = async (userId: string): Promise<CraftsmanReview[]> => {
    // Early exit for invalid IDs to prevent unnecessary API calls
    if (!userId || userId === ":id") {
      return [];
    }
    
    try {
      console.log("Fetching reviews for craftsman:", userId);
      
      // First fetch the reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        return []; // Return empty array instead of throwing error
      }
      
      if (!reviewsData || !Array.isArray(reviewsData) || reviewsData.length === 0) {
        return [];
      }

      // Then fetch replies only if there are reviews
      const reviewIds = reviewsData.map(review => review.id);
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('craftsman_review_replies')
        .select('*')
        .in('review_id', reviewIds);
        
      if (repliesError) {
        console.error("Error fetching review replies:", repliesError);
        // Return reviews without replies instead of failing
        return reviewsData as CraftsmanReview[];
      }
      
      // Merge reviews with their replies
      const reviewsWithReplies = reviewsData.map(review => {
        const replyData = repliesData && Array.isArray(repliesData) ? 
          repliesData.find(r => r.review_id === review.id) : 
          null;
          
        return {
          ...review,
          reply: replyData || null
        } as CraftsmanReview;
      });
      
      return reviewsWithReplies;
    } catch (error) {
      console.error("Error in fetchReviews:", error);
      return []; // Return empty array instead of throwing error
    }
  };

  // Fix for handling URL parameters by resolving id to user.id when needed
  const userId = (!id || id === ":id") ? user?.id : id;

  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    error,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ['reviews', userId],
    queryFn: () => fetchReviews(userId || ''),
    enabled: !!userId,
    retry: 2, // Increased retry attempts
    gcTime: 300000, // 5 minutes cache
    staleTime: 180000, // Consider data fresh for 3 minutes
  });

  return {
    reviews,
    isLoadingReviews,
    error,
    refetchReviews
  };
};
