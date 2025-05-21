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
import { MessageSquare, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  // Check for topped status if query param is present
  useEffect(() => {
    // Only check for topped=success parameter
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('topped') === 'success' && isCurrentUser && profileData) {
      // Add a small delay to simulate processing
      const timer = setTimeout(() => {
        // Simulate the successful payment toast
        toast.success("Vaša platba bola úspešne spracovaná", {
          description: "Váš profil je teraz zvýraznený na vrchole výsledkov vyhľadávania"
        });

        // Update local storage to prevent showing the message again on refresh
        localStorage.setItem('topped_payment_processed', 'true');

        // Refresh profile data
        if (fetchProfileData) {
          fetchProfileData();
        }

        // Remove the query parameter from the URL without page reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [profileData, isCurrentUser, fetchProfileData]);

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
        if (createDefaultProfileIfNeeded) {
          createDefaultProfileIfNeeded().catch(err => {
            console.error("Error creating profile:", err);
            toast.error("Nastala chyba pri vytváraní profilu", {
              description: err.message || "Neočakávaná chyba"
            });
          });
        }
      }, 500);
    }
  }, [isCurrentUser, profileNotFound, createDefaultProfileIfNeeded]);

  // Handler for the send message button
  const handleSendMessage = async () => {
    if (!profileData || !profileData.id || !user) {
      console.error("Missing data for sending message:", { profileData, user });
      toast.error("Nie je možné poslať správu. Chýbajú potrebné údaje.");
      return;
    }
    
    try {
      console.log("Sending message to craftsman:", profileData.id);
      
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("craftsman_id", profileData.id)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking for conversation:", fetchError);
        toast.error("Nastala chyba pri kontrole konverzácie");
        return;
      }
      
      let conversationId;
      
      if (existingConversation) {
        // Use existing conversation
        conversationId = existingConversation.id;
        console.log("Found existing conversation:", conversationId);
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("chat_conversations")
          .insert({
            customer_id: user.id,
            craftsman_id: profileData.id
          })
          .select();
          
        if (createError) {
          console.error("Error creating conversation:", createError);
          toast.error("Nepodarilo sa vytvoriť konverzáciu");
          return;
        }
        
        conversationId = newConversation?.[0]?.id;
        console.log("Created new conversation:", conversationId);
      }
      
      if (conversationId) {
        // Navigate to messages with the conversation context
        navigate("/messages", { 
          state: { 
            from: "profile",
            conversationId,
            contactId: profileData.id 
          } 
        });
        toast.success("Presmerované do správ");
      }
    } catch (err) {
      console.error("Error navigating to chat:", err);
      toast.error("Nastala chyba pri presmerovaní do správ");
    }
  };
  
  // Fixed safe wrapper for handleProfileImageUpload to ensure it always returns a Promise
  const safeHandleProfileImageUpload = (file: File): Promise<void> => {
    if (!handleProfileImageUpload) {
      return Promise.resolve();
    }
    
    try {
      const result = handleProfileImageUpload(file);
      // Handle both Promise and non-Promise returns safely
      return Promise.resolve(result);
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

  const isCraftsmanProfile = profileData?.user_type === 'craftsman' || 'trade_category' in (profileData || {});
  const viewingAsCraftsman = isCraftsmanProfile && !isCurrentUser;

  // Check if customer is viewing craftsman
  const isCustomerViewingCraftsman = !isCurrentUser && 
                                    authUserType === 'customer' && 
                                    isCraftsmanProfile;

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
                {/* Show Send Message button when customer is viewing craftsman profile */}
                {isCustomerViewingCraftsman && (
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

          <div className="bg-white rounded-lg shadow-sm p-6 mx-auto">
            <ProfileTabs userType={effectiveUserType} initialTab={initialTab} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
