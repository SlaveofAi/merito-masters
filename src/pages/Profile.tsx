
import React, { useState } from "react";
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
import { useProfileData } from "@/hooks/useProfileData";
import { useImageUploader } from "@/components/profile/ImageUploader";

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
    setProfileData,
    setProfileImageUrl,
    fetchPortfolioImages
  } = useProfileData(id);

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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Hodnotenie bolo odoslané", {
      description: "Ďakujeme za vaše hodnotenie",
    });
    setRating(0);
    setReviewComment("");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (profileNotFound) {
    return (
      <Layout>
        <ProfileNotFound isCurrentUser={isCurrentUser} />
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Profil nebol nájdený</h1>
          <button onClick={() => navigate("/")}>Späť na domovskú stránku</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/30">
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
                rating={rating}
                reviewComment={reviewComment}
                handleStarClick={handleStarClick}
                setReviewComment={setReviewComment}
                handleSubmitReview={handleSubmitReview}
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
