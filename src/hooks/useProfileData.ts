import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useProfileData = (id?: string) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userType, setUserType] = useState<'customer' | 'craftsman' | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch profile data
  const fetchProfileData = async () => {
    setLoading(true);
    setProfileNotFound(false);

    try {
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id || user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfileNotFound(true);
      }

      if (data) {
        setProfileData(data);
        setProfileImageUrl(data.profile_image_url || null);
      } else {
        setProfileNotFound(true);
      }
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
      setProfileNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch portfolio images
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

  // Fetch reviews - new function
  const fetchReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in fetchReviews:", error);
      return [];
    }
  };

  // Use React Query to handle reviews fetching
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ['reviews', id || user?.id],
    queryFn: () => fetchReviews(id || user?.id || ''),
    enabled: !!id || !!user?.id,
  });

  useEffect(() => {
    if (user && id) {
      setIsCurrentUser(user.id === id);
    } else if (user && !id) {
      setIsCurrentUser(true);
    } else {
      setIsCurrentUser(false);
    }
  }, [user, id]);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user && !id) return;

      try {
        const userId = id || user?.id;
        const { data, error } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error("Error fetching user type:", error);
          return;
        }

        setUserType(data?.user_type || null);
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };

    fetchUserType();
  }, [user, id]);

  useEffect(() => {
    if (userType) {
      fetchProfileData();
    }
  }, [userType, user, id]);

  useEffect(() => {
    if (profileData && userType === 'craftsman') {
      fetchPortfolioImages(profileData.id);
    }
  }, [profileData, userType]);

  return {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    portfolioImages,
    profileImageUrl,
    reviews,
    isLoadingReviews,
    refetchReviews,
    setProfileData,
    setProfileImageUrl,
    fetchPortfolioImages
  };
};
