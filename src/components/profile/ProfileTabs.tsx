
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortfolioTab from "./PortfolioTab";
import ReviewsTab from "./ReviewsTab";
import ProfileCalendar from "./ProfileCalendar";
import CustomerReviewsTab from "./CustomerReviewsTab";

interface ProfileTabsProps {
  userType?: 'customer' | 'craftsman' | null;
  initialTab?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userType, initialTab }) => {
  console.log("Rendering ProfileTabs with userType:", userType, "initialTab:", initialTab);
  
  // Force customer tabs for customer user type
  if (userType === 'customer') {
    return (
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-1 mb-8">
          <TabsTrigger value="reviews" className="pointer-events-auto">Hodnotenia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="animate-fade-in">
          <CustomerReviewsTab />
        </TabsContent>
      </Tabs>
    );
  }
  
  // Default tabs for craftsman profiles
  return (
    <Tabs defaultValue={initialTab || "portfolio"} className="w-full pointer-events-auto">
      <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-3 mb-8 pointer-events-auto">
        <TabsTrigger value="portfolio" className="pointer-events-auto">Portfólio</TabsTrigger>
        <TabsTrigger value="reviews" className="pointer-events-auto">Hodnotenia</TabsTrigger>
        <TabsTrigger value="calendar" className="pointer-events-auto">Kalendár</TabsTrigger>
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
