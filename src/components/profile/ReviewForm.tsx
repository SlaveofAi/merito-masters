
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReviewStarRating from "./ReviewStarRating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewFormProps {
  userId: string;
  profileId: string;
  userName?: string;
  onSuccess: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  };
  isSelectCraftsman?: boolean;
  onCancel?: () => void;
}

interface CraftsmanOption {
  id: string;
  name: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  userId,
  profileId,
  userName = 'Anonymný zákazník',
  onSuccess,
  existingReview,
  isSelectCraftsman = false,
  onCancel
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCraftsmanId, setSelectedCraftsmanId] = useState(profileId !== "empty" ? profileId : "");
  const [craftsmen, setCraftsmen] = useState<CraftsmanOption[]>([]);
  const { t } = useLanguage();
  
  const isEditMode = !!existingReview;

  useEffect(() => {
    // Fetch craftsmen list for selection if needed
    if (isSelectCraftsman) {
      const fetchCraftsmen = async () => {
        try {
          const { data, error } = await supabase
            .from('craftsman_profiles')
            .select('id, name');
          
          if (error) {
            throw error;
          }
          
          if (data) {
            setCraftsmen(data as CraftsmanOption[]);
          }
        } catch (error) {
          console.error('Error fetching craftsmen:', error);
          toast.error(t('error_loading'));
        }
      };
      
      fetchCraftsmen();
    }
  }, [isSelectCraftsman, t]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error(t("login_required"));
      return;
    }

    if (rating === 0) {
      toast.error(t("rating") + " (1-5)");
      return;
    }
    
    if (isSelectCraftsman && !selectedCraftsmanId) {
      toast.error(t("select_craftsman"));
      return;
    }

    const craftsmanIdToUse = isSelectCraftsman ? selectedCraftsmanId : profileId;

    setSubmitting(true);
    try {
      if (isEditMode) {
        // Update existing review
        const { error } = await supabase
          .from('craftsman_reviews')
          .update({
            rating,
            comment: comment.trim() || null
          })
          .eq('id', existingReview.id);
          
        if (error) {
          console.error("Review update error:", error);
          throw error;
        }
        
        toast.success(t("profile_updated"));
      } else {
        // Add new review
        const { error } = await supabase
          .from('craftsman_reviews')
          .insert({
            craftsman_id: craftsmanIdToUse,
            customer_id: userId,
            customer_name: userName || t("anonymous_customer"),
            rating,
            comment: comment.trim() || null
          });
          
        if (error) {
          console.error("Review submission error:", error);
          throw error;
        }
      }
      
      onSuccess();
      
      if (!isEditMode) {
        setRating(0);
        setComment("");
        setSelectedCraftsmanId("");
      }
      
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(t("error_sending") + ": " + (error.message || t("unexpected_error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {isEditMode ? t("edit_review") : t("add_review")}
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {isSelectCraftsman && (
            <div className="space-y-2">
              <Label htmlFor="craftsman-select" className="block text-sm font-medium">
                {t("select_craftsman")}
              </Label>
              <Select 
                value={selectedCraftsmanId} 
                onValueChange={setSelectedCraftsmanId}
              >
                <SelectTrigger id="craftsman-select" className="w-full">
                  <SelectValue placeholder={t("select_craftsman")} />
                </SelectTrigger>
                <SelectContent>
                  {craftsmen.map(craftsman => (
                    <SelectItem key={craftsman.id} value={craftsman.id}>
                      {craftsman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t("rating")}
            </label>
            <ReviewStarRating value={rating} onClick={setRating} size="large" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium">
              {t("comment")}
            </label>
            <Textarea
              id="comment"
              placeholder={t("write_comment_placeholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={rating === 0 || submitting || (isSelectCraftsman && !selectedCraftsmanId)}
            >
              {submitting ? t("sending") : isEditMode ? t("edit_review") : t("submit_review")}
            </Button>
            
            {(isEditMode || onCancel) && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else if (isEditMode) {
                    setRating(existingReview.rating); 
                    setComment(existingReview.comment || "");
                  }
                }}
                disabled={submitting}
              >
                {t("cancel")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
