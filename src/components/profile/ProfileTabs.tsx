
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import ProfileCalendar from "@/components/profile/ProfileCalendar";
import EditProfileForm from "@/components/EditProfileForm";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";

interface ProfileTabsProps {
  userType: string | null;
  initialTab?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userType, initialTab = "portfolio" }) => {
  const { isCurrentUser, isEditing, profileData, userType: profileUserType, handleProfileUpdate } = useProfile();
  const { userType: authUserType } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Add debug logging to understand the component state
  console.log("ProfileTabs rendering:", {
    isEditing,
    userType,
    profileUserType,
    authUserType,
    hasProfileData: !!profileData,
    activeTab,
    isCurrentUser
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
  // Check if viewing user is a customer looking at a craftsman profile
  const isCustomerViewingCraftsman = !isCurrentUser && 
                                    authUserType === 'customer' && 
                                    isCraftsman;

  return (
    <Tabs 
      defaultValue={activeTab} 
      className="w-full mx-auto" 
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full mb-8 max-w-md mx-auto" 
        style={{ 
          gridTemplateColumns: isCraftsman 
            ? (isCurrentUser ? "repeat(3, 1fr)" : "repeat(3, 1fr)") 
            : "repeat(1, 1fr)" 
        }}
      >
        {isCraftsman && (
          <>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
            <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
            {!isCurrentUser && <TabsTrigger value="contact">Kontakt</TabsTrigger>}
            {isCurrentUser && <TabsTrigger value="calendar">Kalendár</TabsTrigger>}
          </>
        )}
        
        {!isCraftsman && (
          <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
        )}
      </TabsList>

      {/* Center tab content by adding max-width and mx-auto */}
      <div className="max-w-3xl mx-auto">
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
      </div>
    </Tabs>
  );
};

export default ProfileTabs;
