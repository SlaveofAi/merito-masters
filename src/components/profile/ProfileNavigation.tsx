
import React from "react";
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";

type TabType = 'portfolio' | 'reviews' | 'contact';

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
  
  // Determine if a tab should be shown based on user type - using safer check
  const showTab = (tab: TabType) => {
    if (tab === 'portfolio') {
      // Only hide portfolio tab if we're absolutely sure this is a customer
      const isCustomer = userType && userType.toLowerCase() === 'customer';
      return !isCustomer;
    }
    return true;
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
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
        
        <Link to={getTabUrl('contact')}>
          <Button 
            variant={activeTab === 'contact' ? 'default' : 'ghost'} 
            className="rounded-none rounded-t-lg h-12"
          >
            Kontakt
          </Button>
        </Link>
      </nav>
    </div>
  );
};

export default ProfileNavigation;
