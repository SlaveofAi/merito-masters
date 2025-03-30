
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
      if ('profile_image_url' in profileData) {
        setProfileImageUrl(profileData.profile_image_url || null);
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
