
import React, { createContext, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useImageUploader } from "@/components/profile/ImageUploader";
import { ProfileData } from "@/types/profile";

interface ProfileContextType {
  loading: boolean;
  profileData: ProfileData | null;
  userType: 'customer' | 'craftsman' | null;
  isCurrentUser: boolean;
  profileNotFound: boolean;
  error: string | null;
  portfolioImages: any[];
  profileImageUrl: string | null;
  reviews: any[];
  isLoadingReviews: boolean;
  activeImageIndex: number;
  isEditing: boolean;
  uploading: boolean;
  isCreatingProfile: boolean;
  rating: number;
  reviewComment: string;
  customSpecialization: string;
  saving: boolean;
  projects: any[]; 
  deletingImage: string | null;
  setActiveImageIndex: (index: number) => void;
  setIsEditing: (value: boolean) => void;
  setRating: (value: number) => void;
  setReviewComment: (value: string) => void;
  setCustomSpecialization: (value: string) => void;
  updateCustomSpecialization: (value: string) => Promise<void>;
  handleProfileImageUpload: (event: React.ChangeEvent<HTMLInputElement> | File | Blob) => void;
  handlePortfolioImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleProfileUpdate: (updatedProfile: any) => void;
  handleSubmitReview: (e: React.FormEvent) => void;
  handleImageClick: (index: number) => void;
  handleStarClick: (value: number) => void;
  refetchReviews: () => void;
  createDefaultProfileIfNeeded: () => Promise<void>;
  fetchPortfolioImages?: (userId: string) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
  createProject: (title: string, description: string, images: File[]) => Promise<void>;
  fetchProfileData: () => void;  // Added missing function declaration
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  const profileId = id === ":id" ? undefined : id;
  
  // Extract all the needed properties from useProfileData
  const {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    portfolioImages,
    profileImageUrl,
    customSpecialization,
    saving,
    reviews,
    isLoadingReviews,
    refetchReviews,
    setProfileData,
    setProfileImageUrl,
    setCustomSpecialization,
    fetchPortfolioImages,
    handleProfileImageUpload: handleProfileImageUploadHook,
    handlePortfolioImageUpload: handlePortfolioImageUploadHook,
    updateCustomSpecialization,
    createDefaultProfileIfNeeded,
    isCreatingProfile,
    error,
    projects,
    removeProject,
    createProject,
    fetchProfileData
  } = useProfileData(profileId);

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfileData({...profileData, ...updatedProfile});
    setIsEditing(false);
    toast.success("Profil bol aktualizovaný");
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Pre pridanie hodnotenia sa musíte prihlásiť", {
        description: "Prosím, prihláste sa pre pridanie hodnotenia",
      });
      return;
    }
    
    if (rating === 0) {
      toast.error("Prosím, vyberte hodnotenie", {
        description: "Pridajte aspoň jednu hviezdičku",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await handleReviewSubmission();
      setRating(0);
      setReviewComment("");
      refetchReviews();
      toast.success("Hodnotenie bolo pridané", {
        description: "Ďakujeme za vaše hodnotenie",
      });
    } catch (error: any) {
      console.error("Error in handleSubmitReview:", error);
      toast.error("Nastala chyba pri odosielaní hodnotenia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmission = async () => {
    const { error } = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        craftsman_id: id || profileData?.id,
        rating,
        comment: reviewComment,
      }),
    }).then(r => r.json());
    
    if (error) {
      throw new Error(error.message);
    }
  };

  // Use our hook version of the image upload functions
  const handleProfileImageUpload = (input: React.ChangeEvent<HTMLInputElement> | File | Blob) => {
    if (input instanceof File || input instanceof Blob) {
      return handleProfileImageUploadHook(input);
    } 
    
    // If it's an event, get the file from the event
    if (input.target && input.target.files && input.target.files.length > 0) {
      return handleProfileImageUploadHook(input.target.files[0]);
    }
  };

  const value = {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    error,
    portfolioImages,
    profileImageUrl,
    reviews,
    isLoadingReviews,
    activeImageIndex,
    isEditing,
    uploading,
    isCreatingProfile,
    rating,
    reviewComment,
    customSpecialization,
    saving,
    projects,
    deletingImage,
    setActiveImageIndex,
    setIsEditing,
    setRating,
    setReviewComment,
    setCustomSpecialization,
    updateCustomSpecialization,
    handleProfileImageUpload,
    handlePortfolioImageUpload: handlePortfolioImageUploadHook,
    handleProfileUpdate,
    handleSubmitReview,
    handleImageClick,
    handleStarClick,
    refetchReviews,
    createDefaultProfileIfNeeded,
    fetchPortfolioImages,
    removeProject,
    createProject,
    fetchProfileData,  // Added missing property to the context value
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
