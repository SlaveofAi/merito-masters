
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userType: 'customer' | 'craftsman' | null;
  signOut: () => Promise<void>;
  updateUserType: (type: 'customer' | 'craftsman') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'customer' | 'craftsman' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserType = async (userId: string) => {
    try {
      console.log("Fetching user type for:", userId);
      
      // First try to get user type from user metadata (if available)
      if (session?.user?.user_metadata?.user_type) {
        const metadataType = session.user.user_metadata.user_type;
        console.log("Found user type in metadata:", metadataType);
        
        if (metadataType === 'customer' || metadataType === 'craftsman') {
          setUserType(metadataType);
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
        return type;
      } else {
        console.log("No user type found in database for user:", userId);
        
        // Try to get from session storage as last resort
        const storedType = sessionStorage.getItem("userType");
        if (storedType === 'customer' || storedType === 'craftsman') {
          console.log("Using user type from session storage:", storedType);
          setUserType(storedType);
          
          // Try to save this to the database to fix the issue
          const { error: insertError } = await supabase
            .from('user_types')
            .insert({
              user_id: userId,
              user_type: storedType
            });
            
          if (insertError) {
            console.error("Error saving user type to database:", insertError);
          } else {
            console.log("Recovered user type saved to database");
          }
          
          return storedType;
        }
        
        setUserType(null);
        return null;
      }
    } catch (error) {
      console.error("Error in fetchUserType:", error);
      setUserType(null);
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

      // Update in session storage
      sessionStorage.setItem("userType", type);
      
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
    // Set up auth state listener FIRST to avoid potential deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential Supabase deadlocks
          setTimeout(() => {
            fetchUserType(session.user.id);
          }, 100);
        } else {
          setUserType(null);
        }

        if (event === 'SIGNED_OUT') {
          setUserType(null);
          sessionStorage.removeItem("userType");
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserType(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserType(null);
      sessionStorage.removeItem("userType");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Nastala chyba pri odhlásení");
    }
  };

  const contextValue = {
    session,
    user,
    loading,
    userType,
    signOut,
    updateUserType
  };

  console.log("Auth context state:", { 
    userId: user?.id, 
    userType, 
    loading 
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
