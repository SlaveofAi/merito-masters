
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileCalendar from "./ProfileCalendar";

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
  
  // Only customers can leave reviews for craftsmen profiles that aren't their own
  const canLeaveReview = user && userType === 'customer' && 
    profileData?.user_type === 'craftsman' && !isCurrentUser;
  
  // Only craftsmen can reply to reviews on their own profiles
  const canReplyToReview = user && userType === 'craftsman' && isCurrentUser;

  // Log for debugging
  console.log("Reviews tab rendering", { 
    reviews: reviews?.length, 
    isCurrentUser, 
    canLeaveReview, 
    userType, 
    profileType: profileData?.user_type,
    userId: user?.id,
    profileId: profileData?.id,
    error
  });

  // Fetch reviews immediately when component mounts
  useEffect(() => {
    if (profileData?.id) {
      console.log("Fetching reviews for profile:", profileData.id);
      refetchReviews();
    }
  }, [profileData?.id, refetchReviews]);

  // Display calendar for craftsman profiles
  if (profileData?.user_type === 'craftsman') {
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
        
        {/* Prominently display the calendar at the top */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" /> 
              Kalendár dostupnosti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileCalendar />
          </CardContent>
        </Card>
        
        {/* Review submission form - only for customers viewing craftsman profiles */}
        {canLeaveReview && user && profileData && (
          <ReviewForm 
            userId={user.id} 
            profileId={profileData.id}
            userName={user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymous'}
            onSuccess={refetchReviews}
          />
        )}

        {/* Show add review button if not showing form already */}
        {!canLeaveReview && user && userType === 'customer' && profileData?.user_type === 'craftsman' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-3">Ohodnoťte tohto remeselníka</h3>
                <p className="text-muted-foreground mb-4">
                  Pre pridanie hodnotenia sa musíte prihlásiť ako zákazník
                </p>
                <Button onClick={() => alert('Pre pridanie hodnotenia sa prosím prihláste ako zákazník')}>
                  Prihlásiť sa pre pridanie hodnotenia
                </Button>
              </div>
            </CardContent>
          </Card>
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
  }
  
  // Non-craftsman profiles just show reviews
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
        <ReviewForm 
          userId={user.id} 
          profileId={profileData.id}
          userName={user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymous'}
          onSuccess={refetchReviews}
        />
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
