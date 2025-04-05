
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarIcon, Reply } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ReviewsTab: React.FC = () => {
  const { user, userType } = useAuth();
  const {
    profileData,
    rating,
    reviewComment,
    handleStarClick,
    setReviewComment,
    handleSubmitReview,
    reviews,
    isLoadingReviews,
    refetchReviews
  } = useProfile();

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});

  // Check if the current profile belongs to the logged-in user
  const isCurrentUser = profileData?.id === user?.id;
  
  // Only customers can leave reviews for craftsmen
  const canLeaveReview = user && userType === 'customer' && profileData?.user_type === 'craftsman' && !isCurrentUser;
  
  // Only craftsmen can reply to their own reviews
  const canReplyToReview = user && userType === 'craftsman' && isCurrentUser;

  // Handle reply submission using RPC function instead of direct table access
  const handleSubmitReply = async (reviewId: string) => {
    if (!user || !replyText[reviewId]?.trim()) return;
    
    try {
      const { error } = await supabase
        .rpc('add_review_reply', {
          p_review_id: reviewId,
          p_craftsman_id: user.id,
          p_reply: replyText[reviewId]
        });
      
      if (error) throw error;
      
      toast.success("Odpoveď bola úspešne odoslaná");
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setShowReplyForm(prev => ({ ...prev, [reviewId]: false }));
      refetchReviews();
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      toast.error("Nastala chyba pri odosielaní odpovede");
    }
  };

  // Star rating component
  const StarRating = ({ value, onClick }: { value: number; onClick: (value: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onClick(star)}
            className="focus:outline-none"
          >
            {star <= value ? (
              <StarIcon className="w-6 h-6 fill-current text-yellow-500" />
            ) : (
              <Star className="w-6 h-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review submission form - only for customers viewing craftsman profiles */}
      {canLeaveReview && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Ohodnoťte tohto remeselníka</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Hodnotenie
                </label>
                <StarRating value={rating} onClick={handleStarClick} />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium">
                  Komentár
                </label>
                <Textarea
                  id="comment"
                  placeholder="Napíšte váš názor na prácu remeselníka..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={rating === 0}
              >
                Odoslať hodnotenie
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Reviews list */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Hodnotenia a recenzie</h3>
        
        {isLoadingReviews ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Načítavam hodnotenia...</p>
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{review.customer_name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString("sk-SK")}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? "text-yellow-500 fill-current" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  
                  {/* Review reply section */}
                  {review.reply && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <div className="text-sm font-medium">Odpoveď remeselníka:</div>
                      <p className="text-gray-700 text-sm">{review.reply}</p>
                    </div>
                  )}
                  
                  {/* Reply form - only for craftsmen on their own profile */}
                  {canReplyToReview && !review.reply && (
                    <div className="mt-4">
                      {showReplyForm[review.id] ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Napíšte odpoveď na túto recenziu..."
                            value={replyText[review.id] || ''}
                            onChange={(e) => setReplyText({
                              ...replyText,
                              [review.id]: e.target.value
                            })}
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={!replyText[review.id]?.trim()}
                            >
                              Odoslať
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowReplyForm({...showReplyForm, [review.id]: false});
                                setReplyText({...replyText, [review.id]: ''});
                              }}
                            >
                              Zrušiť
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center mt-2"
                          onClick={() => setShowReplyForm({...showReplyForm, [review.id]: true})}
                        >
                          <Reply className="mr-1 h-4 w-4" />
                          Odpovedať
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                Zatiaľ nie sú žiadne hodnotenia. Buďte prvý, kto ohodnotí tohto remeselníka.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
