
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
      // Set profile image URL with cache-busting parameter
      if ('profile_image_url' in profileData && profileData.profile_image_url) {
        const imageUrl = profileData.profile_image_url;
        // Add cache buster if not already present
        const url = imageUrl.includes('?') ? imageUrl : `${imageUrl}?t=${Date.now()}`;
        setProfileImageUrl(url);
      } else {
        setProfileImageUrl(null);
      }
      
      if (userType === 'craftsman') {
        fetchPortfolioImages(profileData.id);
      }
    }
  }, [profileData, userType]);

  return {
    portfolioImages,
    profileImageUrl,
    setProfileImageUrl,
    fetchPortfolioImages
  };
};
