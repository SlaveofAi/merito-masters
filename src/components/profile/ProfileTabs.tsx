
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import ProfileCalendar from "@/components/profile/ProfileCalendar";
import EditProfileForm from "@/components/EditProfileForm";
import { useProfile } from "@/contexts/ProfileContext";

interface ProfileTabsProps {
  userType: string | null;
  initialTab?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userType, initialTab = "portfolio" }) => {
  const { isCurrentUser, isEditing, profileData, userType: profileUserType, handleProfileUpdate } = useProfile();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Don't display tabs when editing
  if (isEditing && profileData) {
    return (
      <div className="container px-4 mx-auto py-8">
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
      <TabsList className="grid w-full max-w-2xl mx-auto mb-8" 
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
