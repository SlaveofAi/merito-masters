
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
      
      // First try to get user type from localStorage - fastest method for immediate UI
      const storedType = localStorage.getItem("userType");
      if (storedType === 'customer' || storedType === 'craftsman') {
        console.log("Using cached user type from localStorage:", storedType);
        setUserType(storedType);
        // Don't return yet, still verify from server
      }
      
      // Next try to get user type from user metadata (if available)
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
      
      // If not in metadata, try to get from user_types table
      const { data, error } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user type:", error);
        return null;
      }

      console.log("User type data:", data);
      
      if (!data) {
        console.log("No user type found for:", userId);
        
        // Last effort - check cached user type in localStorage
        const cachedUserType = localStorage.getItem("userType");
        if (cachedUserType === 'customer' || cachedUserType === 'craftsman') {
          console.log("Using cached user type from localStorage:", cachedUserType);
          setUserType(cachedUserType as 'customer' | 'craftsman');
          setUserTypeFetched(true);
          return cachedUserType;
        } else {
          setUserType(null);
          setUserTypeFetched(true);
          return null;
        }
      } else {
        const retrievedUserType = data.user_type;
        if (retrievedUserType === 'customer' || retrievedUserType === 'craftsman') {
          setUserType(retrievedUserType);
          // Cache the user type for faster access
          localStorage.setItem("userType", retrievedUserType);
          setUserTypeFetched(true);
          return retrievedUserType;
        } else {
          console.log("Invalid user type:", retrievedUserType);
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
      console.log("Checking if profile exists for:", userId);
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
        return;
      }
      
      if (!profileData) {
        console.log("Profile does not exist, creating default profile for:", userId);
        
        try {
          // Use setTimeout to avoid potential Supabase deadlocks
          setTimeout(async () => {
            await createDefaultProfile(
              user, 
              userType, 
              true, // isCurrentUser 
              () => {
                console.log("Profile created successfully after email verification");
                toast.success("Profil bol úspešne vytvorený", { duration: 3000 });
              }
            );
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
      // Update in database
      const { error } = await supabase
        .from('user_types')
        .upsert({ 
          user_id: user.id, 
          user_type: type 
        });

      if (error) {
        console.error("Error updating user type:", error);
        toast.error("Chyba pri aktualizácii typu používateľa");
        return;
      }

      // Update in localStorage
      localStorage.setItem("userType", type);
      
      // Update in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { user_type: type }
      });

      if (updateError) {
        console.error("Error updating user metadata:", updateError);
      }

      // Update state
      setUserType(type);
      toast.success("Typ používateľa bol aktualizovaný");
      
      // Reset profile creation flag to allow creating profile for the new user type
      setProfileCreationAttempted(false);
      
      // Check and create profile if needed with the new user type
      checkAndCreateProfileIfNeeded(user.id, type);
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
    userTypeFetched
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
