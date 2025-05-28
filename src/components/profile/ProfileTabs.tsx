
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import ReviewsTab from "./ReviewsTab";
import PortfolioTab from "./PortfolioTab";
import CustomerReviewsTab from "./CustomerReviewsTab";
import MyJobRequests from "./MyJobRequests";
import { User, Star, Briefcase } from "lucide-react";

interface ProfileTabsProps {
  userType: 'customer' | 'craftsman' | null;
  initialTab?: string;
  isCurrentUser?: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  userType,
  initialTab = "portfolio",
  isCurrentUser = false
}) => {
  const { user } = useAuth();

  if (userType === 'craftsman') {
    return (
      <Tabs defaultValue={initialTab === "calendar" ? "portfolio" : initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfólio
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Hodnotenia
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio">
          <PortfolioTab />
        </TabsContent>
        
        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
      </Tabs>
    );
  }

  if (userType === 'customer') {
    // For customers viewing their own profile, show requests and reviews tabs
    // For customers viewing others' profiles, only show reviews
    const defaultTab = isCurrentUser ? (initialTab || "requests") : "reviews";
    const gridCols = isCurrentUser ? 'grid-cols-2' : 'grid-cols-1';
    
    return (
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full ${gridCols}`}>
          {isCurrentUser && (
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Moje požiadavky
            </TabsTrigger>
          )}
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Hodnotenia
          </TabsTrigger>
        </TabsList>
        
        {isCurrentUser && (
          <TabsContent value="requests">
            <MyJobRequests />
          </TabsContent>
        )}
        
        <TabsContent value="reviews">
          <CustomerReviewsTab />
        </TabsContent>
      </Tabs>
    );
  }

  return null;
};

export default ProfileTabs;
