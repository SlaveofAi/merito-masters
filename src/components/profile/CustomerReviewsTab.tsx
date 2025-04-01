
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { CraftsmanReview } from "@/types/profile";

const CustomerReviewsTab: React.FC = () => {
  const { profileData } = useProfile();
  
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['customer-reviews', profileData?.id],
    queryFn: async () => {
      if (!profileData?.id) return [];
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('customer_id', profileData.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching customer reviews:", error);
        return [];
      }
      
      return data as CraftsmanReview[];
    },
    enabled: !!profileData?.id,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Načítavam hodnotenia...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            Zatiaľ ste nenapísali žiadne hodnotenia.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Vaše hodnotenia remeselníkov</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">Hodnotenie pre: {review.craftsman_id}</div>
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
    </div>
  );
};

export default CustomerReviewsTab;
