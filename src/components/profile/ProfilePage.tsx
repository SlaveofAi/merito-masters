import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Pencil, MessageSquare } from "lucide-react";

const ProfilePage: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const { user, userType: authUserType, updateUserType } = useAuth();
  const navigate = useNavigate();
  const {
    loading,
    profileData,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded,
    userType: profileUserType,
    profileImageUrl,
    fetchProfileData,
    handleProfileImageUpload,
    setIsEditing
  } = useProfile();

  // Check for topped status simulation
  useEffect(() => {
    // Simulate successful topped payment if query parameter is present
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('topped') === 'success' && isCurrentUser && profileData) {
      // Add a small delay to simulate processing
      const timer = setTimeout(() => {
        // Set the profile data as topped
        const toppedUntil = new Date();
        toppedUntil.setDate(toppedUntil.getDate() + 7); // 7 days from now

        // Simulate the successful payment toast
        toast.success("Vaša platba bola úspešne spracovaná", {
          description: "Váš profil je teraz zvýraznený na vrchole výsledkov vyhľadávania"
        });

        // Update local storage to prevent showing the message again on refresh
        localStorage.setItem('topped_payment_processed', 'true');

        // Modify profile data to show topped status
        if (fetchProfileData) {
          fetchProfileData();
        }

        // Remove the query parameter from the URL without page reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [profileData, isCurrentUser, fetchProfileData]);

  // Auto-simulate topped payment for testing
  useEffect(() => {
    if (isCurrentUser && profileData && profileData.user_type === 'craftsman' && !profileData.is_topped) {
      const hasProcessed = localStorage.getItem('topped_payment_processed');
      if (!hasProcessed) {
        // Simulate the topped payment for testing
        const timer = setTimeout(() => {
          // Update URL with topped=success parameter to trigger the simulation
          const url = new URL(window.location.href);
          url.searchParams.set('topped', 'success');
          window.history.pushState({}, '', url.toString());
          
          // Set the topped_session_id in sessionStorage to simulate a completed payment
          sessionStorage.setItem('topped_session_id', 'sim_' + Date.now());
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [profileData, isCurrentUser]);

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
      initialTab
    });
  }, [loading, authUserType, profileUserType, profileData, isCurrentUser, profileNotFound, user, error, initialTab]);

  // Use a more reliable determination of user type, with explicit precedence
  const getEffectiveUserType = () => {
    return (profileData?.user_type || profileUserType || authUserType || 
          ('trade_category' in (profileData || {}) ? 'craftsman' : 'customer'));
  };

  // Super early check - redirect immediately if this is likely a customer viewing portfolio
  useEffect(() => {
    // Only handle own profile routing here
    if (!isCurrentUser) return;
    
    const effectiveUserType = getEffectiveUserType();
    
    // Ensure we're using strict equality for type safety
    // Immediate redirect for customers viewing portfolio tab
    if ((effectiveUserType === 'customer' || authUserType === 'customer') && 
        initialTab === 'portfolio') {
      console.log("Customer viewing portfolio tab, immediate redirect in ProfilePage");
      navigate("/profile/reviews", { replace: true });
    }
  }, [initialTab, isCurrentUser, authUserType, navigate]);

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

  // Handler for the send message button
  const handleSendMessage = () => {
    if (profileData && profileData.id) {
      navigate(`/messages?contact=${profileData.id}`);
    }
  };
  
  // Safe wrapper for handleProfileImageUpload to ensure it returns a Promise
  const safeHandleProfileImageUpload = (file: File): Promise<void> => {
    try {
      // Make sure handleProfileImageUpload returns a Promise
      if (handleProfileImageUpload) {
        const result = handleProfileImageUpload(file);
        
        // If it's already a Promise, return it
        if (result && typeof result.then === 'function') {
          return result;
        }
      }
      
      // Otherwise, return a resolved Promise
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
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
          error={error || "Profil nebol nájdený alebo nemáte k nemu prístup. Možno je potrebné skontrolovať nastavenia Row Level Security v databáze."}
        />
      </Layout>
    );
  }

  // Extra safety check - if we still somehow got to this point as a customer in portfolio tab, redirect
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

  const isCraftsmanProfile = profileData.user_type === 'craftsman' || 'trade_category' in profileData;
  const viewingAsCraftsman = isCraftsmanProfile && !isCurrentUser;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {profileData && (
            <>
              <ProfileHeader 
                profileData={profileData} 
                isCurrentUser={isCurrentUser} 
                userType={profileUserType}
                profileImageUrl={profileImageUrl}
                uploadProfileImage={safeHandleProfileImageUpload}
                fetchProfileData={fetchProfileData}
              />
              
              <div className="flex justify-between mb-6">
                {/* Show Send Message button when viewing someone else's craftsman profile */}
                {viewingAsCraftsman && (
                  <Button 
                    onClick={handleSendMessage}
                    variant="default" 
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> 
                    Poslať správu
                  </Button>
                )}
                
                {isCurrentUser && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline" 
                    className="flex items-center gap-2 ml-auto"
                  >
                    <Pencil className="w-4 h-4" /> 
                    Upraviť profil
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <ProfileTabs userType={effectiveUserType} initialTab={initialTab} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
