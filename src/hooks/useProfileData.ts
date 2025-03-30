
import { useState, useEffect, useCallback } from "react";
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

  const fetchReviews = async (userId: string): Promise<CraftsmanReview[]> => {
    try {
      console.log("Fetching reviews for craftsman:", userId);
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      
      if (!data || !Array.isArray(data)) {
        console.log("No reviews found for craftsman:", userId);
        return [];
      }
      
      // Explicitly map the data to ensure it matches the CraftsmanReview type
      return data.map(review => ({
        id: review.id,
        craftsman_id: review.craftsman_id,
        customer_id: review.customer_id,
        customer_name: review.customer_name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      })) as CraftsmanReview[];
      
    } catch (error) {
      console.error("Error in fetchReviews:", error);
      return [];
    }
  };

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

  const createDefaultProfileIfNeeded = useCallback(async () => {
    if (!user || !userType || !isCurrentUser) {
      throw new Error("Nemožno vytvoriť profil: používateľ nie je prihlásený alebo typ používateľa nie je nastavený");
    }
    
    try {
      console.log("Checking if we need to create a default profile");
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      
      const { data: existingProfile, error: checkError } = await supabase
        .from(table)
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        throw new Error(`Chyba pri kontrole existujúceho profilu: ${checkError.message}`);
      }
      
      if (existingProfile) {
        console.log("Profile already exists, no need to create a default one");
        fetchProfileData();
        return;
      }
      
      console.log("Creating default profile for user:", user.id);
      
      const email = user.email || '';
      const name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';
      
      if (userType === 'craftsman') {
        const { error: insertError } = await supabase
          .from('craftsman_profiles')
          .insert({
            id: user.id,
            name,
            email,
            location: 'Please update',
            trade_category: 'Please update',
            phone: null,
            description: null,
            profile_image_url: null
          });
          
        if (insertError) {
          console.error("Error creating craftsman profile:", insertError);
          throw new Error(`Chyba pri vytváraní profilu remeselníka: ${insertError.message}`);
        } else {
          console.log("Default craftsman profile created successfully");
          toast.success("Profil bol vytvorený", { duration: 3000 });
          await fetchProfileData();
        }
      } else {
        const { error: insertError } = await supabase
          .from('customer_profiles')
          .insert({
            id: user.id,
            name,
            email,
            location: 'Please update',
            phone: null,
            profile_image_url: null
          });
          
        if (insertError) {
          console.error("Error creating customer profile:", insertError);
          throw new Error(`Chyba pri vytváraní profilu zákazníka: ${insertError.message}`);
        } else {
          console.log("Default customer profile created successfully");
          toast.success("Profil bol vytvorený", { duration: 3000 });
          await fetchProfileData();
        }
      }
    } catch (error: any) {
      console.error("Error in createDefaultProfileIfNeeded:", error);
      toast.error("Nastala chyba pri vytváraní profilu", {
        description: error.message || "Neznáma chyba"
      });
      throw error;
    }
  }, [user, userType, isCurrentUser, fetchProfileData]);

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
