
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileImages } from "@/hooks/useProfileImages";
import { useProfileReviews } from "@/hooks/useProfileReviews";
import { createDefaultProfile } from "@/utils/profileCreation";
import { toast } from "sonner";

export const useProfileData = (id?: string) => {
  const { user, userType } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const {
    loading,
    profileData,
    userType: fetchedUserType,
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
  } = useProfileImages(profileData, fetchedUserType || userType);

  const {
    reviews,
    isLoadingReviews,
    refetchReviews
  } = useProfileReviews(id || profileData?.id);

  const createDefaultProfileIfNeeded = useCallback(async () => {
    if (isCreatingProfile) {
      console.log("Profile creation already in progress, skipping");
      return;
    }
    
    setIsCreatingProfile(true);
    setError(null);
    
    try {
      console.log("Starting profile creation for:", user?.id, "userType:", userType);
      
      if (!user) {
        throw new Error("Používateľ nie je prihlásený");
      }
      
      if (!userType) {
        throw new Error("Typ používateľa nie je nastavený");
      }
      
      await createDefaultProfile(
        user, 
        userType, 
        isCurrentUser, 
        () => {
          console.log("Profile created successfully, fetching data");
          fetchProfileData();
        }
      );
    } catch (error: any) {
      console.error("Error in createDefaultProfileIfNeeded:", error);
      setError(error.message || "Unknown error");
      toast.error("Chyba pri vytváraní profilu", {
        description: error.message
      });
      throw error;
    } finally {
      setIsCreatingProfile(false);
    }
  }, [user, userType, isCurrentUser, fetchProfileData, isCreatingProfile]);

  return {
    loading,
    profileData,
    userType: fetchedUserType || userType,
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
    isCreatingProfile,
    error
  };
};
