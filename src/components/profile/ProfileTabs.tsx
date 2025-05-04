
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import ProfileCalendar from "@/components/profile/ProfileCalendar";
import EditProfileForm from "@/components/EditProfileForm";
import { useProfile } from "@/contexts/ProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileTabsProps {
  userType: string | null;
  initialTab?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userType, initialTab = "portfolio" }) => {
  const { isCurrentUser, isEditing, profileData, userType: profileUserType, handleProfileUpdate } = useProfile();
  const [activeTab, setActiveTab] = useState(initialTab);
  const { t } = useLanguage();
  
  // Add debug logging to understand the component state
  console.log("ProfileTabs rendering:", {
    isEditing,
    userType,
    profileUserType,
    hasProfileData: !!profileData,
    activeTab
  });
  
  // Don't display tabs when editing
  if (isEditing && profileData) {
    console.log("Rendering EditProfileForm in ProfileTabs");
    return (
      <div className="py-4">
        <EditProfileForm 
          profile={profileData} 
          userType={profileUserType} 
          onUpdate={handleProfileUpdate} 
        />
      </div>
    );
  }

  // Display the appropriate tabs based on the user type
  const isCraftsman = userType === 'craftsman';

  return (
    <Tabs 
      defaultValue={activeTab} 
      className="w-full" 
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full mb-8" 
        style={{ 
          gridTemplateColumns: isCraftsman 
            ? (isCurrentUser ? "repeat(3, 1fr)" : "repeat(3, 1fr)") 
            : "repeat(1, 1fr)" 
        }}
      >
        {isCraftsman && (
          <>
            <TabsTrigger value="portfolio">{t("portfolio")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("reviews")}</TabsTrigger>
            {!isCurrentUser && <TabsTrigger value="contact">{t("contact_us")}</TabsTrigger>}
            {isCurrentUser && <TabsTrigger value="calendar">{t("calendar")}</TabsTrigger>}
          </>
        )}
        
        {!isCraftsman && (
          <TabsTrigger value="reviews">{t("reviews")}</TabsTrigger>
        )}
      </TabsList>

      {/* Tab content */}
      {isCraftsman && (
        <>
          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>
          
          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>

          {!isCurrentUser && (
            <TabsContent value="contact">
              <ContactTab />
            </TabsContent>
          )}

          {isCurrentUser && (
            <TabsContent value="calendar">
              <ProfileCalendar />
            </TabsContent>
          )}
        </>
      )}
      
      {!isCraftsman && (
        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProfileTabs;
