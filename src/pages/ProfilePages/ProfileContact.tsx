
import React from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ContactTab from "@/components/profile/ContactTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProfileContactContent: React.FC = () => {
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded
  } = useProfile();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  // Check if user is attempting to send a booking request but not logged in
  const isCraftsmanProfile = profileData && 'trade_category' in profileData;
  const showLoginPrompt = !user && !isCurrentUser && isCraftsmanProfile;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProfileNavigation activeTab="contact" userType={profileData.user_type} />
          
          <div className="mt-8">
            {showLoginPrompt ? (
              <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto text-center">
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
            ) : (
              <ContactTab />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrapper component that provides the ProfileProvider context
const ProfileContact: React.FC = () => {
  return (
    <ProfileProvider>
      <ProfileContactContent />
    </ProfileProvider>
  );
};

export default ProfileContact;
