
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

  const isCurrentUser = profileData?.id === user?.id;
  
  const isCraftsmanProfile = profileData?.user_type === 'craftsman' || 
                           (profileData && 'trade_category' in profileData);
  
  const canLeaveReview = user && 
    userType && userType.toLowerCase() === 'customer' && 
    isCraftsmanProfile && 
    !isCurrentUser;
  
  const canReplyToReview = user && userType && userType.toLowerCase() === 'craftsman' && isCurrentUser;

  // Check if the current user is a customer viewing a craftsman's profile
  const isCustomerViewingCraftsman = user && 
    userType && userType.toLowerCase() === 'customer' && 
    isCraftsmanProfile && 
    !isCurrentUser;

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

  useEffect(() => {
    if (profileData?.id) {
      console.log("Fetching reviews for profile:", profileData.id);
      refetchReviews();
    }
  }, [profileData?.id, refetchReviews]);

  const handleRefresh = () => {
    console.log("Manual refresh of reviews requested");
    refetchReviews();
  };

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
              onClick={handleRefresh}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Obnoviť
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Hodnotenia a recenzie</h3>
        <ReviewsList
          reviews={reviews || []}
          isLoading={isLoadingReviews}
          canReplyToReview={canReplyToReview}
          canEditReview={userType === 'customer'} // Enable edit for all customers
          userId={user?.id}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>
    </div>
  );
};

export default ReviewsTab;
