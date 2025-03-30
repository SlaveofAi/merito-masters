
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useProfileData } from "@/hooks/useProfileData";
import { useImageUploader } from "@/components/profile/ImageUploader";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  // Ensure we get the id parameter correctly
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Only pass id to useProfileData if it's not the literal ":id" string
  const profileId = id === ":id" ? undefined : id;
  
  const {
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
  } = useProfileData(profileId);

  useEffect(() => {
    // If we're on the current user's profile and it doesn't exist, try to create it
    if (user && isCurrentUser && profileNotFound) {
      console.log("Profile not found for current user, attempting to create default profile");
      setTimeout(() => {
        createDefaultProfileIfNeeded().catch(err => {
          console.error("Error creating profile:", err);
          toast.error("Nastala chyba pri vytváraní profilu", {
            description: err.message || "Neočakávaná chyba"
          });
        });
      }, 500);
    }
  }, [user, isCurrentUser, profileNotFound, createDefaultProfileIfNeeded]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfileData({...profileData, ...updatedProfile});
    setIsEditing(false);
    toast.success("Profil bol aktualizovaný");
  };

  const handleCreateProfile = () => {
    console.log("Manual profile creation initiated by user");
    createDefaultProfileIfNeeded().catch(error => {
      console.error("Error creating profile:", error);
      toast.error("Nastala chyba pri vytváraní profilu", {
        description: error.message || "Neočakávaná chyba"
      });
    });
  };

  const { handleProfileImageUpload, handlePortfolioImageUpload } = useImageUploader(
    user?.id || "",
    userType,
    (url) => setProfileImageUrl(url),
    () => fetchPortfolioImages(user?.id || "")
  );

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
      const newReview = {
        craftsman_id: id || profileData?.id,
        customer_id: user.id,
        customer_name: user.user_metadata?.name || "Anonymný používateľ",
        rating,
        comment: reviewComment,
      };
      
      const { error } = await supabase
        .from('craftsman_reviews')
        .insert(newReview);
      
      if (error) {
        console.error("Error submitting review:", error);
        toast.error("Nastala chyba pri odosielaní hodnotenia", {
          description: error.message,
        });
        return;
      }
      
      toast.success("Hodnotenie bolo pridané", {
        description: "Ďakujeme za vaše hodnotenie",
      });
      
      setRating(0);
      setReviewComment("");
      refetchReviews();
      
    } catch (error: any) {
      console.error("Error in handleSubmitReview:", error);
      toast.error("Nastala chyba pri odosielaní hodnotenia");
    }
  };

  console.log("Profile render state:", { 
    loading, 
    profileData, 
    userType, 
    isCurrentUser, 
    profileNotFound, 
    error,
    user: user?.id
  });

  if (loading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (profileNotFound && !isCurrentUser) {
    return (
      <Layout>
        <ProfileNotFound isCurrentUser={isCurrentUser} />
      </Layout>
    );
  }

  if (profileNotFound && isCurrentUser) {
    return (
      <Layout>
        <ProfileNotFound 
          isCurrentUser={isCurrentUser} 
          onCreateProfile={createDefaultProfileIfNeeded}
          error={error || undefined}
        />
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <ProfileNotFound 
          isCurrentUser={isCurrentUser} 
          onCreateProfile={createDefaultProfileIfNeeded}
          error={error || "Profil nebol nájdený alebo nemáte k nemu prístup. Možno je potrebné skontrolovať nastavenia Row Level Security v databáze."}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader 
          profileData={profileData}
          userType={userType}
          isCurrentUser={isCurrentUser}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          profileImageUrl={profileImageUrl}
          handleProfileImageUpload={handleProfileImageUpload}
          uploading={uploading}
          handleProfileUpdate={(updatedProfile) => {
            setProfileData({...profileData, ...updatedProfile});
            setIsEditing(false);
            toast.success("Profil bol aktualizovaný");
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-3 mb-8">
              <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
              <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
              <TabsTrigger value="contact">Kontakt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="animate-fade-in">
              <PortfolioTab 
                userType={userType}
                isCurrentUser={isCurrentUser}
                portfolioImages={portfolioImages}
                profileData={profileData}
                activeImageIndex={activeImageIndex}
                handleImageClick={handleImageClick}
                handlePortfolioImageUpload={handlePortfolioImageUpload}
                uploading={uploading}
              />
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <ReviewsTab 
                userType={userType}
                profileId={id || profileData?.id}
                rating={rating}
                reviewComment={reviewComment}
                handleStarClick={handleStarClick}
                setReviewComment={setReviewComment}
                handleSubmitReview={handleSubmitReview}
                reviews={reviews || []}
                isLoadingReviews={isLoadingReviews}
              />
            </TabsContent>
            
            <TabsContent value="contact" className="animate-fade-in">
              <ContactTab 
                profileData={profileData}
                userType={userType}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
