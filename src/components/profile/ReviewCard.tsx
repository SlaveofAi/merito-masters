
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReviewStarRating from "./ReviewStarRating";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewCardProps {
  review: any;
  canReplyToReview: boolean;
  userId?: string;
  onRefresh: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  canReplyToReview,
  userId,
  onRefresh
}) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReply = async () => {
    if (!userId || !replyText.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting reply:", {
        reviewId: review.id,
        craftsmanId: userId,
        replyText
      });
      
      // Direct insert into craftsman_review_replies table instead of using RPC
      const { error } = await supabase
        .from('craftsman_review_replies')
        .insert({
          review_id: review.id,
          craftsman_id: userId,
          reply: replyText
        });
      
      if (error) throw error;
      
      toast.success("Odpoveď bola úspešne odoslaná");
      setReplyText("");
      setShowReplyForm(false);
      onRefresh();
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      setError(`Nastala chyba: ${error.message}`);
      toast.error("Nastala chyba pri odosielaní odpovede");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium">{review.customer_name}</div>
            <div className="text-sm text-gray-500">
              {new Date(review.created_at).toLocaleDateString("sk-SK")}
            </div>
          </div>
          <ReviewStarRating value={review.rating} readonly size="small" />
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
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {showReplyForm ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Napíšte odpoveď na túto recenziu..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Odosielam..." : "Odoslať"}
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText("");
                      setError(null);
                    }}
                    disabled={isSubmitting}
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
                onClick={() => setShowReplyForm(true)}
              >
                <Reply className="mr-1 h-4 w-4" />
                Odpovedať
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
