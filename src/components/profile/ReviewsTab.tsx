
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";

const ReviewsTab: React.FC = () => {
  const { user, userType } = useAuth();
  const {
    profileData,
    reviews,
    isLoadingReviews,
    refetchReviews
  } = useProfile();

  // Check if the current profile belongs to the logged-in user
  const isCurrentUser = profileData?.id === user?.id;
  
  // Only customers can leave reviews for craftsmen profiles that aren't their own
  const canLeaveReview = user && userType === 'customer' && 
    profileData?.user_type === 'craftsman' && !isCurrentUser;
  
  // Only craftsmen can reply to reviews on their own profiles
  const canReplyToReview = user && userType === 'craftsman' && isCurrentUser;

  return (
    <div className="space-y-6">
      {/* Review submission form - only for customers viewing craftsman profiles */}
      {canLeaveReview && user && profileData && (
        <ReviewForm 
          userId={user.id} 
          profileId={profileData.id}
          userName={user.user_metadata?.name || 'Anonymous'}
          onSuccess={refetchReviews}
        />
      )}
      
      {/* Reviews list */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Hodnotenia a recenzie</h3>
        <ReviewsList
          reviews={reviews}
          isLoading={isLoadingReviews}
          canReplyToReview={canReplyToReview}
          userId={user?.id}
          onRefresh={refetchReviews}
        />
      </div>
    </div>
  );
};

export default ReviewsTab;
