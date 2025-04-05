
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReviewStarRating from "./ReviewStarRating";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ReviewFormProps {
  userId: string;
  profileId: string;
  userName?: string;
  onSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  userId,
  profileId,
  userName = 'Anonymný zákazník',
  onSuccess
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log("ReviewForm rendered with:", { userId, profileId, userType });
  }, [userId, profileId, userType]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!userId) {
      setError("Pre pridanie hodnotenia sa musíte prihlásiť");
      return;
    }

    if (userType !== 'customer') {
      setError("Len zákazníci môžu pridávať hodnotenia");
      return;
    }

    if (rating === 0) {
      setError("Prosím, vyberte hodnotenie (1-5 hviezdičiek)");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting review:", {
        craftsman_id: profileId,
        customer_id: userId,
        rating,
        comment: comment.trim() || null
      });
      
      // Add the review directly to the database
      const { error: submitError } = await supabase
        .from('craftsman_reviews')
        .insert({
          craftsman_id: profileId,
          customer_id: userId,
          customer_name: userName || 'Anonymný zákazník',
          rating,
          comment: comment.trim() || null
        });
        
      if (submitError) {
        console.error("Review submission error:", submitError);
        throw submitError;
      }
      
      toast.success("Hodnotenie bolo úspešne pridané");
      setRating(0);
      setComment("");
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      setError("Nastala chyba pri odosielaní hodnotenia: " + (error.message || "Neznáma chyba"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Ohodnoťte tohto remeselníka</h3>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Hodnotenie
            </label>
            <ReviewStarRating value={rating} onClick={setRating} size="large" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium">
              Komentár
            </label>
            <Textarea
              id="comment"
              placeholder="Napíšte váš názor na prácu remeselníka..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={rating === 0 || submitting}
          >
            {submitting ? "Odosielam..." : "Odoslať hodnotenie"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
