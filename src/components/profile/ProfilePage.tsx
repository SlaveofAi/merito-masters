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
import EditProfileForm from "@/components/EditProfileForm";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Pencil, LogOut, MapPin, Phone, Mail, Calendar, Star, Award, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const { user, userType: authUserType, updateUserType, signOut } = useAuth();
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
    setIsEditing,
    isEditing,
    handleProfileUpdate
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
      initialTab,
      isEditing
    });
  }, [loading, authUserType, profileUserType, profileData, isCurrentUser, profileNotFound, user, error, initialTab, isEditing]);

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

  // Handler for edit profile button
  const handleEditProfile = () => {
    console.log("Edit profile button clicked");
    if (setIsEditing) {
      setIsEditing(true);
    }
  };

  // Handler for logout button
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Úspešne ste sa odhlásili");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Nastala chyba pri odhlásení");
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

  // If editing, show the edit form
  if (isEditing && profileData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader 
              profileData={profileData} 
              isCurrentUser={isCurrentUser} 
              userType={profileUserType}
              profileImageUrl={profileImageUrl}
              uploadProfileImage={safeHandleProfileImageUpload}
              fetchProfileData={fetchProfileData}
            />
            
            <div className="bg-white rounded-lg shadow-sm p-6 mx-auto">
              <EditProfileForm 
                profile={profileData} 
                userType={effectiveUserType} 
                onUpdate={handleProfileUpdate} 
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
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
                
                <div className="flex items-center gap-2 ml-auto">
                  {isCurrentUser && (
                    <>
                      <Button 
                        onClick={handleEditProfile}
                        variant="outline" 
                        className="flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" /> 
                        Upraviť profil
                      </Button>
                      
                      <Button 
                        onClick={handleLogout}
                        variant="destructive" 
                        className="flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> 
                        Odhlásiť sa
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced Profile Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Contact Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Kontaktné údaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileData.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                    {profileData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Člen od {new Date(profileData.created_at || '').toLocaleDateString('sk-SK')}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card for Craftsman */}
                {isCraftsmanProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Štatistiky
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hodnotenie</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">4.8</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dokončené projekty</span>
                        <span className="font-semibold">25</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Spokojní zákazníci</span>
                        <span className="font-semibold">23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Doba odpovede</span>
                        <span className="font-semibold">2 hod</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills/Services Card for Craftsman */}
                {isCraftsmanProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Služby a špecializácia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {profileData.trade_category && (
                          <div>
                            <span className="text-sm text-gray-600">Kategória:</span>
                            <Badge variant="secondary" className="ml-2">
                              {profileData.trade_category}
                            </Badge>
                          </div>
                        )}
                        {profileData.specialization && (
                          <div>
                            <span className="text-sm text-gray-600">Špecializácia:</span>
                            <p className="text-sm mt-1">{profileData.specialization}</p>
                          </div>
                        )}
                        {profileData.experience_years && (
                          <div>
                            <span className="text-sm text-gray-600">Skúsenosti:</span>
                            <span className="ml-2 font-semibold">{profileData.experience_years} rokov</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Customer Stats Card */}
                {!isCraftsmanProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Aktivita
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Celkové požiadavky</span>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dokončené projekty</span>
                        <span className="font-semibold">5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hodnotenia dané</span>
                        <span className="font-semibold">4</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* About Section */}
              {profileData.bio && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>O mne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Verification Badges */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Overenia a odznaky</CardTitle>
                  <CardDescription>
                    Tieto odznaky potvrdzujú kvalitu a spoľahlivosť profilu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Overený profil
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Overený email
                    </Badge>
                    {profileData.phone && (
                      <Badge variant="secondary" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Overené telefónne číslo
                      </Badge>
                    )}
                    {isCraftsmanProfile && (
                      <Badge variant="secondary" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Profesionálny remeselník
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Main Profile Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mx-auto">
            <ProfileTabs 
              userType={effectiveUserType} 
              initialTab={initialTab} 
              isCurrentUser={isCurrentUser}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
