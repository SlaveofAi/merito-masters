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
    if (!userId) return null;
    
    try {
      // First try to get user type from localStorage (fastest)
      const storedType = localStorage.getItem("userType");
      if (storedType === 'customer' || storedType === 'craftsman') {
        console.log("Using cached user type from localStorage:", storedType);
        setUserType(storedType as 'customer' | 'craftsman');
        // Don't return yet, still verify from metadata or server
      }

      // Then check user metadata (second priority)
      if (session?.user?.user_metadata?.user_type) {
        const metadataType = session.user.user_metadata.user_type;
        
        if (metadataType === 'customer' || metadataType === 'craftsman') {
          console.log("Found user type in metadata:", metadataType);
          setUserType(metadataType);
          localStorage.setItem("userType", metadataType);
          setUserTypeFetched(true);
          return metadataType;
        }
      }
      
      // Finally check database (third priority)
      const { data, error } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user type:", error);
        
        if (storedType === 'customer' || storedType === 'craftsman') {
          setUserType(storedType as 'customer' | 'craftsman');
          setUserTypeFetched(true);
          return storedType as 'customer' | 'craftsman';
        }
        
        return null;
      }

      if (!data) {
        console.log("No user type found in database for:", userId);
        
        if (storedType === 'customer' || storedType === 'craftsman') {
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
          localStorage.setItem("userType", retrievedUserType);
          setUserTypeFetched(true);
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

  const checkAndCreateProfileIfNeeded = async (userId: string, userType: 'customer' | 'craftsman') => {
    if (profileCreationAttempted) return;
    
    try {
      console.log("Checking if profile exists for:", userId, "with type:", userType);
      setProfileCreationAttempted(true);
      
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
          await createDefaultProfile(
            user, 
            userType, 
            true, // isCurrentUser 
            () => {
              console.log("Profile created successfully");
              toast.success("Profil bol úspešne vytvorený", { duration: 3000 });
            }
          );
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
      
      // Update in localStorage first (immediate feedback)
      localStorage.setItem("userType", type);
      setUserType(type);
      
      // Then update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { user_type: type }
      });

      if (updateError) {
        console.error("Error updating user metadata:", updateError);
      }
      
      // Update in database
      const { error } = await supabase
        .from('user_types')
        .upsert({ 
          user_id: user.id, 
          user_type: type 
        });

      if (error) {
        console.error("Error updating user type in database:", error);
        toast.error("Chyba pri aktualizácii typu používateľa");
        return;
      }
      
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
    // First check localStorage for faster initial render
    const storedType = localStorage.getItem("userType");
    if (storedType === 'customer' || storedType === 'craftsman') {
      setUserType(storedType);
    }
    
    // Keep track if component is mounted to prevent state updates after unmount
    let mounted = true;
    setLoading(true);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setUserType(null);
          localStorage.removeItem("userType");
          setUserTypeFetched(false);
          setProfileCreationAttempted(false);
          setLoading(false);
          return;
        }
        
        if (newSession?.user) {
          const type = await fetchUserType(newSession.user.id);
          
          // If user type exists and email is confirmed, try to create profile
          if (type && newSession.user.email_confirmed_at && !profileCreationAttempted) {
            checkAndCreateProfileIfNeeded(newSession.user.id, type);
          }
          
          // User is authenticated, finish loading
          if (mounted) {
            setLoading(false);
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserType(session.user.id).then(type => {
          if (!mounted) return;
          
          if (type && session.user.email_confirmed_at) {
            checkAndCreateProfileIfNeeded(session.user.id, type);
          }
          
          setLoading(false);
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
    loading: loading || (!!user && !userTypeFetched),
    userType,
    signOut,
    updateUserType
  };

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
