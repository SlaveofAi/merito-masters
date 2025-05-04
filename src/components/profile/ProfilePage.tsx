
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

const ProfilePage: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
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
      currentPath: location.pathname
    });
  }, [loading, authUserType, profileUserType, profileData, isCurrentUser, profileNotFound, user, error, initialTab, location]);

  // Use a more reliable determination of user type, with explicit precedence
  const getEffectiveUserType = () => {
    // Priority chain: profile data > profile context > auth context > data analysis
    return (profileData?.user_type || profileUserType || authUserType || 
          ('trade_category' in (profileData || {}) ? 'craftsman' : 'customer'));
  };

  // Handle customer views - ensure they're looking at reviews tab
  useEffect(() => {
    const effectiveUserType = getEffectiveUserType();
    
    // If we are a customer and not already on reviews tab
    if (isCurrentUser && 
        (effectiveUserType === 'customer' || authUserType === 'customer') && 
        location.pathname !== "/profile/reviews" && 
        !location.pathname.endsWith('/calendar')) {
      console.log("Customer profile detected in useEffect, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [isCurrentUser, authUserType, navigate, location.pathname]);

  // Create default profile if needed
  useEffect(() => {
    if (isCurrentUser && profileNotFound && createDefaultProfileIfNeeded) {
      console.log("Profile not found for current user, attempting to create default profile");
      setTimeout(() => {
        createDefaultProfileIfNeeded?.().catch(err => {
          console.error("Error creating profile:", err);
          toast.error("Nastala chyba pri vytváraní profilu", {
            description: err.message || "Neočakávaná chyba"
          });
        });
      }, 500);
    }
  }, [isCurrentUser, profileNotFound, createDefaultProfileIfNeeded]);

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
  
  // Final safeguard - if we're a customer profile viewing portfolio tab, redirect immediately
  if (effectiveUserType === 'customer' && initialTab === 'portfolio') {
    console.log("Customer profile detected in portfolio view, final redirect safeguard");
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
          <ProfileTabs userType={effectiveUserType} initialTab={initialTab} />
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
