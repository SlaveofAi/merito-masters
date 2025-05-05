
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileCalendar from "@/components/profile/ProfileCalendar";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ProfileCalendarContent: React.FC = () => {
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
  const { user, loading: authLoading, userType } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Enhanced craftsman detection - check both user_type field and trade_category existence
  const isCraftsmanProfile = profileData?.user_type === "craftsman" || 
                             (profileData && "trade_category" in profileData);
                            
  // Check if this is a customer profile
  const isCustomerProfile = profileData?.user_type === "customer";
  
  // Enhanced debug log to help troubleshoot
  useEffect(() => {
    console.log("ProfileCalendar page rendering:", {
      loading,
      profileFound: !!profileData,
      isCurrentUser,
      profileType: profileData?.user_type,
      isCraftsmanProfile,
      isCustomerProfile,
      hasTrade: profileData && "trade_category" in profileData,
      userType,
      userId: user?.id,
      profileId: profileData?.id
    });
  }, [loading, profileData, isCurrentUser, userType, user, isCraftsmanProfile, isCustomerProfile]);
  
  // If user is logged in as craftsman but doesn't have a profile, create one
  useEffect(() => {
    if (isCurrentUser && profileNotFound && userType === "craftsman") {
      console.log("Craftsman profile not found, will try to create default profile");
      setTimeout(() => {
        createDefaultProfileIfNeeded?.()
          .then(() => toast.success(t("profile_updated")))
          .catch(err => {
            console.error("Failed to create craftsman profile:", err);
            toast.error(t("profile_creation_error"));
          });
      }, 500);
    }
  }, [isCurrentUser, profileNotFound, userType, createDefaultProfileIfNeeded, t]);

  // Redirect customer profiles to reviews page
  useEffect(() => {
    if (isCustomerProfile && !loading && !authLoading) {
      console.log("Customer profile detected, redirecting to reviews");
      const profileIdParam = profileData?.id !== user?.id ? `/${profileData?.id}` : "";
      navigate(`/profile${profileIdParam}/reviews`);
    }
  }, [isCustomerProfile, loading, authLoading, profileData?.id, user?.id, navigate]);

  if (loading || authLoading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  // If it's a customer profile, don't show the calendar page at all
  if (isCustomerProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">
          <p>{t("loading")}</p>
        </div>
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
          error={error || t("profile_not_found")}
        />
      </Layout>
    );
  }

  // Check if user is attempting to send a booking request but not logged in
  const showLoginPrompt = !user && !isCurrentUser && isCraftsmanProfile;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pointer-events-auto">
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
          <ProfileNavigation activeTab="calendar" userType={profileData?.user_type} />
          
          <div className="mt-8 flex justify-center pointer-events-auto">
            <div className="w-full max-w-md pointer-events-auto">
              <ProfileCalendar />
              
              {/* Login prompt for non-logged in users */}
              {showLoginPrompt && (
                <div className="bg-white shadow rounded-lg p-6 mt-6 text-center">
                  <h3 className="text-xl font-semibold mb-4">{t("account_registration_required")}</h3>
                  <p className="text-gray-600 mb-6">
                    {t("account_required_message")}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate("/login")} className="pointer-events-auto">{t("login")}</Button>
                    <Button variant="outline" onClick={() => navigate("/register")} className="pointer-events-auto">{t("register")}</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrapper component that provides the ProfileProvider context
const ProfileCalendarPage: React.FC = () => {
  return (
    <ProfileProvider>
      <ProfileCalendarContent />
    </ProfileProvider>
  );
};

export default ProfileCalendarPage;
