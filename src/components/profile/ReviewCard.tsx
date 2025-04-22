
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, AlertCircle, Edit, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import ReviewStarRating from "./ReviewStarRating";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import ReviewForm from "./ReviewForm";

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
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingReply, setEditingReply] = useState(false);
  const [editReplyText, setEditReplyText] = useState(review.reply || "");

  // Check if the current user is the author of this review
  const isReviewAuthor = user?.id === review.customer_id;
  
  // Check if the current user is the craftsman who can reply or edit reply
  const isCraftsman = user?.id === review.craftsman_id || userId === review.craftsman_id;

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
      
      // Type-cast supabase.rpc as any to avoid TypeScript errors with generated types
      const { error } = await (supabase.rpc as any)(
        'add_review_reply',
        {
          p_review_id: review.id,
          p_craftsman_id: userId,
          p_reply: replyText
        }
      );
      
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

  const handleUpdateReply = async () => {
    if (!userId || !editReplyText.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Updating reply for review:", {
        reviewId: review.id,
        craftsmanId: userId,
        replyText: editReplyText
      });
      
      // Step 1: Find the specific reply record by review_id and craftsman_id
      const { data: replyRecord, error: fetchError } = await supabase
        .from('craftsman_review_replies')
        .select('id')
        .eq('review_id', review.id)
        .eq('craftsman_id', userId)
        .maybeSingle();
      
      console.log("Reply record fetch result:", { replyRecord, fetchError });
      
      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }
      
      let updateResult;
      
      if (replyRecord) {
        // Update existing reply using its specific ID
        console.log("Updating existing reply with ID:", replyRecord.id);
        updateResult = await supabase
          .from('craftsman_review_replies')
          .update({ reply: editReplyText })
          .eq('id', replyRecord.id);
      } else {
        // Create new reply if none exists
        console.log("No existing reply found, creating new one");
        updateResult = await (supabase.rpc as any)(
          'add_review_reply',
          {
            p_review_id: review.id,
            p_craftsman_id: userId,
            p_reply: editReplyText
          }
        );
      }
      
      console.log("Update/Create result:", updateResult);
      
      if (updateResult.error) throw updateResult.error;
      
      toast.success("Odpoveď bola úspešne aktualizovaná");
      setEditingReply(false);
      onRefresh();
    } catch (error: any) {
      console.error("Error updating reply:", error);
      setError(`Nastala chyba: ${error.message}`);
      toast.error("Nastala chyba pri aktualizácii odpovede");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!isReviewAuthor) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('craftsman_reviews')
        .delete()
        .eq('id', review.id);
        
      if (error) throw error;
      
      toast.success("Hodnotenie bolo úspešne odstránené");
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      setError(`Nastala chyba: ${error.message}`);
      toast.error("Nastala chyba pri odstraňovaní hodnotenia");
    } finally {
      setIsSubmitting(false);
      setConfirmDelete(false);
    }
  };

  // If in editing mode, show the review form instead
  if (isEditing && isReviewAuthor) {
    return (
      <div className="mb-4">
        <ReviewForm 
          userId={review.customer_id}
          profileId={review.craftsman_id}
          userName={review.customer_name}
          onSuccess={() => {
            setIsEditing(false);
            onRefresh();
          }}
          existingReview={{
            id: review.id,
            rating: review.rating,
            comment: review.comment
          }}
        />
        <div className="mt-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            Zrušiť úpravu
          </Button>
        </div>
      </div>
    );
  }

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
        
        {/* User actions for their own reviews */}
        {isReviewAuthor && (
          <div className="mt-3 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Upraviť
            </Button>
            
            {confirmDelete ? (
              <>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center"
                  onClick={handleDeleteReview}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Potvrdiť
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setConfirmDelete(false)}
                  disabled={isSubmitting}
                >
                  Zrušiť
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center text-red-500"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Odstrániť
              </Button>
            )}
          </div>
        )}
        
        {/* Review reply section */}
        {review.reply && !editingReply && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium">Odpoveď remeselníka:</div>
              {isCraftsman && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => {
                    setEditingReply(true);
                    setEditReplyText(review.reply);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Upraviť
                </Button>
              )}
            </div>
            <p className="text-gray-700 text-sm">{review.reply}</p>
          </div>
        )}
        
        {/* Edit reply form */}
        {editingReply && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Upravte odpoveď na túto recenziu..."
              value={editReplyText}
              onChange={(e) => setEditReplyText(e.target.value)}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button 
                size="sm"
                onClick={handleUpdateReply}
                disabled={!editReplyText.trim() || isSubmitting}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSubmitting ? "Ukladám..." : "Uložiť"}
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingReply(false);
                  setEditReplyText(review.reply || "");
                }}
                disabled={isSubmitting}
              >
                Zrušiť
              </Button>
            </div>
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
