import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import CustomerReviewsTab from "@/components/profile/CustomerReviewsTab";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
      initialTab
    });
  }, [loading, authUserType, profileUserType, profileData, isCurrentUser, profileNotFound, user, error, initialTab]);

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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-xl font-bold mb-4">Typ používateľa nie je nastavený</h1>
            <p className="mb-4">
              Váš typ používateľa (zákazník alebo remeselník) nie je nastavený. 
              Toto je potrebné pre správne fungovanie profilu.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-amber-600">
                Je možné, že registrácia nebola dokončená. Vyberte si typ účtu nižšie alebo sa odhláste a znova prihláste.
              </p>
              {user && (
                <div className="bg-gray-50 p-3 rounded text-left text-sm">
                  <p className="font-medium">Aktuálne informácie:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>ID používateľa: {user.id.substring(0, 8)}...</li>
                    <li>Email: {user.email}</li>
                    <li>Typ používateľa: <span className="text-red-500">Nenastavený</span></li>
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 mt-6">
                <p className="font-medium">Vyberte typ používateľa:</p>
                <Button 
                  onClick={() => updateUserType('craftsman')}
                  className="w-full"
                >
                  Som remeselník
                </Button>
                <Button 
                  onClick={() => updateUserType('customer')}
                  variant="outline"
                  className="w-full"
                >
                  Som zákazník
                </Button>
                <div className="text-sm text-muted-foreground mt-2">
                  Alebo
                </div>
                <Button 
                  onClick={() => navigate("/register")}
                  variant="secondary"
                  className="w-full"
                >
                  Prejsť na registráciu
                </Button>
              </div>
            </div>
          </div>
        </div>
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-xl font-bold mb-4">Chyba prístupu k profilu</h1>
            <p className="mb-4">
              Nemáte oprávnenie na zobrazenie tohto profilu. Toto môže byť spôsobené 
              nastaveniami Row Level Security (RLS) v databáze.
            </p>
            {isCurrentUser && (
              <p className="text-sm text-amber-600 mb-4">
                Hoci ste prihlásený ako vlastník profilu, RLS pravidlá môžu blokovať prístup.
                Skúste sa odhlásiť a znova prihlásiť.
              </p>
            )}
            {createDefaultProfileIfNeeded && isCurrentUser && (
              <Button 
                onClick={() => createDefaultProfileIfNeeded()}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Vytvoriť profil znova
              </Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  if (error && error.includes("database function names")) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-xl font-bold mb-4">Nastala chyba pripojenia k databáze</h1>
            <p className="mb-4">
              Nepodarilo sa spojiť s databázou. Skúste stránku obnoviť alebo to skúste znova neskôr.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Obnoviť stránku
            </Button>
          </div>
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
          error={error || "Profil nebol nájdený alebo nemáte k nemu prístup. Možno je potrebné skontrolovať nastavenia Row Level Security v databáze."}
        />
      </Layout>
    );
  }

  // Use a more reliable determination of user type, with explicit precedence
  // 1. Check profileData.user_type first (from the profile data)
  // 2. Then check profileUserType from context
  // 3. Then check authUserType from auth context
  // 4. Fall back to checking if profile has trade_category (for backward compatibility)
  const effectiveUserType = profileData.user_type || 
                           profileUserType || 
                           authUserType || 
                           ('trade_category' in profileData ? 'craftsman' : 'customer');
                           
  console.log("Using effective user type for display:", effectiveUserType);
  
  // If we're a customer profile, immediately redirect to reviews
  if (effectiveUserType === 'customer' && initialTab === 'portfolio') {
    console.log("Customer profile detected in portfolio view, redirecting to reviews");
    navigate("/profile/reviews", { replace: true });
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

const ProfileTabs: React.FC<{ userType?: 'customer' | 'craftsman' | null, initialTab?: string }> = ({ userType, initialTab }) => {
  console.log("Rendering ProfileTabs with userType:", userType, "initialTab:", initialTab);
  
  // Force customer tabs for customer user type
  if (userType === 'customer') {
    return (
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-1 mb-8">
          <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="animate-fade-in">
          <CustomerReviewsTab />
        </TabsContent>
      </Tabs>
    );
  }
  
  // Default tabs for craftsman profiles
  return (
    <Tabs defaultValue={initialTab || "portfolio"} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-3 mb-8">
        <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
        <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
        <TabsTrigger value="calendar">Kalendár</TabsTrigger>
      </TabsList>
      
      <TabsContent value="portfolio" className="animate-fade-in">
        <PortfolioTab />
      </TabsContent>
      
      <TabsContent value="reviews" className="animate-fade-in">
        <ReviewsTab />
      </TabsContent>
      
      <TabsContent value="calendar" className="animate-fade-in">
        <ContactTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfilePage;
