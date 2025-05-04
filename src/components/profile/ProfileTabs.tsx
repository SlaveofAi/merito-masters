
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
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userType, initialTab }) => {
  console.log("Rendering ProfileTabs with userType:", userType, "initialTab:", initialTab);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sync tab state with URL
  const syncUrlWithTab = (tab: string) => {
    if (location.pathname !== `/profile/${tab}`) {
      navigate(`/profile/${tab}`, { replace: true });
    }
  };
  
  // Ensure customer users always see reviews tab
  useEffect(() => {
    if (userType === 'customer' && initialTab !== 'reviews') {
      syncUrlWithTab('reviews');
    }
  }, [userType, initialTab]);
  
  // Force customer tabs for customer user type
  if (userType === 'customer') {
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
  
  // Default tabs for craftsman profiles
  return (
    <Tabs 
      defaultValue={initialTab || "portfolio"} 
      className="w-full pointer-events-auto"
      onValueChange={syncUrlWithTab}
    >
      <TabsList className={`grid w-full ${isMobile ? 'max-w-full grid-cols-3 text-xs gap-1' : 'max-w-md mx-auto md:grid-cols-3'} mb-4 md:mb-8`}>
        <TabsTrigger value="portfolio" className="text-xs md:text-base pointer-events-auto">Portfólio</TabsTrigger>
        <TabsTrigger value="reviews" className="text-xs md:text-base pointer-events-auto">Hodnotenia</TabsTrigger>
        <TabsTrigger value="calendar" className="text-xs md:text-base pointer-events-auto">Kalendár</TabsTrigger>
      </TabsList>
      
      <TabsContent value="portfolio" className="animate-fade-in">
        <PortfolioTab />
      </TabsContent>
      
      <TabsContent value="reviews" className="animate-fade-in">
        <ReviewsTab />
      </TabsContent>
      
      <TabsContent value="calendar" className="animate-fade-in pointer-events-auto">
        <ProfileCalendar />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
