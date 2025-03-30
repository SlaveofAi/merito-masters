
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
      const { data, error } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user type:", error);
        return;
      }

      if (data) {
        console.log("User type found:", data.user_type);
        setUserType(data.user_type as 'customer' | 'craftsman');
      } else {
        console.log("No user type found for user:", userId);
        setUserType(null);
      }
    } catch (error) {
      console.error("Error in fetchUserType:", error);
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
    signOut
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
