
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
  const { user, userType: authUserType, loading: authLoading } = useAuth();

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
      } else {
        console.log("Using provided profile ID:", userId);
      }
      
      // Exit early if we still don't have a userId to query
      if (!userId) {
        console.log("No user ID available, can't fetch profile");
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      // Check if the profile being viewed is the current user's profile
      const isViewingSelf = user?.id === userId;
      console.log("Is viewing own profile:", isViewingSelf);
      setIsCurrentUser(isViewingSelf);

      // Use the userType from Auth context if it's for the current user
      let fetchedUserType = null;
      
      if (isViewingSelf && authUserType) {
        console.log("Using userType from auth context:", authUserType);
        fetchedUserType = authUserType;
        setUserType(authUserType);
        
        // Always update localStorage with the latest user type
        localStorage.setItem("userType", authUserType);
      } else {
        // If not viewing own profile, determine user type from database
        console.log("Fetching user type from database for:", userId);
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
        } else {
          fetchedUserType = userTypeData.user_type;
          if (fetchedUserType === 'customer' || fetchedUserType === 'craftsman') {
            console.log("Setting user type from database:", fetchedUserType);
            setUserType(fetchedUserType);
          } else {
            console.log("Invalid user type:", fetchedUserType);
            setUserType(null);
            setProfileNotFound(true);
            setLoading(false);
            return;
          }
        }
      }

      // Now fetch the profile data based on user type
      // IMPORTANT FIX: Use the identified fetchedUserType, not the user type from auth context
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
        
        // Explicitly add user_type to the profile data to ensure it's always available
        const enrichedProfileData = {
          ...profileData,
          user_type: fetchedUserType
        };

        console.log("Enriched profile data:", enrichedProfileData);
        setProfileData(enrichedProfileData as ProfileData);
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
  }, [id, user, authUserType]);

  // Ensure we properly track if this is the current user's profile
  useEffect(() => {
    // This effect runs when user or id changes to determine if viewing own profile
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
    // Only fetch profile data when auth is no longer loading
    // This prevents premature fetches without user type info
    if (!authLoading) {
      fetchProfileData();
    }
  }, [fetchProfileData, authLoading]);

  return {
    loading: loading || authLoading, // Consider loading until auth is also ready
    profileData,
    userType,
    isCurrentUser,
    profileNotFound,
    error,
    setProfileData,
    fetchProfileData,
  };
};
