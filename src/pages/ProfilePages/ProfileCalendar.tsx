
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

const ProfileCalendarContent: React.FC = () => {
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded,
    userType: profileUserType
  } = useProfile();
  const { user, loading: authLoading, userType } = useAuth();
  const navigate = useNavigate();

  // Enhanced craftsman detection - check both user_type field and trade_category existence
  const isCraftsmanProfile = profileData?.user_type === 'craftsman' || 
                             (profileData && 'trade_category' in profileData);
                            
  // Check if this is a customer profile
  const isCustomerProfile = profileData?.user_type === 'customer';
  
  // Enhanced debug log to help troubleshoot
  useEffect(() => {
    console.log("ProfileCalendar page rendering:", {
      loading,
      profileFound: !!profileData,
      isCurrentUser,
      profileType: profileData?.user_type,
      isCraftsmanProfile,
      isCustomerProfile,
      hasTrade: profileData && 'trade_category' in profileData,
      userType,
      userId: user?.id,
      profileId: profileData?.id
    });
  }, [loading, profileData, isCurrentUser, userType, user, isCraftsmanProfile, isCustomerProfile]);
  
  // If user is logged in as craftsman but doesn't have a profile, create one
  useEffect(() => {
    if (isCurrentUser && profileNotFound && userType === 'craftsman') {
      console.log("Craftsman profile not found, will try to create default profile");
      setTimeout(() => {
        createDefaultProfileIfNeeded?.()
          .then(() => toast.success("Profil remeselníka bol vytvorený"))
          .catch(err => {
            console.error("Failed to create craftsman profile:", err);
            toast.error("Nepodarilo sa vytvoriť profil remeselníka");
          });
      }, 500);
    }
  }, [isCurrentUser, profileNotFound, userType, createDefaultProfileIfNeeded]);

  // Redirect customer profiles to reviews page
  useEffect(() => {
    if (isCustomerProfile && !loading && !authLoading) {
      console.log("Customer profile detected, redirecting to reviews");
      const profileIdParam = profileData?.id !== user?.id ? `/${profileData?.id}` : '';
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
          <p>Presmerovanie na stránku hodnotení...</p>
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
          error={error || "Profil nebol nájdený alebo nemáte k nemu prístup."}
        />
      </Layout>
    );
  }

  // Check if user is attempting to send a booking request but not logged in
  const showLoginPrompt = !user && !isCurrentUser && isCraftsmanProfile;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProfileNavigation activeTab="calendar" userType={profileData?.user_type} />
          
          <div className="mt-8 flex justify-center">
            {/* Calendar section - centered for all users */}
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4 text-center">Kalendár dostupnosti</h2>
              <ProfileCalendar />
              
              {/* Login prompt for non-logged in users */}
              {showLoginPrompt && (
                <div className="bg-white shadow rounded-lg p-6 mt-6 text-center">
                  <h3 className="text-xl font-semibold mb-4">Pre rezerváciu termínu sa musíte prihlásiť</h3>
                  <p className="text-gray-600 mb-6">
                    Ak chcete kontaktovať tohto remeselníka a rezervovať si termín, 
                    musíte byť prihlásený ako zákazník.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/login')}>Prihlásiť sa</Button>
                    <Button variant="outline" onClick={() => navigate('/register')}>Registrovať sa</Button>
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
