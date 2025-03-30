
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
      // Determine whose profile to fetch
      let userId = id;
      
      // If no ID provided or ID is the literal string ":id" or empty, use current user's ID
      if (!userId || userId === ":id" || userId === "") {
        userId = user?.id;
        console.log("Using current user ID:", userId);
      }
      
      // Exit early if we still don't have a userId to query
      if (!userId) {
        console.log("No user ID available, can't fetch profile");
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      // First, fetch user type for the userId
      console.log("Fetching user type for:", userId);
      const { data: userTypeData, error: userTypeError } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (userTypeError) {
        console.error("Error fetching user type:", userTypeError);
        setError(`Error fetching user type: ${userTypeError.message}`);
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      console.log("User type data:", userTypeData);
      
      if (!userTypeData) {
        console.log("No user type found for:", userId);
        setUserType(null);
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      const fetchedUserType = userTypeData.user_type;
      if (fetchedUserType === 'customer' || fetchedUserType === 'craftsman') {
        setUserType(fetchedUserType);
      } else {
        console.log("Invalid user type:", fetchedUserType);
        setUserType(null);
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      // Now fetch the profile data based on user type
      const table = fetchedUserType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      console.log(`Fetching ${table} profile for user:`, userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError(`Error fetching profile: ${profileError.message}`);
        setProfileNotFound(true);
      } else if (profileData) {
        console.log("Profile data found:", profileData);
        setProfileData(profileData as ProfileData);
        setProfileNotFound(false);
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
  }, [id, user]);

  useEffect(() => {
    if (user) {
      // Determine if the profile being viewed belongs to the current user
      if (!id || id === ":id" || id === "") {
        setIsCurrentUser(true);
      } else {
        setIsCurrentUser(user.id === id);
      }
    } else {
      setIsCurrentUser(false);
    }
  }, [user, id]);

  useEffect(() => {
    // Fetch profile data whenever the dependencies change
    fetchProfileData();
  }, [fetchProfileData]);

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
