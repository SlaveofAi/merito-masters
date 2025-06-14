
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { createDefaultProfile } from "@/utils/profileCreation";
import { toast } from "sonner";

export const useProfileCore = (id?: string) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userType, setUserType] = useState<'customer' | 'craftsman' | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, userType: authUserType, loading: authLoading } = useAuth();

  const fetchProfileData = useCallback(async () => {
    console.log("=== FETCH PROFILE DATA DETAILED DEBUG ===");
    console.log("Starting profile fetch with params:", {
      id,
      userId: user?.id,
      authUserType,
      authLoading
    });
    
    setLoading(true);
    setProfileNotFound(false);
    setError(null);

    try {
      // Determine whose profile to fetch
      let userId = id;
      
      // If no ID provided or ID is placeholder, use current user's ID
      if (!userId || userId === ":id" || userId === "") {
        userId = user?.id;
        console.log("No ID provided, using current user ID:", userId);
      }
      
      // Exit early if we still don't have a userId to query
      if (!userId) {
        console.log("No user ID available, can't fetch profile");
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      // Determine if this is the current user
      const isOwner = user?.id === userId;
      setIsCurrentUser(isOwner);
      console.log("Profile owner check:", { userId, currentUserId: user?.id, isOwner });
      
      // Use the userType from Auth context if it's for the current user
      let fetchedUserType = null;
      
      if (isOwner && authUserType) {
        console.log("Using userType from auth context:", authUserType);
        fetchedUserType = authUserType;
        setUserType(authUserType);
        
        // Always update localStorage with the latest user type
        localStorage.setItem("userType", authUserType);
      } else {
        // If not the current user, fetch user type from database
        console.log("Fetching user type from database for:", userId);
        const { data: userTypeData, error: userTypeError } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('user_id', userId)
          .maybeSingle();

        console.log("User type database result:", { userTypeData, userTypeError });

        if (userTypeError) {
          console.error("Error fetching user type:", userTypeError);
          setError(`Error fetching user type: ${userTypeError.message}`);
          setProfileNotFound(true);
          setLoading(false);
          return;
        }

        if (!userTypeData) {
          console.log("No user type found for:", userId);
          
          // Last effort - check cached user type in localStorage if this is the current user
          if (isOwner) {
            const cachedUserType = localStorage.getItem("userType");
            console.log("Checking cached user type:", cachedUserType);
            if (cachedUserType === 'customer' || cachedUserType === 'craftsman') {
              console.log("Using cached user type from localStorage:", cachedUserType);
              setUserType(cachedUserType as 'customer' | 'craftsman');
              fetchedUserType = cachedUserType;
            } else {
              console.log("No cached user type available, profile setup needed");
              setUserType(null);
              setProfileNotFound(true);
              setLoading(false);
              return;
            }
          } else {
            setUserType(null);
            setProfileNotFound(true);
            setLoading(false);
            return;
          }
        } else {
          fetchedUserType = userTypeData.user_type;
          if (fetchedUserType === 'customer' || fetchedUserType === 'craftsman') {
            setUserType(fetchedUserType);
            // Cache the user type for faster access
            if (isOwner) {
              localStorage.setItem("userType", fetchedUserType);
            }
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
      const table = fetchedUserType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      console.log(`Fetching ${table} profile for user:`, userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log(`Profile data result from ${table}:`, { profileData, profileError });

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
        
        // If this is the current user and we have a user type, try to create a default profile
        if (isOwner && fetchedUserType && user) {
          console.log("Attempting to create default profile for current user");
          try {
            await createDefaultProfile(user, fetchedUserType, true, () => {
              console.log("Default profile created, refetching data");
              // Retry fetching the profile after creation
              setTimeout(() => {
                fetchProfileData();
              }, 1000);
            });
          } catch (createError) {
            console.error("Error creating default profile:", createError);
            setError("Chyba pri vytváraní profilu");
            setProfileNotFound(true);
          }
        } else {
          setProfileNotFound(true);
        }
      }
    } catch (error: any) {
      console.error("Error in fetchProfileData:", error);
      setError(error.message);
      setProfileNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, user, authUserType]);

  useEffect(() => {
    if (user) {
      // Determine if the profile being viewed belongs to the current user
      if (!id || id === ":id" || id === "") {
        setIsCurrentUser(true);
        console.log("Viewing current user's profile");
      } else {
        const isOwner = user.id === id;
        setIsCurrentUser(isOwner);
        console.log("Is current user viewing own profile:", isOwner);
      }
    } else {
      setIsCurrentUser(false);
    }
  }, [user, id]);

  useEffect(() => {
    // Only fetch profile data when auth is no longer loading
    // This prevents premature fetches without user type info
    if (!authLoading) {
      console.log("Auth loading complete, fetching profile data");
      fetchProfileData();
    } else {
      console.log("Still loading auth state, waiting...");
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
