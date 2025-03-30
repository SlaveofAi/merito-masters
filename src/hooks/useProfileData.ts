
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProfileData } from "@/types/profile";
import { fetchPortfolioImages as fetchPortfolioImagesUtil, TABLES } from "@/utils/imageUpload";

export const useProfileData = (profileId: string | undefined) => {
  const { toast: uiToast } = useToast();
  const { user, userType: authUserType } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const fetchUserType = async (userId: string) => {
    try {
      if (authUserType && userId === user?.id) {
        console.log("Using user type from auth context:", authUserType);
        return authUserType;
      }

      const { data, error } = await supabase
        .from(TABLES.USER_TYPES)
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user type:', error);
        return null;
      }
      
      return data?.user_type || null;
    } catch (error) {
      console.error('Error in fetchUserType:', error);
      return null;
    }
  };

  const fetchPortfolioImages = async (userId: string) => {
    const images = await fetchPortfolioImagesUtil(userId);
    setPortfolioImages(images);
  };

  const fetchProfileData = async (userId: string, type: string) => {
    try {
      const table = type === 'craftsman' ? TABLES.CRAFTSMAN_PROFILES : TABLES.CUSTOMER_PROFILES;
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error(`Error fetching ${type} profile:`, error);
        
        if (userId === user?.id) {
          setProfileNotFound(true);
        } else {
          throw error;
        }
      }
      
      if (data) {
        setProfileData(data as ProfileData);
        
        if ('profile_image_url' in data) {
          setProfileImageUrl(data.profile_image_url);
        }
        
        if (type === 'craftsman') {
          fetchPortfolioImages(userId);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      toast.error("Nastala chyba pri načítaní profilu");
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        if (!user) {
          uiToast({
            title: "Nie ste prihlásený",
            description: "Pre zobrazenie profilu sa musíte prihlásiť",
            variant: "destructive",
          });
          return null;
        }

        const currentUserId = user.id;
        const userId = profileId || currentUserId;
        
        setIsCurrentUser(currentUserId === userId);
        
        const type = await fetchUserType(userId);
        setUserType(type);
        
        if (type) {
          await fetchProfileData(userId, type);
        } else if (isCurrentUser) {
          setProfileNotFound(true);
          uiToast({
            title: "Upozornenie",
            description: "Váš profil nie je úplný. Prosím, dokončite registráciu.",
            variant: "destructive",
          });
        } else {
          uiToast({
            title: "Chyba",
            description: "Nepodarilo sa načítať typ užívateľa",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in profile page:", error);
        uiToast({
          title: "Chyba",
          description: "Nastala chyba pri načítaní profilu",
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [profileId, user, uiToast, authUserType, isCurrentUser]);

  return {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    portfolioImages,
    profileImageUrl,
    setProfileData,
    setPortfolioImages,
    setProfileImageUrl,
    fetchPortfolioImages
  };
};
