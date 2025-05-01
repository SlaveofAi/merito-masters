
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { CraftsmanReview } from "@/types/profile";
import ReviewForm from "./ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";

const CustomerReviewsTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { user, userType } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Enhanced query to fetch reviews with craftsman names
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['customer-reviews', profileData?.id],
    queryFn: async () => {
      if (!profileData?.id) return [];
      
      console.log("Fetching reviews for customer:", profileData.id);
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select(`
          *,
          craftsman:craftsman_id (
            id, 
            name,
            trade_category,
            profile_image_url
          )
        `)
        .eq('customer_id', profileData.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching customer reviews:", error);
        throw error;
      }
      
      console.log("Customer reviews fetched:", data?.length || 0);
      return data as (CraftsmanReview & { craftsman: { id: string, name: string, trade_category: string, profile_image_url: string | null } })[];
    },
    enabled: !!profileData?.id,
  });

  const handleReviewSuccess = () => {
    refetch();
    setShowAddForm(false);
    toast.success("Hodnotenie bolo úspešne pridané");
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Načítavam hodnotenia...</p>
      </div>
    );
  }

  // Determine if the user can add reviews (ensuring proper user type check)
  const canAddReview = !!user && userType && userType.toLowerCase() === 'customer';

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Hodnotenia remeselníkov</h3>
      
      {canAddReview && isCurrentUser && (
        <div className="mb-6">
          {!showAddForm ? (
            <button 
              onClick={() => setShowAddForm(true)} 
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Pridať nové hodnotenie
            </button>
          ) : (
            <ReviewForm 
              userId={user.id} 
              profileId="empty"
              userName={user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymný zákazník'}
              onSuccess={handleReviewSuccess}
              isSelectCraftsman={true}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      )}

      {!reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {isCurrentUser 
                ? "Zatiaľ ste nenapísali žiadne hodnotenia."
                : "Tento používateľ zatiaľ nenapísal žiadne hodnotenia."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex items-start space-x-3">
                    <Link to={`/profile/${review.craftsman?.id}/portfolio`}>
                      <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                        {review.craftsman?.profile_image_url ? (
                          <AvatarImage 
                            src={review.craftsman.profile_image_url} 
                            alt={review.craftsman?.name || 'Remeselník'} 
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-gray-200">
                            <User className="text-gray-500" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Link>
                    <div>
                      <Link 
                        to={`/profile/${review.craftsman?.id}/portfolio`}
                        className="font-medium hover:text-primary hover:underline transition-colors"
                      >
                        {review.craftsman?.name || 'Neznámy remeselník'}
                      </Link>
                      {review.craftsman?.trade_category && (
                        <Badge variant="outline" className="mt-1">
                          {review.craftsman.trade_category}
                        </Badge>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(review.created_at).toLocaleString("sk-SK", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
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
                {/* Added break-words to wrap text properly on mobile */}
                <p className="text-gray-700 mt-4 break-words whitespace-normal">{review.comment || "Bez komentára"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsTab;
