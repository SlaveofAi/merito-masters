
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileImages } from "@/hooks/useProfileImages";
import { useProfileReviews } from "@/hooks/useProfileReviews";
import { createDefaultProfile } from "@/utils/profileCreation";

export const useProfileData = (id?: string) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    setProfileData,
    fetchProfileData,
  } = useProfileCore(id);

  const {
    portfolioImages,
    profileImageUrl,
    setProfileImageUrl,
    fetchPortfolioImages
  } = useProfileImages(profileData, userType);

  const {
    reviews,
    isLoadingReviews,
    refetchReviews
  } = useProfileReviews(id || profileData?.id);

  const createDefaultProfileIfNeeded = useCallback(async () => {
    setError(null);
    try {
      await createDefaultProfile(
        user, 
        userType, 
        isCurrentUser, 
        fetchProfileData
      );
    } catch (error: any) {
      setError(error.message || "Unknown error");
      throw error;
    }
  }, [user, userType, isCurrentUser, fetchProfileData]);

  return {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    portfolioImages,
    profileImageUrl,
    reviews,
    isLoadingReviews,
    refetchReviews,
    setProfileData,
    setProfileImageUrl,
    fetchPortfolioImages,
    createDefaultProfileIfNeeded,
    error
  };
};
