
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReviewsTab: React.FC = () => {
  const { user, userType } = useAuth();
  const {
    profileData,
    reviews,
    isLoadingReviews,
    error,
    refetchReviews
  } = useProfile();

  // Check if the current profile belongs to the logged-in user
  const isCurrentUser = profileData?.id === user?.id;
  
  // Use a safer approach to determine if this is a craftsman profile
  const isCraftsmanProfile = profileData?.user_type === 'craftsman' || 
                           (profileData && 'trade_category' in profileData);
  
  // Only customers can leave reviews for craftsmen profiles that aren't their own
  const canLeaveReview = user && 
    userType && userType.toLowerCase() === 'customer' && 
    isCraftsmanProfile && 
    !isCurrentUser;
  
  // Only craftsmen can reply to reviews on their own profiles
  const canReplyToReview = user && userType && userType.toLowerCase() === 'craftsman' && isCurrentUser;

  // Enhanced debug logs for troubleshooting the review form visibility
  console.log("Reviews tab rendering with critical variables:", { 
    reviews: reviews?.length, 
    isCurrentUser, 
    canLeaveReview, 
    userType, 
    profileType: isCraftsmanProfile ? 'craftsman' : 'customer',
    userId: user?.id,
    profileId: profileData?.id,
    isCraftsmanProfile,
    hasTrade: profileData && 'trade_category' in profileData,
    error
  });

  // Fetch reviews when component mounts
  useEffect(() => {
    if (profileData?.id) {
      console.log("Fetching reviews for profile:", profileData.id);
      refetchReviews();
    }
  }, [profileData?.id, refetchReviews]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {typeof error === 'string' ? error : 'Nastala chyba pri načítaní hodnotení. Prosím, skúste to znova neskôr.'}
            <Button 
              variant="link" 
              className="ml-2 p-0 h-auto" 
              onClick={() => refetchReviews()}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Obnoviť
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Review submission form - only for customers viewing craftsman profiles */}
      {canLeaveReview && user && profileData && (
        <div className="mb-6 border p-4 rounded-md bg-white shadow-sm">
          <h3 className="text-lg font-medium mb-3">Pridať hodnotenie</h3>
          <ReviewForm 
            userId={user.id} 
            profileId={profileData.id || ''}
            userName={user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymous'}
            onSuccess={refetchReviews}
          />
        </div>
      )}
      
      {/* Reviews list */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Hodnotenia a recenzie</h3>
        <ReviewsList
          reviews={reviews || []}
          isLoading={isLoadingReviews}
          canReplyToReview={canReplyToReview}
          userId={user?.id}
          onRefresh={refetchReviews}
          error={error}
        />
      </div>
    </div>
  );
};

export default ReviewsTab;
