
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const fetchUserType = async (userId: string, currentSession: Session | null = null) => {
    try {
      console.log("Fetching user type for:", userId);
      
      // First try to get user type from user metadata
      if (currentSession?.user?.user_metadata?.user_type) {
        const metadataType = currentSession.user.user_metadata.user_type;
        console.log("Found user type in metadata:", metadataType);
        
        if (metadataType === 'customer' || metadataType === 'craftsman') {
          setUserType(metadataType);
          localStorage.setItem("userType", metadataType);
          return metadataType;
        }
      }
      
      // Try to get from localStorage as fallback
      const storedType = localStorage.getItem("userType");
      if (storedType === 'customer' || storedType === 'craftsman') {
        console.log("Using cached user type from localStorage:", storedType);
        setUserType(storedType);
      }
      
      // Get from database
      const { data, error } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user type:", error);
        if (storedType === 'customer' || storedType === 'craftsman') {
          return storedType as 'customer' | 'craftsman';
        }
        return null;
      }

      if (!data) {
        console.log("No user type found in database");
        if (storedType === 'customer' || storedType === 'craftsman') {
          return storedType as 'customer' | 'craftsman';
        }
        setUserType(null);
        return null;
      }

      const retrievedUserType = data.user_type;
      if (retrievedUserType === 'customer' || retrievedUserType === 'craftsman') {
        console.log("Found user type in database:", retrievedUserType);
        setUserType(retrievedUserType);
        localStorage.setItem("userType", retrievedUserType);
        return retrievedUserType;
      }

      setUserType(null);
      return null;
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
      console.log("Updating user type to:", type);
      
      // Store in localStorage immediately
      localStorage.setItem("userType", type);
      setUserType(type);
      
      // Update in database
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
        toast.error("Chyba pri aktualizácii typu používateľa");
        return;
      }
      
      console.log("User type updated successfully in database");
      
      // Update user metadata
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { user_type: type }
        });

        if (updateError) {
          console.error("Error updating user metadata:", updateError);
        } else {
          console.log("User metadata updated successfully");
        }
      } catch (err) {
        console.error("Exception during metadata update:", err);
      }
      
    } catch (error) {
      console.error("Error in updateUserType:", error);
      toast.error("Nastala chyba pri aktualizácii typu používateľa");
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Check localStorage for faster initial render
    const storedType = localStorage.getItem("userType");
    if (storedType === 'customer' || storedType === 'craftsman') {
      setUserType(storedType);
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setUserType(null);
          localStorage.removeItem("userType");
        }
        
        if (newSession?.user) {
          await fetchUserType(newSession.user.id, newSession);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Initial session check:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserType(session.user.id, session).then(() => {
          if (mounted) setLoading(false);
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
    loading,
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
