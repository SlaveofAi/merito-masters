
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReviewStarRating from "./ReviewStarRating";

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Pre pridanie hodnotenia sa musíte prihlásiť");
      return;
    }

    if (rating === 0) {
      toast.error("Prosím, vyberte hodnotenie (1-5 hviezdičiek)");
      return;
    }

    setSubmitting(true);
    try {
      // Add the review directly to the database
      const { error } = await supabase
        .from('craftsman_reviews')
        .insert({
          craftsman_id: profileId,
          customer_id: userId,
          customer_name: userName,
          rating,
          comment: comment.trim() || null
        });
        
      if (error) throw error;
      
      toast.success("Hodnotenie bolo úspešne pridané");
      setRating(0);
      setComment("");
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error("Nastala chyba pri odosielaní hodnotenia");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Ohodnoťte tohto remeselníka</h3>
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
