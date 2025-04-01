
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileImages } from "@/hooks/useProfileImages";
import { useProfileReviews } from "@/hooks/useProfileReviews";
import { createDefaultProfile } from "@/utils/profileCreation";
import { uploadProfileImage } from "@/utils/imageUpload";
import { toast } from "sonner";

export const useProfileData = (id?: string) => {
  const { user, userType } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleProfileImageUpload = async (file: File | Blob) => {
    if (!profileData || !user) {
      toast.error("Nie je možné nahrať fotku, používateľ nie je prihlásený");
      return;
    }
    
    setUploading(true);
    try {
      const url = await uploadProfileImage(file, profileData.id, fetchedUserType || userType);
      if (url) {
        setProfileImageUrl(url);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Nastala chyba pri nahrávaní profilovej fotky");
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileData || !user) {
      toast.error("Nie je možné nahrať fotku, používateľ nie je prihlásený");
      return;
    }
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      
      // Clear the input value so that the same file can be selected again if needed
      e.target.value = '';
      
      if (files.length > 5) {
        toast.warning("Môžete nahrať maximálne 5 obrázkov naraz");
        files.splice(5);
      }
      
      await uploadPortfolioImages(files, profileData.id);
      
      // Refresh portfolio images
      if (fetchPortfolioImages) {
        await fetchPortfolioImages(profileData.id);
      }
    } catch (error) {
      console.error("Error uploading portfolio images:", error);
      toast.error("Nastala chyba pri nahrávaní obrázkov do portfólia");
    } finally {
      setUploading(false);
    }
  };

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
          // Wait a moment before clearing the creating state to give time for UI updates
          setTimeout(() => {
            setIsCreatingProfile(false);
          }, 2000);
        }
      );
    } catch (error: any) {
      console.error("Error in createDefaultProfileIfNeeded:", error);
      setError(error.message || "Unknown error");
      toast.error("Chyba pri vytváraní profilu", {
        description: error.message
      });
      setIsCreatingProfile(false);
      throw error;
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
    handleProfileImageUpload,
    handlePortfolioImageUpload,
    createDefaultProfileIfNeeded,
    isCreatingProfile,
    uploading,
    error
  };
};
