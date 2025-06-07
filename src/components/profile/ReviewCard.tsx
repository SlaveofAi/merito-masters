
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, User, MessageSquare, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReviewForm from "./ReviewForm";

interface ReviewCardProps {
  review: any;
  reply: any;
  isCraftsman: boolean;
  canEdit?: boolean;
  onReplyUpdated: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, reply, isCraftsman, canEdit, onReplyUpdated }) => {
  const [customerData, setCustomerData] = useState<{ name: string | null; imageUrl: string | null }>({ name: null, imageUrl: null });
  const [craftsmanData, setCraftsmanData] = useState<{ name: string | null; imageUrl: string | null }>({ name: null, imageUrl: null });
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // CustomerProfileLink component for linking to customer profiles
  const CustomerProfileLink = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <Link 
      to={`/profile/${review.customer_id}/reviews`}
      className={`hover:underline hover:text-primary transition-colors ${className}`}
    >
      {children}
    </Link>
  );

  const CraftsmanProfileLink = () => (
    <Link 
      to={`/craftsman/${review.craftsman_id}`}
      className="font-medium hover:text-primary hover:underline transition-colors"
    >
      {craftsmanData.name || 'Remeselník'}
    </Link>
  );

  useEffect(() => {
    // Fetch customer data from profiles table
    const fetchCustomerData = async () => {
      try {
        const { data: customer, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', review.customer_id)
          .single();

        if (error) {
          console.error("Error fetching customer data:", error);
        } else if (customer) {
          setCustomerData({ name: customer.name, imageUrl: null });
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    fetchCustomerData();
  }, [review.customer_id]);

  useEffect(() => {
    // Fetch craftsman data from craftsman_profiles table
    const fetchCraftsmanData = async () => {
      try {
        const { data: craftsman, error } = await supabase
          .from('craftsman_profiles')
          .select('name, profile_image_url')
          .eq('id', review.craftsman_id)
          .single();

        if (error) {
          console.error("Error fetching craftsman data:", error);
        } else if (craftsman) {
          setCraftsmanData({ name: craftsman.name, imageUrl: craftsman.profile_image_url });
        }
      } catch (error) {
        console.error("Error fetching craftsman data:", error);
      }
    };

    fetchCraftsmanData();
  }, [review.craftsman_id]);

  const handleReplySubmit = async () => {
    setIsSubmittingReply(true);
    try {
      const { data, error } = await supabase
        .from('craftsman_review_replies')
        .insert([{ 
          review_id: review.id, 
          reply: replyText,
          craftsman_id: review.craftsman_id 
        }]);

      if (error) {
        console.error("Error submitting reply:", error);
        toast.error("Chyba pri odosielaní odpovede");
      } else {
        toast.success("Odpoveď bola úspešne odoslaná");
        setShowReplyForm(false);
        setReplyText("");
        onReplyUpdated();
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Nastala chyba pri odosielaní odpovede");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onReplyUpdated();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          {/* Customer Info Section */}
          <div className="flex items-start space-x-3">
            <CustomerProfileLink>
              <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                {customerData.imageUrl ? (
                  <AvatarImage src={customerData.imageUrl} alt={customerData.name || 'Customer'} />
                ) : (
                  <AvatarFallback className="bg-gray-200">
                    <User className="text-gray-500" />
                  </AvatarFallback>
                )}
              </Avatar>
            </CustomerProfileLink>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <CustomerProfileLink>
                  <h4 className="text-sm font-medium">{customerData.name || 'Zákazník'}</h4>
                </CustomerProfileLink>
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
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(review.created_at), 'dd.MM.yyyy HH:mm', { locale: sk })}
              </p>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-3">
            <p className="text-gray-700 break-words whitespace-normal">
              {review.comment || "Bez komentára"}
            </p>

            {/* Craftsman info if this is from customer reviews tab */}
            {craftsmanData.name && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Remeselník:</span>
                  <div className="flex items-center gap-2">
                    <Link to={`/craftsman/${review.craftsman_id}`}>
                      <Avatar className="flex-shrink-0 w-6 h-6 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                        {craftsmanData.imageUrl ? (
                          <AvatarImage src={craftsmanData.imageUrl} alt={craftsmanData.name} />
                        ) : (
                          <AvatarFallback className="bg-gray-200">
                            <User className="text-gray-500 w-3 h-3" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Link>
                    <CraftsmanProfileLink />
                  </div>
                </div>
              </div>
            )}

            {/* Edit button for customer's own reviews */}
            {canEdit && !isEditing && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-sm text-gray-500 hover:text-primary"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Upraviť hodnotenie
                </Button>
              </div>
            )}

            {/* Edit form */}
            {isEditing && canEdit && (
              <div className="border-t pt-4">
                <ReviewForm
                  userId={review.customer_id}
                  profileId={review.craftsman_id}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setIsEditing(false)}
                  existingReview={{
                    id: review.id,
                    rating: review.rating,
                    comment: review.comment || ""
                  }}
                />
              </div>
            )}

            {/* Reply section */}
            {reply && (
              <div className="bg-blue-50 p-4 rounded-md mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Odpoveď remeselníka</span>
                  <span className="text-xs text-blue-600">
                    {format(new Date(reply.created_at), 'dd.MM.yyyy HH:mm', { locale: sk })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{reply.reply}</p>
              </div>
            )}

            {/* Reply form for craftsman */}
            {isCraftsman && !reply && !showReplyForm && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReplyForm(true)}
                  className="flex items-center text-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Odpovedať
                </Button>
              </div>
            )}

            {showReplyForm && isCraftsman && !reply && (
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Vaša odpoveď:</label>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Napíšte svoju odpoveď na hodnotenie..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText("");
                      }}
                    >
                      Zrušiť
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim() || isSubmittingReply}
                    >
                      {isSubmittingReply ? "Odosiela sa..." : "Odoslať odpoveď"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
