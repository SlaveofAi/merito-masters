
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

export const useProfileImages = (
  profileData: ProfileData | null,
  userType: 'customer' | 'craftsman' | null
) => {
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetchPortfolioImages = async (userId: string) => {
    try {
      // Only fetch portfolio images for craftsmen
      if (userType !== 'craftsman') {
        console.log("Skipping portfolio images fetch for non-craftsman user");
        return;
      }

      // Ensure we have a valid userId
      if (!userId || userId === ":id") {
        console.log("Invalid userId for fetching portfolio images:", userId);
        return;
      }
      
      console.log("Fetching portfolio images for craftsman:", userId);
      
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching portfolio images:", error);
        return;
      }

      console.log("Portfolio images fetched:", data?.length || 0);
      setPortfolioImages(data || []);
    } catch (error) {
      console.error("Error in fetchPortfolioImages:", error);
    }
  };

  useEffect(() => {
    if (profileData) {
      console.log("useProfileImages: Processing profile data:", profileData);
      console.log("Current user type:", userType);
      
      // Set profile image URL with cache-busting parameter
      if (profileData.profile_image_url) {
        const imageUrl = profileData.profile_image_url;
        // Add cache buster if not already present
        const cacheBuster = `t=${lastRefresh}`;
        const url = imageUrl.includes('?') 
          ? `${imageUrl.split('?')[0]}?${cacheBuster}` 
          : `${imageUrl}?${cacheBuster}`;
        
        console.log("Setting profile image URL:", url);
        setProfileImageUrl(url);
      } else {
        console.log("No profile image URL found in profile data");
        setProfileImageUrl(null);
      }
      
      // Only fetch portfolio images for craftsmen
      if ((userType === 'craftsman' || profileData.user_type === 'craftsman') && profileData.id) {
        fetchPortfolioImages(profileData.id);
      }
    }
  }, [profileData, userType, lastRefresh]);

  const refreshProfileImage = () => {
    console.log("Manually refreshing profile image");
    // Update the lastRefresh timestamp to force the useEffect to run again
    setLastRefresh(Date.now());
    
    if (profileData && profileData.profile_image_url) {
      const imageUrl = profileData.profile_image_url;
      // Split by ? to handle URLs that already have parameters
      const baseUrl = imageUrl.split('?')[0];
      const url = `${baseUrl}?t=${Date.now()}`;
      console.log("Refreshed profile image URL:", url);
      setProfileImageUrl(url);
    }
  };

  return {
    portfolioImages,
    profileImageUrl,
    setProfileImageUrl,
    fetchPortfolioImages,
    refreshProfileImage
  };
};
