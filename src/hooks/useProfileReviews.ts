
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CraftsmanReview, ReviewReply } from "@/types/profile";
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
      
      // First fetch the reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        return [];
      }
      
      if (!reviewsData || !Array.isArray(reviewsData)) {
        console.log("No reviews found for craftsman:", userId);
        return [];
      }

      // Then fetch all replies for these reviews
      const reviewIds = reviewsData.map(review => review.id);
      
      // Only fetch replies if there are reviews
      if (reviewIds.length === 0) {
        return reviewsData as CraftsmanReview[];
      }
      
      // Use RPC function for getting review replies
      // Type-casting supabase.rpc as any to avoid TypeScript errors with generated types
      const { data: repliesData, error: repliesError } = await (supabase.rpc as any)(
        'get_review_replies_by_review_ids', 
        { review_ids: reviewIds }
      );
        
      if (repliesError) {
        console.error("Error fetching review replies:", repliesError);
        // Return reviews without replies
        return reviewsData as CraftsmanReview[];
      }
      
      // Merge reviews with their replies
      const reviewsWithReplies = reviewsData.map(review => {
        // Ensure repliesData is not null before accessing it
        const reply = repliesData && Array.isArray(repliesData) ? 
          repliesData.find(r => r.review_id === review.id) : 
          undefined;
          
        return {
          ...review,
          reply: reply ? reply.reply : null
        };
      });
      
      return reviewsWithReplies as CraftsmanReview[];
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
    gcTime: 0, // Use gcTime instead of cacheTime to ensure fresh data
  });

  return {
    reviews,
    isLoadingReviews,
    refetchReviews
  };
};
