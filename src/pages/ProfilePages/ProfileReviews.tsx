
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ReviewsTab from "@/components/profile/ReviewsTab";
import CustomerReviewsTab from "@/components/profile/CustomerReviewsTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";
import { toast } from "sonner";

const ProfileReviewsContent: React.FC = () => {
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    userType,
    createDefaultProfileIfNeeded
  } = useProfile();

  // Enhanced debug log to help troubleshoot the profile data and user type
  useEffect(() => {
    console.log("ProfileReviews rendering:", {
      loading, 
      profileFound: !!profileData,
      userType,
      profileUserType: profileData?.user_type,
      isCurrentUser,
      canLeaveReview: userType === 'customer' && profileData?.user_type === 'craftsman' && !isCurrentUser
    });
  }, [loading, profileData, userType, isCurrentUser]);

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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProfileNavigation activeTab="reviews" userType={profileData.user_type} />
          
          <div className="mt-8">
            {profileData.user_type && profileData.user_type.toLowerCase() === 'customer' ? (
              <CustomerReviewsTab />
            ) : (
              <ReviewsTab />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrapper component that provides the ProfileProvider context
const ProfileReviews: React.FC = () => {
  return (
    <ProfileProvider>
      <ProfileReviewsContent />
    </ProfileProvider>
  );
};

export default ProfileReviews;
