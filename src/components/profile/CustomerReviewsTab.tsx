
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

const CustomerReviewsTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { user, userType } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Enhanced query to fetch reviews with craftsman names
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['customer-reviews', profileData?.id],
    queryFn: async () => {
      if (!profileData?.id) return [];
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*, craftsman:craftsman_id(name)')
        .eq('customer_id', profileData.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching customer reviews:", error);
        return [];
      }
      
      return data as (CraftsmanReview & { craftsman: { name: string } })[];
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
  const canAddReview = !!user && userType === 'customer';

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Hodnotenia remeselníkov</h3>
      
      {canAddReview && (
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
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      Hodnotenie pre: {review.craftsman?.name || 'Neznámy remeselník'}
                    </div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsTab;
