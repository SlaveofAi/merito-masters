
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
    handleProfileImageUpload: uploadProfileImage,
    setIsEditing
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

  // Handler for the send message button with enhanced functionality
  const handleSendMessage = async () => {
    if (!profileData || !user) {
      toast.error("Pre poslanie správy musíte byť prihlásený");
      navigate('/login');
      return;
    }
    
    try {
      console.log("Handling send message click:", {
        userId: user.id,
        craftsmanId: profileData.id,
        userType: authUserType
      });

      // Determine customer and craftsman IDs based on user type
      const normalizedUserType = authUserType?.toLowerCase() || '';
      const customerId = normalizedUserType === 'customer' ? user.id : profileData.id;
      const craftsmanId = normalizedUserType === 'customer' ? profileData.id : user.id;
      
      // Check if conversation already exists
      const { data: existingConv, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('craftsman_id', craftsmanId)
        .maybeSingle();
        
      let conversationId;
      
      if (fetchError) {
        console.error("Error checking for existing conversation:", fetchError);
        toast.error("Nastala chyba pri kontrole existujúcej konverzácie");
        return;
      }
      
      if (existingConv) {
        console.log("Found existing conversation:", existingConv.id);
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: insertError } = await supabase
          .from('chat_conversations')
          .insert({
            customer_id: customerId,
            craftsman_id: craftsmanId
          })
          .select();
          
        if (insertError) {
          console.error("Error creating conversation:", insertError);
          toast.error("Nastala chyba pri vytváraní konverzácie");
          return;
        }
        
        if (newConv && newConv.length > 0) {
          conversationId = newConv[0].id;
          console.log("Created new conversation:", conversationId);
        } else {
          toast.error("Nepodarilo sa vytvoriť konverzáciu");
          return;
        }
      }
      
      // Navigate to messages with contact query param 
      navigate(`/messages?contact=${profileData.id}&conversation=${conversationId}`);
      
    } catch (error) {
      console.error("Error setting up conversation:", error);
      toast.error("Nastala chyba pri nastavovaní konverzácie");
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
                uploadProfileImage={(file) => uploadProfileImage(file)}
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
