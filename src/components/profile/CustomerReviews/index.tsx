
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReviewForm from "../ReviewForm";
import LoadingState from "./LoadingState";
import ReviewList from "./ReviewList";
import AddReviewButton from "./AddReviewButton";
import EditReviewSection from "./EditReviewSection";
import { CraftsmanReviewWithCraftsman } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

const CustomerReviewsTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { user, userType } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState<CraftsmanReviewWithCraftsman | null>(null);
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
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
    setShowAddForm(false);
    setEditingReview(null);
    toast.success(t("profile_updated"));
  };

  const handleEditClick = (review: CraftsmanReviewWithCraftsman) => {
    setEditingReview(review);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // Determine if the user can add reviews (ensuring proper user type check)
  const canAddReview = !!user && userType && userType.toLowerCase() === 'customer';

  return (
    <div className={isMobile ? "px-2" : ""}>
      <h3 className={`text-xl font-semibold mb-4 ${isMobile ? 'text-center text-lg' : ''}`}>
        {t("reviews")}
      </h3>
      
      {canAddReview && isCurrentUser && (
        <div className="mb-6">
          {!showAddForm && !editingReview ? (
            <AddReviewButton onClick={() => setShowAddForm(true)} />
          ) : showAddForm && !editingReview ? (
            <ReviewForm 
              userId={user.id} 
              profileId="empty"
              userName={user.user_metadata?.name || user.user_metadata?.full_name || t("anonymous_customer")}
              onSuccess={handleReviewSuccess}
              isSelectCraftsman={true}
              onCancel={() => setShowAddForm(false)}
            />
          ) : null}
        </div>
      )}

      {/* Editing form */}
      {editingReview && (
        <EditReviewSection 
          editingReview={editingReview}
          userId={user?.id || ""}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancelEdit}
        />
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
