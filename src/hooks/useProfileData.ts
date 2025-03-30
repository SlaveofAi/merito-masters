
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CraftsmanReview, ProfileData, CustomerProfile, CraftsmanProfile } from "@/types/profile";
import { toast } from "sonner";

export const useProfileData = (id?: string) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
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
      if (!userType) {
        setLoading(false);
        return;
      }
      
      const userId = id || user?.id;
      if (!userId) {
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      console.log(`Fetching ${userType} profile for user: ${userId}`);
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfileNotFound(true);
      }

      if (data) {
        console.log("Profile data found:", data);
        setProfileData(data as ProfileData);
        // Set profile image URL if it exists on the data object
        if ('profile_image_url' in data) {
          setProfileImageUrl(data.profile_image_url || null);
        }
      } else {
        console.log("No profile data found for:", userId);
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
  const fetchReviews = async (userId: string): Promise<CraftsmanReview[]> => {
    try {
      // Using any type to work around TypeScript errors with the craftsman_reviews table
      const { data, error } = await supabase
        .from('craftsman_reviews' as any)
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      
      return (data || []) as CraftsmanReview[];
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
        console.log("Fetching user type for:", userId);
        const { data, error } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user type:", error);
          return;
        }

        console.log("User type data:", data);
        // Make sure to only set user type if it's one of the allowed values
        if (data?.user_type === 'customer' || data?.user_type === 'craftsman') {
          setUserType(data.user_type);
        } else {
          console.log("No valid user type found");
          setUserType(null);
        }
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

  const createDefaultProfileIfNeeded = async () => {
    if (!user || !userType || !isCurrentUser || profileData) return;
    
    try {
      console.log("Checking if we need to create a default profile");
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from(table)
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        return;
      }
      
      if (existingProfile) {
        console.log("Profile already exists, no need to create a default one");
        return;
      }
      
      console.log("Creating default profile for user:", user.id);
      
      // Get user's email and name from auth metadata
      const email = user.email || '';
      const name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';
      
      if (userType === 'craftsman') {
        // Create a default craftsman profile
        const { error: insertError } = await supabase
          .from('craftsman_profiles')
          .insert({
            id: user.id,
            name,
            email,
            location: 'Please update',
            trade_category: 'Please update',
            phone: null,
            description: null
          });
          
        if (insertError) {
          console.error("Error creating craftsman profile:", insertError);
          toast.error("Nastala chyba pri vytváraní profilu");
        } else {
          console.log("Default craftsman profile created successfully");
          toast.success("Profil bol vytvorený", { duration: 3000 });
          // Refresh profile data
          fetchProfileData();
        }
      } else {
        // Create a default customer profile
        const { error: insertError } = await supabase
          .from('customer_profiles')
          .insert({
            id: user.id,
            name,
            email,
            location: 'Please update',
            phone: null
          });
          
        if (insertError) {
          console.error("Error creating customer profile:", insertError);
          toast.error("Nastala chyba pri vytváraní profilu");
        } else {
          console.log("Default customer profile created successfully");
          toast.success("Profil bol vytvorený", { duration: 3000 });
          // Refresh profile data
          fetchProfileData();
        }
      }
    } catch (error) {
      console.error("Error in createDefaultProfileIfNeeded:", error);
      toast.error("Nastala nečakaná chyba");
    }
  };

  useEffect(() => {
    if (user && userType && isCurrentUser && profileNotFound) {
      createDefaultProfileIfNeeded();
    }
  }, [user, userType, isCurrentUser, profileNotFound]);

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
    fetchPortfolioImages,
    createDefaultProfileIfNeeded
  };
};
