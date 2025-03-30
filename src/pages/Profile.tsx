
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";
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
import { CraftsmanReview } from "@/types/profile";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    createDefaultProfileIfNeeded
  } = useProfileData(id);

  // Try to create a default profile if needed
  useEffect(() => {
    if (user && isCurrentUser && profileNotFound) {
      createDefaultProfileIfNeeded();
    }
  }, [user, isCurrentUser, profileNotFound, createDefaultProfileIfNeeded]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfileData({...profileData, ...updatedProfile});
    setIsEditing(false);
    toast.success("Profil bol aktualizovaný");
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
        .from('craftsman_reviews' as any)
        .insert(newReview as any);
      
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Váš profil sa vytvára</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Prosím, vyčkajte chvíľu, kým sa váš profil dokončí. Ak problém pretrváva, skúste obnoviť stránku.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => createDefaultProfileIfNeeded()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Vytvoriť profil
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-secondary text-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
            >
              Obnoviť stránku
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Profil nebol nájdený</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Zdá sa, že profil nie je dostupný. Ak ste sa práve zaregistrovali, môže to byť spôsobené problémom s oprávneniami v databáze.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/")}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Späť na domovskú stránku
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-secondary text-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
            >
              Obnoviť stránku
            </button>
          </div>
        </div>
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
          handleProfileUpdate={handleProfileUpdate}
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
