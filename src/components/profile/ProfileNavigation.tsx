
import React from "react";
import { Link, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";

type TabType = 'portfolio' | 'reviews' | 'calendar' | 'requests';

interface ProfileNavigationProps {
  activeTab: TabType;
  userType?: string;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, userType }) => {
  const { id } = useParams<{ id?: string }>();
  const { isCurrentUser } = useProfile();
  const profileId = id || (isCurrentUser ? '' : '');
  
  // Generate URL for each tab
  const getTabUrl = (tab: TabType) => {
    if (!profileId) {
      return `/profile/${tab}`;
    }
    return `/profile/${profileId}/${tab}`;
  };
  
  // Determine if a tab should be shown based on user type
  const showTab = (tab: TabType) => {
    const isCustomer = userType && userType.toLowerCase() === 'customer';
    
    if (tab === 'portfolio') {
      // Only show portfolio tab for craftsmen
      return !isCustomer;
    }
    
    if (tab === 'calendar') {
      // Only show calendar tab for craftsmen
      return !isCustomer;
    }
    
    if (tab === 'requests') {
      // Only show requests tab for customers viewing their own profile
      return isCustomer && isCurrentUser;
    }
    
    // Reviews tab is shown for all user types
    return true;
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {showTab('requests') && (
          <Link to={getTabUrl('requests')}>
            <Button 
              variant={activeTab === 'requests' ? 'default' : 'ghost'} 
              className="rounded-none rounded-t-lg h-12"
            >
              Moje požiadavky
            </Button>
          </Link>
        )}

        {showTab('portfolio') && (
          <Link to={getTabUrl('portfolio')}>
            <Button 
              variant={activeTab === 'portfolio' ? 'default' : 'ghost'} 
              className="rounded-none rounded-t-lg h-12"
            >
              Portfólio
            </Button>
          </Link>
        )}
        
        <Link to={getTabUrl('reviews')}>
          <Button 
            variant={activeTab === 'reviews' ? 'default' : 'ghost'}
            className="rounded-none rounded-t-lg h-12"
          >
            Hodnotenia
          </Button>
        </Link>
        
        {showTab('calendar') && (
          <Link to={getTabUrl('calendar')}>
            <Button 
              variant={activeTab === 'calendar' ? 'default' : 'ghost'}
              className="rounded-none rounded-t-lg h-12"
            >
              Kalendár
            </Button>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default ProfileNavigation;
