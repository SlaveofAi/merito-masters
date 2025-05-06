
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CraftsmanReview, ReviewReply } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";

export const useProfileReviews = (id?: string) => {
  const { user, session } = useAuth();
  
  const fetchReviews = async (userId: string): Promise<CraftsmanReview[]> => {
    try {
      // Ensure we have a valid userId
      if (!userId || userId === ":id") {
        console.log("Invalid userId for fetching reviews:", userId);
        return [];
      }
      
      console.log("Fetching reviews for craftsman:", userId);
      
      // First fetch the reviews - now protected by RLS
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        throw new Error(`Error fetching reviews: ${reviewsError.message}`);
      }
      
      if (!reviewsData || !Array.isArray(reviewsData)) {
        console.log("No reviews found for craftsman:", userId);
        return [];
      }

      console.log("Found reviews:", reviewsData.length);

      // Then fetch all replies for these reviews
      const reviewIds = reviewsData.map(review => review.id);
      
      // Only fetch replies if there are reviews
      if (reviewIds.length === 0) {
        return reviewsData as CraftsmanReview[];
      }
      
      // Fetch replies directly from the craftsman_review_replies table
      const { data: repliesData, error: repliesError } = await supabase
        .from('craftsman_review_replies')
        .select('*')
        .in('review_id', reviewIds);
        
      if (repliesError) {
        console.error("Error fetching review replies:", repliesError);
        // Return reviews without replies
        return reviewsData as CraftsmanReview[];
      }
      
      console.log("Found replies:", repliesData ? repliesData.length : 0);
      
      // Merge reviews with their replies - fix the type error by explicitly making reply a string | null | ReviewReply
      const reviewsWithReplies = reviewsData.map(review => {
        const replyData = repliesData && Array.isArray(repliesData) ? 
          repliesData.find(r => r.review_id === review.id) : 
          null;
          
        console.log(`Processing review ${review.id}, found reply:`, replyData);
        
        return {
          ...review,
          reply: replyData || null
        } as CraftsmanReview; // Cast to CraftsmanReview to fix type error
      });
      
      return reviewsWithReplies;
    } catch (error) {
      console.error("Error in fetchReviews:", error);
      throw error;
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
    queryKey: ['reviews', userId, !!session], // Add session to the query key to refresh when auth state changes
    queryFn: () => fetchReviews(userId || ''),
    enabled: !!userId,
    retry: 1,
    gcTime: 0, // Use gcTime instead of cacheTime to ensure fresh data
    staleTime: 30000, // Set stale time to 30 seconds to reduce unnecessary refetches
  });

  return {
    reviews,
    isLoadingReviews,
    error,
    refetchReviews
  };
};
