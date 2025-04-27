
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, isValid } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StarIcon, Trash2 } from "lucide-react";
import { AlertCircle, CheckCircle2, CornerDownLeft, Edit, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [localReply, setLocalReply] = useState<ReviewReply | null>(reply || null);
  
  const userId = user?.id;
  const isReviewOwner = userId === review.customer_id;
  const canManageReply = isCraftsman && userId;
  const hasReply = !!localReply && !!localReply.reply;
  
  console.log("ReviewCard rendering:", {
    reviewId: review.id,
    hasReply,
    replyData: localReply,
    replyText: localReply?.reply || "No reply text",
    isCraftsman,
    canManageReply
  });

  // Update local state when reply prop changes
  useEffect(() => {
    if (reply) {
      setLocalReply(reply);
      setEditReplyText(reply.reply || "");
    }
  }, [reply]);

  // Update edit text when localReply changes
  useEffect(() => {
    if (localReply && localReply.reply) {
      setEditReplyText(localReply.reply);
    }
  }, [localReply]);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!review.customer_id) return;

      try {
        let { data: customerData, error: customerError } = await supabase
          .from('customer_profiles')
          .select('name, profile_image_url')
          .eq('id', review.customer_id)
          .single();

        if (customerError || !customerData) {
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
      
      // Get the newly created reply
      const { data: newReply, error: fetchError } = await supabase
        .from('craftsman_review_replies')
        .select('*')
        .eq('review_id', review.id)
        .single();
        
      if (!fetchError && newReply) {
        setLocalReply(newReply as ReviewReply);
      }
      
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
    if (!editReplyText.trim() || !userId || !isCraftsman || !localReply) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('craftsman_review_replies')
        .update({ 
          reply: editReplyText,
          created_at: new Date().toISOString()
        })
        .eq('id', localReply.id)
        .eq('craftsman_id', userId)
        .select();
      
      if (updateError) {
        console.error("Error updating reply:", updateError);
        throw updateError;
      }
      
      console.log("Update response:", data);
      
      if (data && data[0]) {
        // Update the local reply state immediately
        const updatedReply = {
          ...localReply,
          reply: editReplyText,
          created_at: data[0].created_at
        };
        setLocalReply(updatedReply);
      }
      
      toast.success("Odpoveď bola úspešne aktualizovaná");
      setEditingReply(false);
      
      if (onReplyUpdated) {
        onReplyUpdated();
      }
    } catch (error: any) {
      console.error("Error updating review reply:", error);
      setError("Nastala chyba pri aktualizácii odpovede.");
      toast.error("Nastala chyba pri aktualizácii odpovede");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      const { error } = await supabase
        .from('craftsman_reviews')
        .delete()
        .eq('id', review.id)
        .eq('customer_id', userId);

      if (error) {
        console.error("Error deleting review:", error);
        throw error;
      }

      toast.success("Hodnotenie bolo úspešne vymazané");
      if (onReplyUpdated) onReplyUpdated();
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Nastala chyba pri mazaní hodnotenia");
    }
  };

  const handleDeleteReply = async () => {
    if (!localReply) return;
    
    try {
      console.log("Deleting reply:", {
        replyId: localReply.id,
        craftsmanId: userId
      });
      
      const { error } = await supabase
        .from('craftsman_review_replies')
        .delete()
        .eq('id', localReply.id)
        .eq('craftsman_id', userId);

      if (error) {
        console.error("Error deleting reply:", error);
        throw error;
      }

      // Update local state to remove reply
      setLocalReply(null);
      toast.success("Odpoveď bola úspešne vymazaná");
      if (onReplyUpdated) onReplyUpdated();
    } catch (err) {
      console.error("Error deleting reply:", err);
      toast.error("Nastala chyba pri mazaní odpovede");
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
              
              <div className="flex items-center mt-1 sm:mt-0 gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon
                      key={index}
                      className={`h-4 w-4 ${index < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                {isReviewOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Vymazať hodnotenie</AlertDialogTitle>
                        <AlertDialogDescription>
                          Naozaj chcete vymazať toto hodnotenie? Túto akciu nie je možné vrátiť späť.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteReview}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Vymazať
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mt-2">{review.comment}</p>
            
            {localReply && localReply.reply && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">Odpoveď remeselníka</h4>
                      <div className="flex gap-2">
                        {canManageReply && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 px-2" 
                              onClick={() => setEditingReply(true)}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Upraviť</span>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">Vymazať</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Vymazať odpoveď</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Naozaj chcete vymazať túto odpoveď? Túto akciu nie je možné vrátiť späť.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={handleDeleteReply}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Vymazať
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{localReply.reply}</p>
                    <span className="text-xs text-gray-400 block mt-1">
                      {formatDate(localReply.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
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
                      setEditReplyText(localReply?.reply || "");
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
