
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import ContactTab from "./ContactTab";
import ReviewsTab from "./ReviewsTab";
import PortfolioTab from "./PortfolioTab";
import CustomerReviewsTab from "./CustomerReviewsTab";
import MyJobRequests from "./MyJobRequests";
import { User, Star, Briefcase, MessageSquare, Phone } from "lucide-react";

interface ProfileTabsProps {
  profileId: string;
  isCurrentUser: boolean;
  userType: 'customer' | 'craftsman' | null;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  profileId, 
  isCurrentUser, 
  userType 
}) => {
  const { user } = useAuth();

  if (userType === 'craftsman') {
    return (
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfólio
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Hodnotenia
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Kontakt
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio">
          <PortfolioTab profileId={profileId} isCurrentUser={isCurrentUser} />
        </TabsContent>
        
        <TabsContent value="reviews">
          <ReviewsTab profileId={profileId} isCurrentUser={isCurrentUser} />
        </TabsContent>
        
        <TabsContent value="contact">
          <ContactTab profileId={profileId} isCurrentUser={isCurrentUser} />
        </TabsContent>
      </Tabs>
    );
  }

  if (userType === 'customer') {
    return (
      <Tabs defaultValue={isCurrentUser ? "requests" : "reviews"} className="w-full">
        <TabsList className={`grid w-full ${isCurrentUser ? 'grid-cols-3' : 'grid-cols-2'}`}>
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
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Kontakt
          </TabsTrigger>
        </TabsList>
        
        {isCurrentUser && (
          <TabsContent value="requests">
            <MyJobRequests />
          </TabsContent>
        )}
        
        <TabsContent value="reviews">
          <CustomerReviewsTab profileId={profileId} isCurrentUser={isCurrentUser} />
        </TabsContent>
        
        <TabsContent value="contact">
          <ContactTab profileId={profileId} isCurrentUser={isCurrentUser} />
        </TabsContent>
      </Tabs>
    );
  }

  return null;
};

export default ProfileTabs;
