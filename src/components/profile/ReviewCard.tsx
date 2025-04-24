
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, isValid } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StarIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, CornerDownLeft, Edit, ThumbsUp, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Review = {
  id: string;
  craftsman_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type ReviewReply = {
  id: string;
  review_id: string;
  craftsman_id: string;
  reply: string;
  created_at: string;
};

interface ReviewCardProps {
  review: Review;
  reply?: ReviewReply | null;
  isCraftsman?: boolean;
  onReplyUpdated?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  reply,
  isCraftsman = false,
  onReplyUpdated
}) => {
  const { user, userType } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editingReply, setEditingReply] = useState(false);
  const [editReplyText, setEditReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerDisplayName, setCustomerDisplayName] = useState<string>(review.customer_name);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  const userId = user?.id;
  const isReviewOwner = userId === review.customer_id;
  const canManageReply = isCraftsman && userId;
  const hasReply = !!reply && !!reply.reply;
  
  // Add some debug logging to help understand what's happening with replies
  console.log("ReviewCard rendering:", {
    reviewId: review.id,
    hasReply,
    replyData: reply,
    replyText: reply?.reply || "No reply text",
    isCraftsman,
    canManageReply
  });

  // Initialize editReplyText when reply data changes
  useEffect(() => {
    if (reply && reply.reply) {
      setEditReplyText(reply.reply);
    }
  }, [reply]);

  // Fetch real customer name and profile image from their profile
  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!review.customer_id) return;

      try {
        // First try customer_profiles table
        let { data: customerData, error: customerError } = await supabase
          .from('customer_profiles')
          .select('name, profile_image_url')
          .eq('id', review.customer_id)
          .single();

        if (customerError || !customerData) {
          // Fall back to profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', review.customer_id)
            .single();

          if (!profileError && profileData && profileData.name) {
            setCustomerDisplayName(profileData.name);
          }
        } else if (customerData) {
          if (customerData.name) {
            setCustomerDisplayName(customerData.name);
          }
          if (customerData.profile_image_url) {
            setProfileImageUrl(customerData.profile_image_url);
          }
        }
      } catch (err) {
        console.error("Error fetching customer profile:", err);
      }
    };

    fetchCustomerProfile();
  }, [review.customer_id]);
  
  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return format(date, 'dd.MM.yyyy');
    } catch (err) {
      console.error("Error formatting date:", dateString, err);
      return 'N/A';
    }
  };
  
  const handleReply = async () => {
    if (!replyText.trim() || !userId || !isCraftsman) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await (supabase.rpc as any)(
        'add_review_reply',
        {
          p_review_id: review.id,
          p_craftsman_id: userId,
          p_reply: replyText
        }
      );
      
      if (error) throw error;
      
      toast.success("Odpoveď bola úspešne pridaná");
      setReplyText("");
      setShowReplyForm(false);
      
      if (onReplyUpdated) {
        onReplyUpdated();
      }
    } catch (error: any) {
      console.error("Error adding review reply:", error);
      setError("Nastala chyba pri pridávaní odpovede.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateReply = async () => {
    if (!editReplyText.trim() || !userId || !isCraftsman || !reply) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Updating reply for review:", {
        reviewId: review.id,
        craftsmanId: userId,
        replyText: editReplyText,
        replyId: reply.id
      });
      
      const { error: updateError } = await supabase
        .from('craftsman_review_replies')
        .update({ reply: editReplyText })
        .eq('id', reply.id)
        .eq('craftsman_id', userId);
      
      if (updateError) throw updateError;
      
      toast.success("Odpoveď bola úspešne aktualizovaná");
      setEditingReply(false);
      
      if (onReplyUpdated) {
        onReplyUpdated();
      }
    } catch (error: any) {
      console.error("Error updating review reply:", error);
      setError("Nastala chyba pri aktualizácii odpovede.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="flex-shrink-0 w-10 h-10">
            {profileImageUrl ? (
              <AvatarImage src={profileImageUrl} alt={customerDisplayName} />
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5 text-gray-500" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div>
                <h3 className="font-medium">{customerDisplayName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <time dateTime={review.created_at}>
                    {formatDate(review.created_at)}
                  </time>
                </div>
              </div>
              
              <div className="flex items-center mt-1 sm:mt-0">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={index}
                    className={`h-4 w-4 ${index < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 mt-2">{review.comment}</p>
            
            {/* Reply section - Improved handling of reply data */}
            {reply && reply.reply && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">Odpoveď remeselníka</h4>
                      {canManageReply && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2" 
                          onClick={() => setEditingReply(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Upraviť</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{reply.reply}</p>
                    <span className="text-xs text-gray-400 block mt-1">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reply editing form */}
            {editingReply && (
              <div className="mt-4">
                {error && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Textarea
                  value={editReplyText}
                  onChange={(e) => setEditReplyText(e.target.value)}
                  placeholder="Upravte vašu odpoveď..."
                  className="mb-2"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingReply(false);
                      setEditReplyText(reply?.reply || "");
                    }}
                    disabled={isSubmitting}
                  >
                    Zrušiť
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleUpdateReply}
                    disabled={isSubmitting || !editReplyText.trim()}
                  >
                    {isSubmitting ? "Ukladám..." : "Uložiť zmeny"}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Reply form */}
            {canManageReply && !hasReply && (
              <div className="mt-4">
                {showReplyForm ? (
                  <div>
                    {error && (
                      <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Napíšte vašu odpoveď..."
                      className="mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyText("");
                        }}
                        disabled={isSubmitting}
                      >
                        Zrušiť
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleReply}
                        disabled={isSubmitting || !replyText.trim()}
                      >
                        {isSubmitting ? "Odosielam..." : "Odoslať odpoveď"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => setShowReplyForm(true)}
                  >
                    <CornerDownLeft className="h-4 w-4 mr-1" />
                    <span>Odpovedať</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
