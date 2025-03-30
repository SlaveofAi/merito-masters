
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useProfile } from "@/contexts/ProfileContext";

const ProfilePage: React.FC = () => {
  const {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    error,
    createDefaultProfileIfNeeded
  } = useProfile();

  useEffect(() => {
    // If we're on the current user's profile and it doesn't exist, try to create it
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

  if (loading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  // Handle case where the profile not found might be due to RLS policies
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
              <button 
                onClick={() => createDefaultProfileIfNeeded()}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Vytvoriť profil znova
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Handle the case where the user type is not set
  if (isCurrentUser && (!userType || userType === null)) {
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
                Skúste sa odhlásiť a znova prihlásiť. Ak problém pretrváva, 
                možno budete musieť registráciu vykonať znova.
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
              <button 
                onClick={() => window.location.href = "/register"}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors w-full"
              >
                Prejsť na registráciu
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle database connection errors
  if (error && error.includes("database function names")) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-xl font-bold mb-4">Nastala chyba pripojenia k databáze</h1>
            <p className="mb-4">
              Nepodarilo sa spojiť s databázou. Skúste stránku obnoviť alebo to skúste znova neskôr.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Obnoviť stránku
            </button>
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProfileTabs />
        </div>
      </div>
    </Layout>
  );
};

const ProfileTabs: React.FC = () => {
  return (
    <Tabs defaultValue="portfolio" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-3 mb-8">
        <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
        <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
        <TabsTrigger value="contact">Kontakt</TabsTrigger>
      </TabsList>
      
      <TabsContent value="portfolio" className="animate-fade-in">
        <PortfolioTab />
      </TabsContent>
      
      <TabsContent value="reviews" className="animate-fade-in">
        <ReviewsTab />
      </TabsContent>
      
      <TabsContent value="contact" className="animate-fade-in">
        <ContactTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfilePage;
