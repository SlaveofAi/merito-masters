
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createDefaultProfile } from "@/utils/profileCreation";

// Explicitly define the user type literals to help TypeScript understand they can be compared
type UserType = 'customer' | 'craftsman' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userType: UserType;
  signOut: () => Promise<void>;
  updateUserType: (type: 'customer' | 'craftsman') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const [userTypeFetched, setUserTypeFetched] = useState(false);
  const [profileCreationAttempted, setProfileCreationAttempted] = useState(false);

  const fetchUserType = async (userId: string) => {
    try {
      console.log("Fetching user type for:", userId);
      
      // First try to get user type from user metadata (highest priority)
      if (session?.user?.user_metadata?.user_type) {
        const metadataType = session.user.user_metadata.user_type;
        console.log("Found user type in metadata:", metadataType);
        
        if (metadataType === 'customer' || metadataType === 'craftsman') {
          setUserType(metadataType);
          // Save to localStorage for faster access next time
          localStorage.setItem("userType", metadataType);
          setUserTypeFetched(true);
          return metadataType;
        }
      }
      
      // Try to get from localStorage (second priority)
      const storedType = localStorage.getItem("userType");
      if (storedType === 'customer' || storedType === 'craftsman') {
        console.log("Using cached user type from localStorage:", storedType);
        setUserType(storedType);
        // Don't return yet, still verify from server
      }
      
      // If not in metadata, try to get from user_types table (third priority)
      const { data, error } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user type:", error);
        
        // If we have a stored type, use it as fallback
        if (storedType === 'customer' || storedType === 'craftsman') {
          setUserType(storedType as 'customer' | 'craftsman');
          setUserTypeFetched(true);
          return storedType as 'customer' | 'craftsman';
        }
        
        return null;
      }

      console.log("User type data from database:", data);
      
      if (!data) {
        console.log("No user type found in database for:", userId);
        
        // Last effort - use cached user type in localStorage
        if (storedType === 'customer' || storedType === 'craftsman') {
          console.log("Using cached user type from localStorage as fallback:", storedType);
          setUserType(storedType as 'customer' | 'craftsman');
          setUserTypeFetched(true);
          return storedType as 'customer' | 'craftsman';
        } else {
          setUserType(null);
          setUserTypeFetched(true);
          return null;
        }
      } else {
        const retrievedUserType = data.user_type;
        if (retrievedUserType === 'customer' || retrievedUserType === 'craftsman') {
          console.log("Found valid user type in database:", retrievedUserType);
          setUserType(retrievedUserType);
          // Cache the user type for faster access
          localStorage.setItem("userType", retrievedUserType);
          setUserTypeFetched(true);
          
          // Update user metadata with a safe check for active session
          if (session) {
            try {
              // Use setTimeout to avoid potential Supabase deadlocks
              setTimeout(async () => {
                try {
                  const { error: updateError } = await supabase.auth.updateUser({
                    data: { user_type: retrievedUserType }
                  });
                  
                  if (updateError) {
                    if (updateError.message.includes("session missing")) {
                      console.log("Session not available for metadata update, will try again later");
                    } else {
                      console.error("Error updating user metadata with type:", updateError);
                    }
                  }
                } catch (e) {
                  console.error("Exception in metadata update:", e);
                }
              }, 1000);
            } catch (e) {
              console.error("Exception setting up metadata update:", e);
            }
          }
          
          return retrievedUserType;
        } else {
          console.log("Invalid user type in database:", retrievedUserType);
          setUserType(null);
          setUserTypeFetched(true);
          return null;
        }
      }
    } catch (error) {
      console.error("Error in fetchUserType:", error);
      setUserType(null);
      setUserTypeFetched(true);
      return null;
    }
  };

  // Check if profile exists for the user
  const checkAndCreateProfileIfNeeded = async (userId: string, userType: 'customer' | 'craftsman') => {
    if (profileCreationAttempted) return;
    
    try {
      console.log("Checking if profile exists for:", userId, "with type:", userType);
      setProfileCreationAttempted(true);
      
      // Check if profile exists in appropriate table
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      const { data: profileData, error: profileError } = await supabase
        .from(table)
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking profile existence:", profileError);
        
        // If RLS error, retry with a delay
        if (profileError.message.includes("row-level security")) {
          console.warn("RLS policy error detected. Retrying profile creation in 1 second...");
          setTimeout(() => {
            setProfileCreationAttempted(false);
            checkAndCreateProfileIfNeeded(userId, userType);
          }, 1000);
        }
        
        return;
      }
      
      if (!profileData) {
        console.log("Profile does not exist, creating default profile for:", userId);
        
        try {
          // First ensure user_type record exists to avoid RLS issues
          const { error: typeError } = await supabase
            .from('user_types')
            .upsert({ 
              user_id: userId, 
              user_type: userType 
            }, {
              onConflict: 'user_id'
            });
            
          if (typeError) {
            console.warn("Warning during user_type upsert:", typeError);
            // Continue anyway as it might just be that the record already exists
          }
          
          // Use setTimeout to avoid potential Supabase deadlocks
          setTimeout(async () => {
            try {
              await createDefaultProfile(
                user, 
                userType, 
                true, // isCurrentUser 
                () => {
                  console.log("Profile created successfully after email verification");
                  toast.success("Profil bol úspešne vytvorený", { duration: 3000 });
                }
              );
            } catch (createError) {
              console.error("Error in delayed profile creation:", createError);
              // Reset attempted flag to allow retrying
              setProfileCreationAttempted(false);
            }
          }, 500);
        } catch (error) {
          console.error("Error creating default profile:", error);
        }
      } else {
        console.log("Profile already exists for user:", userId);
      }
    } catch (error) {
      console.error("Error in checkAndCreateProfileIfNeeded:", error);
    }
  };

  const updateUserType = async (type: 'customer' | 'craftsman') => {
    if (!user) {
      toast.error("Používateľ nie je prihlásený");
      return;
    }

    try {
      console.log("Updating user type to:", type);
      
      // Store in localStorage immediately for reliability
      localStorage.setItem("userType", type);
      
      // Update state right away for responsive UI
      setUserType(type);
      
      // Update in database first - handle retries for RLS issues
      const updateDatabase = async (retries = 3) => {
        try {
          const { error } = await supabase
            .from('user_types')
            .upsert({ 
              user_id: user.id, 
              user_type: type 
            }, {
              onConflict: 'user_id'
            });

          if (error) {
            console.error("Error updating user type in database:", error);
            
            // If RLS error and we have retries left, try again after a delay
            if (error.message.includes("row-level security") && retries > 0) {
              console.warn(`RLS policy error detected. Retrying (${retries} attempts left)...`);
              setTimeout(() => updateDatabase(retries - 1), 500);
              return;
            }
            
            toast.error("Chyba pri aktualizácii typu používateľa v databáze");
            return;
          }
          
          console.log("Successfully updated user type in database");
          
          // Only try to update metadata if we have a valid session
          if (session) {
            // Try metadata update after successful database update
            try {
              const { error: updateError } = await supabase.auth.updateUser({
                data: { user_type: type }
              });

              if (updateError) {
                if (updateError.message.includes("session missing")) {
                  console.warn("No active session for metadata update - using localStorage only");
                } else {
                  console.error("Error updating user metadata:", updateError);
                  toast.error("Chyba pri aktualizácii typu používateľa v metadátach");
                }
              } else {
                console.log("Successfully updated metadata with user_type");
              }
            } catch (err) {
              console.error("Exception during metadata update:", err);
            }
          } else {
            console.warn("No active session for metadata update - using localStorage only");
          }
        } catch (error) {
          console.error("Exception in updateDatabase:", error);
        }
      };
      
      // Start the update process
      await updateDatabase();
      
      // Reset profile creation flag to allow creating profile for the new user type
      setProfileCreationAttempted(false);
      
      // Check and create profile if needed with the new user type
      if (session) { // Only try if we have a valid session
        checkAndCreateProfileIfNeeded(user.id, type);
      }
    } catch (error) {
      console.error("Error in updateUserType:", error);
      toast.error("Nastala chyba pri aktualizácii typu používateľa");
    }
  };

  useEffect(() => {
    // Improved initialization sequence to prevent race conditions
    let mounted = true;
    setLoading(true);
    
    // Immediately check localStorage for faster initial render
    const storedType = localStorage.getItem("userType");
    if (storedType === 'customer' || storedType === 'craftsman') {
      setUserType(storedType);
    }
    
    // Set up auth state listener FIRST to avoid potential deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (!mounted) return;
        
        // Always update the session state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setUserType(null);
          localStorage.removeItem("userType");
          setUserTypeFetched(false);
          setProfileCreationAttempted(false);
        }
        
        if (newSession?.user) {
          // Use setTimeout to avoid potential Supabase deadlocks
          setTimeout(async () => {
            if (mounted) {
              const type = await fetchUserType(newSession.user.id);
              
              // If user type exists and email is confirmed, try to create profile
              if (type && newSession.user.email_confirmed_at && !profileCreationAttempted) {
                checkAndCreateProfileIfNeeded(newSession.user.id, type);
              }
            }
          }, 100);
        } else {
          setLoading(false);
        }
        
        // If the user has been confirmed (email verification), try to create their profile
        if (event === 'USER_UPDATED' && newSession?.user?.email_confirmed_at) {
          console.log("User email confirmed, attempting to create profile");
          setTimeout(async () => {
            if (mounted && newSession.user) {
              const type = await fetchUserType(newSession.user.id);
              if (type) {
                checkAndCreateProfileIfNeeded(newSession.user.id, type);
              }
            }
          }, 500);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserType(session.user.id).then(type => {
          if (mounted && type && session.user.email_confirmed_at) {
            checkAndCreateProfileIfNeeded(session.user.id, type);
          }
          if (mounted) {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserType(null);
      localStorage.removeItem("userType");
      setUserTypeFetched(false);
      setProfileCreationAttempted(false);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Nastala chyba pri odhlásení");
    }
  };

  const contextValue = {
    session,
    user,
    loading: loading || (!!user && !userTypeFetched), // Consider loading until userType is fetched
    userType,
    signOut,
    updateUserType
  };

  console.log("Auth context state:", { 
    userId: user?.id, 
    userType, 
    loading,
    userTypeFetched,
    hasSession: !!session
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
