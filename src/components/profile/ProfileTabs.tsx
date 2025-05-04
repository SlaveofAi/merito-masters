
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortfolioTab from "./PortfolioTab";
import ReviewsTab from "./ReviewsTab";
import ProfileCalendar from "./ProfileCalendar";
import CustomerReviewsTab from "./CustomerReviewsTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";

interface ProfileTabsProps {
  userType?: 'customer' | 'craftsman' | null;
  initialTab?: string;
  isViewingOtherProfile?: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  userType, 
  initialTab,
  isViewingOtherProfile = false
}) => {
  console.log("Rendering ProfileTabs with:", {
    userType, 
    initialTab,
    isViewingOtherProfile
  });
  
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sync tab state with URL
  const syncUrlWithTab = (tab: string) => {
    // If viewing another profile, preserve the ID in the URL
    if (location.pathname.includes('/profile/') && location.pathname !== `/profile/${tab}`) {
      navigate(`/profile/${tab}`, { replace: true });
    }
  };
  
  // Ensure customer users always see reviews tab ONLY for their own profile
  useEffect(() => {
    if (userType === 'customer' && !isViewingOtherProfile && initialTab !== 'reviews') {
      syncUrlWithTab('reviews');
    }
  }, [userType, initialTab, isViewingOtherProfile]);
  
  // Show customer tabs only when viewing own profile as a customer
  if (userType === 'customer' && !isViewingOtherProfile) {
    return (
      <Tabs defaultValue="reviews" className="w-full" onValueChange={syncUrlWithTab}>
        <TabsList className={`grid w-full ${isMobile ? 'max-w-full' : 'max-w-md mx-auto'} md:grid-cols-1 mb-6 md:mb-8`}>
          <TabsTrigger value="reviews" className="text-sm md:text-base pointer-events-auto">Hodnotenia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="animate-fade-in">
          <CustomerReviewsTab />
        </TabsContent>
      </Tabs>
    );
  }
  
  // When viewing a customer profile that is not your own, or a craftsman profile
  return (
    <Tabs 
      defaultValue={initialTab || "portfolio"} 
      className="w-full pointer-events-auto"
      onValueChange={syncUrlWithTab}
    >
      <TabsList className={`grid w-full ${isMobile ? 'max-w-full grid-cols-3 text-xs gap-1' : 'max-w-md mx-auto md:grid-cols-3'} mb-4 md:mb-8`}>
        <TabsTrigger value="portfolio" className="text-xs md:text-base pointer-events-auto">Portfólio</TabsTrigger>
        <TabsTrigger value="reviews" className="text-xs md:text-base pointer-events-auto">Hodnotenia</TabsTrigger>
        {/* Only show calendar for own profile */}
        {!isViewingOtherProfile && (
          <TabsTrigger value="calendar" className="text-xs md:text-base pointer-events-auto">Kalendár</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="portfolio" className="animate-fade-in">
        <PortfolioTab />
      </TabsContent>
      
      <TabsContent value="reviews" className="animate-fade-in">
        <ReviewsTab />
      </TabsContent>
      
      {!isViewingOtherProfile && (
        <TabsContent value="calendar" className="animate-fade-in pointer-events-auto">
          <ProfileCalendar />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProfileTabs;
