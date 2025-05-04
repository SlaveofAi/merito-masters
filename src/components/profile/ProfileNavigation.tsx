
import React from "react";
import { Link, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";

type TabType = 'portfolio' | 'reviews' | 'calendar';

interface ProfileNavigationProps {
  activeTab: TabType;
  userType?: string;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, userType }) => {
  const { id } = useParams<{ id?: string }>();
  const { isCurrentUser } = useProfile();
  const { t } = useLanguage();
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
    
    // Reviews tab is shown for all user types
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
              {t('portfolio')}
            </Button>
          </Link>
        )}
        
        <Link to={getTabUrl('reviews')}>
          <Button 
            variant={activeTab === 'reviews' ? 'default' : 'ghost'}
            className="rounded-none rounded-t-lg h-12"
          >
            {t('reviews')}
          </Button>
        </Link>
        
        {showTab('calendar') && (
          <Link to={getTabUrl('calendar')}>
            <Button 
              variant={activeTab === 'calendar' ? 'default' : 'ghost'}
              className="rounded-none rounded-t-lg h-12"
            >
              {t('calendar')}
            </Button>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default ProfileNavigation;

