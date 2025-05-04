
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ReviewsTab from "@/components/profile/ReviewsTab";
import CustomerReviewsTab from "@/components/profile/CustomerReviewsTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/EditProfileForm";

const ProfileReviewsContent: React.FC = () => {
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    userType,
    createDefaultProfileIfNeeded,
    profileImageUrl,
    fetchProfileData,
    setIsEditing,
    isEditing,
    handleProfileUpdate // Make sure we extract this from the context
  } = useProfile();

  // Enhanced debug log to help troubleshoot the profile data and user type
  useEffect(() => {
    console.log("ProfileReviews rendering:", {
      loading, 
      profileFound: !!profileData,
      userType,
      profileUserType: profileData?.user_type,
      isCurrentUser,
      canLeaveReview: userType === 'customer' && profileData?.user_type === 'craftsman' && !isCurrentUser,
      isCraftsmanProfile: profileData?.user_type === 'craftsman',
      isCustomerProfile: profileData?.user_type === 'customer',
      isEditing
    });
  }, [loading, profileData, userType, isCurrentUser, isEditing]);

  const handleEditClick = () => {
    console.log("Edit profile button clicked, setting isEditing to true");
    setIsEditing(true);
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
          error={error || "Profil nebol nájdený alebo nemáte k nemu prístup."}
        />
      </Layout>
    );
  }

  const isCustomerProfile = profileData.user_type && 
                           profileData.user_type.toLowerCase() === 'customer';

  // Don't display tabs when editing
  if (isEditing && profileData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader 
              profileData={profileData}
              isCurrentUser={isCurrentUser}
              userType={userType}
              profileImageUrl={profileImageUrl}
              fetchProfileData={fetchProfileData}
            />
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProfileNavigation activeTab="reviews" userType={profileData?.user_type} />
              <div className="py-4 mt-6">
                <EditProfileForm 
                  profile={profileData} 
                  userType={profileData.user_type} 
                  onUpdate={handleProfileUpdate} 
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {profileData && (
            <>
              <ProfileHeader 
                profileData={profileData}
                isCurrentUser={isCurrentUser}
                userType={userType}
                profileImageUrl={profileImageUrl}
                fetchProfileData={fetchProfileData}
              />
              
              {isCurrentUser && (
                <div className="flex justify-end mb-6">
                  <Button 
                    onClick={handleEditClick}
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" /> 
                    Upraviť profil
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <ProfileNavigation activeTab="reviews" userType={profileData?.user_type} />
            
            <div className="mt-6">
              {isCustomerProfile ? (
                <CustomerReviewsTab />
              ) : (
                <ReviewsTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Add handler for profile updates
const ProfileReviews: React.FC = () => {
  return (
    <ProfileProvider>
      <ProfileReviewsContent />
    </ProfileProvider>
  );
};

export default ProfileReviews;
