
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import UserTypeSelector from "@/components/profile/UserTypeSelector";
import ErrorMessage from "@/components/profile/ErrorMessage";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";

interface ProfilePageProps {
  initialTab?: string;
  isViewingOtherProfile?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ initialTab, isViewingOtherProfile = false }) => {
  const { user, userType: authUserType, updateUserType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded,
    userType: profileUserType
  } = useProfile();

  // Debug log to help with troubleshooting
  useEffect(() => {
    console.log("ProfilePage rendering with:", {
      loading,
      authUserType,
      profileUserType,
      profileDataExists: !!profileData,
      isCurrentUser,
      profileNotFound,
      userLoggedIn: !!user,
      error: error || "none",
      profileDataUserType: profileData?.user_type || "not available",
      initialTab,
      isViewingOtherProfile,
      currentPath: location.pathname
    });
  }, [loading, authUserType, profileUserType, profileData, isCurrentUser, profileNotFound, user, error, initialTab, location, isViewingOtherProfile]);

  // Use a more reliable determination of user type, with explicit precedence
  const getEffectiveUserType = () => {
    // First use the profile data's user_type if available
    if (profileData?.user_type) {
      return profileData.user_type;
    }
    
    // Next use the userType from context
    if (profileUserType) {
      return profileUserType;
    }
    
    // If we're viewing our own profile, use auth context
    if (!isViewingOtherProfile && authUserType) {
      return authUserType;
    }
    
    // Last resort - determine from profile data structure
    return ('trade_category' in (profileData || {}) ? 'craftsman' : 'customer');
  };

  // For current user but no user type detected
  if (user && !authUserType && isCurrentUser) {
    return (
      <Layout>
        <UserTypeSelector 
          userId={user.id} 
          userEmail={user.email} 
          updateUserType={updateUserType}
        />
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (error && error.includes("row-level security policy")) {
    return (
      <Layout>
        <ErrorMessage 
          type="access" 
          isCurrentUser={isCurrentUser} 
          onRetry={isCurrentUser ? createDefaultProfileIfNeeded : undefined}
        />
      </Layout>
    );
  }

  if (error && error.includes("database function names")) {
    return (
      <Layout>
        <ErrorMessage type="database" />
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

  // Get the effective user type for display
  const effectiveUserType = getEffectiveUserType();
  console.log("Using effective user type for display:", effectiveUserType);
  
  // Only redirect customer viewing their own profile if they're trying to view portfolio tab
  if (effectiveUserType === 'customer' && !isViewingOtherProfile && initialTab === 'portfolio') {
    console.log("Customer profile detected in portfolio view, redirecting to reviews");
    navigate("/profile/reviews", { replace: true });
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProfileTabs 
            userType={effectiveUserType} 
            initialTab={initialTab} 
            isViewingOtherProfile={isViewingOtherProfile}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
