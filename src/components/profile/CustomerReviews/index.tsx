
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import LoadingState from "./LoadingState";
import ReviewList from "./ReviewList";
import EditReviewSection from "./EditReviewSection";
import { CraftsmanReviewWithCraftsman } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

const CustomerReviewsTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { user, userType } = useAuth();
  const [editingReview, setEditingReview] = useState<CraftsmanReviewWithCraftsman | null>(null);
  const isMobile = useIsMobile();
  
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
      return data as CraftsmanReviewWithCraftsman[];
    },
    enabled: !!profileData?.id,
  });

  const handleReviewSuccess = () => {
    refetch();
    setEditingReview(null);
    toast.success("Hodnotenie bolo úspešne upravené");
  };

  const handleEditClick = (review: CraftsmanReviewWithCraftsman) => {
    setEditingReview(review);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className={isMobile ? "px-2" : ""}>
      <h3 className={`text-xl font-semibold mb-4 ${isMobile ? 'text-center text-lg' : ''}`}>
        Hodnotenia remeselníkov
      </h3>
      
      {/* Only show editing form if there's a review being edited */}
      {editingReview && (
        <EditReviewSection 
          editingReview={editingReview}
          userId={user?.id || ""}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Show message for customers viewing their own profile with no reviews */}
      {isCurrentUser && (!reviews || reviews.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <p>Zatiaľ ste nevykonali žiadne hodnotenia.</p>
          <p className="mt-2 text-sm">Hodnotenia môžete pridávať na profiloch remeselníkov po dokončení práce.</p>
        </div>
      )}

      {/* Show message for non-current users with no reviews */}
      {!isCurrentUser && (!reviews || reviews.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <p>Tento zákazník zatiaľ nevytvoril žiadne hodnotenia.</p>
        </div>
      )}

      <ReviewList 
        reviews={reviews || []}
        isCurrentUser={isCurrentUser}
        onEditClick={handleEditClick}
        editingReview={editingReview}
      />
    </div>
  );
};

export default CustomerReviewsTab;
