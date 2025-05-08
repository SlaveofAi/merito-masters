
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import PortfolioTab from "@/components/profile/PortfolioTab";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthRequiredMessage from "@/components/profile/AuthRequiredMessage";

const ProfilePortfolioContent: React.FC = () => {
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded,
    userType: profileUserType,
    profileImageUrl,
    fetchProfileData
  } = useProfile();
  const { userType: viewerUserType, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check if this is a customer profile
  const isCustomerProfile = profileData?.user_type === "customer";
  
  // Redirect customer profiles to reviews page (only when viewing their own profile)
  useEffect(() => {
    if (isCustomerProfile && isCurrentUser && !loading) {
      console.log("Customer profile detected, redirecting to reviews");
      const profileIdParam = profileData?.id ? `/${profileData.id}` : "";
      navigate(`/profile${profileIdParam}/reviews`);
    }
  }, [isCustomerProfile, isCurrentUser, loading, profileData?.id, navigate]);

  // If not authenticated, show auth required message
  if (!authLoading && !user) {
    console.log("User not authenticated, showing auth required message");
    return <AuthRequiredMessage />;
  }

  if (loading || authLoading) {
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
        {profileData && (
          <ProfileHeader 
            profileData={profileData}
            isCurrentUser={isCurrentUser}
            userType={profileUserType}
            profileImageUrl={profileImageUrl}
            fetchProfileData={fetchProfileData}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProfileNavigation activeTab="portfolio" userType={profileData?.user_type} />
          <div className="mt-8">
            <PortfolioTab />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrapper component that provides the ProfileProvider context
const ProfilePortfolioPage: React.FC = () => {
  return (
    <ProfileProvider>
      <ProfilePortfolioContent />
    </ProfileProvider>
  );
};

export default ProfilePortfolioPage;
