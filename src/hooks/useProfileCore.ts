
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

export const useProfileCore = (id?: string) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userType, setUserType] = useState<'customer' | 'craftsman' | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setProfileNotFound(false);
    setError(null);

    try {
      if (!userType) {
        setLoading(false);
        return;
      }
      
      // Fix for handling URL parameters by checking if the ID is ":id"
      let userId = id;
      if (!userId || userId === ":id") {
        userId = user?.id;
      }
      
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
        setError(error.message);
        setProfileNotFound(true);
      }

      if (data) {
        console.log("Profile data found:", data);
        setProfileData(data as ProfileData);
      } else {
        console.log("No profile data found for:", userId);
        setProfileNotFound(true);
      }
    } catch (error: any) {
      console.error("Error in fetchProfileData:", error);
      setError(error.message);
      setProfileNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, user, userType]);

  useEffect(() => {
    if (user && id) {
      // Fix for handling URL parameters by checking if the ID is ":id"
      if (id === ":id") {
        setIsCurrentUser(true);
      } else {
        setIsCurrentUser(user.id === id);
      }
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
        // Fix for handling URL parameters
        let userId = id;
        if (!userId || userId === ":id") {
          userId = user?.id;
        }
        
        if (!userId) return;
        
        console.log("Fetching user type for:", userId);
        const { data, error } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user type:", error);
          setError(`Error fetching user type: ${error.message}`);
          return;
        }

        console.log("User type data:", data);
        if (data?.user_type === 'customer' || data?.user_type === 'craftsman') {
          setUserType(data.user_type);
        } else {
          console.log("No valid user type found");
          setUserType(null);
        }
      } catch (error: any) {
        console.error("Error fetching user type:", error);
        setError(error.message);
      }
    };

    fetchUserType();
  }, [user, id]);

  useEffect(() => {
    if (userType) {
      fetchProfileData();
    }
  }, [userType, fetchProfileData]);

  return {
    loading,
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    error,
    setProfileData,
    fetchProfileData,
  };
};
