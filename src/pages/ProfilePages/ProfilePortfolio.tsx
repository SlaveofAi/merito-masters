
import React from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";

const ProfilePortfolio: React.FC = () => {
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded
  } = useProfile();

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
          <ProfileNavigation activeTab="portfolio" userType={profileData.user_type} />
          
          <div className="mt-8">
            <PortfolioTab />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePortfolio;
