
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

export const useProfileImages = (
  profileData: ProfileData | null,
  userType: 'customer' | 'craftsman' | null
) => {
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const fetchPortfolioImages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching portfolio images:", error);
        return;
      }

      setPortfolioImages(data || []);
    } catch (error) {
      console.error("Error in fetchPortfolioImages:", error);
    }
  };

  useEffect(() => {
    if (profileData) {
      console.log("useProfileImages: Setting profile image from data:", profileData);
      console.log("Current user type:", userType);
      
      // Set profile image URL with cache-busting parameter
      if (profileData.profile_image_url) {
        const imageUrl = profileData.profile_image_url;
        // Add cache buster if not already present
        const url = imageUrl.includes('?') ? imageUrl : `${imageUrl}?t=${Date.now()}`;
        console.log("Setting profile image URL:", url);
        setProfileImageUrl(url);
      } else {
        console.log("No profile image URL found in profile data");
        setProfileImageUrl(null);
      }
      
      // Only fetch portfolio images for craftsmen
      if (userType === 'craftsman') {
        fetchPortfolioImages(profileData.id);
      }
    }
  }, [profileData, userType]);

  const refreshProfileImage = () => {
    console.log("Manually refreshing profile image");
    if (profileData && profileData.profile_image_url) {
      const imageUrl = profileData.profile_image_url;
      const url = `${imageUrl.split('?')[0]}?t=${Date.now()}`;
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
