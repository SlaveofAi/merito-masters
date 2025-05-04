import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

      if (data) {
        console.log("User type found in database:", data.user_type);
        const type = data.user_type as 'customer' | 'craftsman';
        setUserType(type);
        
        // Save to localStorage for backup and faster access
        localStorage.setItem("userType", type);
        
        // Also update user metadata to have consistent sources
        const { error: updateError } = await supabase.auth.updateUser({
          data: { user_type: type }
        });
        
        if (updateError) {
          console.error("Error updating user metadata with user_type:", updateError);
        }
        
        setUserTypeFetched(true);
        return type;
      } else {
        console.log("No user type found in database for user:", userId);
        
        // Last resort - try again with user metadata
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (!userError && userData?.user?.user_metadata?.user_type) {
            const recoveredType = userData.user.user_metadata.user_type;
            if (recoveredType === 'customer' || recoveredType === 'craftsman') {
              console.log("Recovered user type from re-fetched metadata:", recoveredType);
              setUserType(recoveredType);
              localStorage.setItem("userType", recoveredType);
              
              // Save this to the database to fix the issue
              const { error: insertError } = await supabase
                .from('user_types')
                .insert({
                  user_id: userId,
                  user_type: recoveredType
                });
                
              if (insertError) {
                console.error("Error saving user type to database:", insertError);
              } else {
                console.log("Recovered user type saved to database");
              }
              
              setUserTypeFetched(true);
              return recoveredType;
            }
          }
        } catch (metaError) {
          console.error("Error retrieving user metadata:", metaError);
        }
        
        setUserType(null);
        setUserTypeFetched(true);
        return null;
      }
    } catch (error) {
      console.error("Error in fetchUserType:", error);
      setUserType(null);
      setUserTypeFetched(true);
      return null;
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
        }
        
        if (newSession?.user) {
          // Use setTimeout to avoid potential Supabase deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchUserType(newSession.user.id);
            }
          }, 100);
        } else {
          setLoading(false);
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
        fetchUserType(session.user.id).finally(() => {
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
