
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, AlertTriangle, User, LogOut, AlertCircle, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createDefaultProfile } from "@/utils/profileCreation";
import { supabase } from "@/integrations/supabase/client";

interface ProfileNotFoundProps {
  isCurrentUser: boolean;
  onCreateProfile?: () => void;
  error?: string;
}

const ProfileNotFound: React.FC<ProfileNotFoundProps> = ({ 
  isCurrentUser, 
  onCreateProfile,
  error 
}) => {
  const navigate = useNavigate();
  const { user, signOut, userType, updateUserType } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [autoCreationAttempted, setAutoCreationAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5; // Increased from 3 to 5 for more resilience

  // Automatically try to create a profile when this component loads for current user
  useEffect(() => {
    if (isCurrentUser && user && userType && !autoCreationAttempted && onCreateProfile) {
      console.log("Auto-creating profile for current user:", user.id, "with type:", userType);
      setIsCreating(true);
      setAutoCreationAttempted(true);
      
      // Attempt to create the profile automatically with a slight delay
      // to ensure the userType is properly set in the database
      setTimeout(() => {
        handleCreateProfile();
      }, 1000);
    }
  }, [isCurrentUser, user, userType, autoCreationAttempted, onCreateProfile]);

  // Enhanced createProfile function with better error handling for RLS
  const handleCreateProfile = async () => {
    if (!onCreateProfile) {
      toast.error("Funkcia pre vytvorenie profilu nie je dostupná");
      return;
    }
    
    if (!userType) {
      toast.error("Typ používateľa nie je nastavený. Prosím, vyberte najprv typ používateľa.");
      
      // If user doesn't have a type, ask them to set it first
      if (user) {
        navigate('/profile');
        return;
      }
    }
    
    try {
      setIsCreating(true);
      toast.info("Vytváram profil...");
      console.log("Attempting to create profile...");
      
      // Make sure user_type is properly set first to avoid RLS issues
      if (user && userType) {
        try {
          // First, ensure user_type is properly set in the database
          const { error: typeError } = await supabase
            .from('user_types')
            .upsert({ 
              user_id: user.id, 
              user_type: userType 
            }, { 
              onConflict: 'user_id'
            });
            
          if (typeError) {
            console.warn("Warning during user_type upsert:", typeError);
            // Continue anyway as it might just be that the record already exists
          } else {
            console.log("Successfully inserted/updated user type");
            
            // Wait a moment for the RLS policies to take effect
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (typeErr) {
          console.warn("Exception during user_type upsert:", typeErr);
          // Continue anyway
        }
      }
      
      // Now try to create the profile
      await onCreateProfile();

      // Reload page to reflect new profile
      toast.success("Profil bol úspešne vytvorený!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error in handleCreateProfile:", error);
      
      // Implement retry mechanism for RLS-related errors with longer delays
      if (retryCount < maxRetries && error instanceof Error && 
          (error.message.includes("row-level security") || 
           error.message.includes("violates row-level security policy") ||
           error.message.includes("permission denied"))) {
        
        setRetryCount(prevCount => prevCount + 1);
        toast.warning(`Pokus ${retryCount + 1}/${maxRetries}: Opakujem vytvorenie profilu...`);
        
        // Use exponential backoff for retries
        const delay = 1500 * Math.pow(1.5, retryCount);
        setTimeout(() => {
          setIsCreating(false);
          handleCreateProfile();
        }, delay);
        
      } else {
        setIsCreating(false);
        
        // Check for specific RLS errors
        if (error instanceof Error && error.message.includes("row-level security")) {
          toast.error("Chyba pri vytváraní profilu z dôvodu obmedzení prístupu. Skúste sa odhlásiť a znovu prihlásiť.");
        } else {
          toast.error("Nepodarilo sa vytvoriť profil. Skúste to neskôr.");
        }
      }
    }
  };

  const handleSetCustomer = async () => {
    if (!user) return;
    try {
      await updateUserType('customer');
      toast.success("Typ používateľa nastavený na zákazníka");
      setRetryCount(0); // Reset retry count when changing user type
      
      // Add longer delay before redirecting to allow userType to propagate
      setTimeout(() => {
        navigate('/profile/reviews', { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error setting user type:", error);
      toast.error("Chyba pri nastavení typu používateľa");
    }
  };

  const handleSetCraftsman = async () => {
    if (!user) return;
    try {
      await updateUserType('craftsman');
      toast.success("Typ používateľa nastavený na remeselníka");
      setRetryCount(0); // Reset retry count when changing user type
      
      // Add longer delay before redirecting to allow userType to propagate
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error setting user type:", error);
      toast.error("Chyba pri nastavení typu používateľa");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Boli ste odhlásení");
    navigate("/login");
  };

  const getErrorExplanation = () => {
    if (error?.includes("Could not find the 'profile_image_url' column")) {
      return (
        <div className="space-y-2 mt-2">
          <p>Chyba súvisí s chýbajúcim stĺpcom v databáze, no už sme ju opravili. Skúste to znova.</p>
        </div>
      );
    }
    
    if (error?.includes("row-level security policy")) {
      return (
        <div className="space-y-2 mt-2">
          <p>Problém je spôsobený nastaveniami oprávnení v databáze (Row Level Security).</p>
          <ol className="list-decimal list-inside space-y-1 pl-4">
            <li>Skúste sa odhlásiť a znova prihlásiť</li>
            <li>Ak sa práve registrujete, dokončite overenie emailu kliknutím na odkaz v emaile</li>
            <li>Po prihlásení sa profile automaticky vytvorí</li>
          </ol>
        </div>
      );
    }
    
    return (
      <p className="text-sm mt-2">
        Problém môže byť spôsobený nastaveniami oprávnení. Skúste sa odhlásiť a znova prihlásiť.
        Ak problém pretrváva, kontaktujte správcu systému.
      </p>
    );
  };

  if (!isCurrentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Profil nebol nájdený</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Tento profil neexistuje alebo nemáte k nemu prístup.
        </p>
        <Button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Späť na domovskú stránku
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/10">
            <User className="h-10 w-10 text-primary/80" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-3 text-amber-500 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h1 className="text-xl font-bold">Váš profil nie je úplný</h1>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Zdá sa, že registrácia nebola úplne dokončená. Pre vytvorenie profilu kliknite na tlačidlo nižšie,
          alebo sa odhláste a znova prihláste.
        </p>
        
        <div className="text-sm mb-4">
          <div className="font-medium">Aktuálne nastavenia:</div>
          <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
            <li>Používateľ: {user ? "Prihlásený" : "Neprihlásený"}</li>
            <li>Typ používateľa: {userType || "Nenastavený"}</li>
            <li>ID používateľa: {user?.id ? `${user.id.substring(0, 8)}...` : "Nedostupné"}</li>
            <li>Email potvrdený: {user?.email_confirmed_at ? "Áno" : "Nie"}</li>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Vyskytla sa chyba:</p>
            <p className="text-sm">{error}</p>
            {getErrorExplanation()}
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="flex flex-col gap-3">
          {!userType && (
            <>
              <p className="text-amber-600 font-medium text-sm">Najprv je potrebné vybrať typ používateľa:</p>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <Button
                  onClick={handleSetCraftsman}
                  className="w-full"
                  variant="default"
                >
                  Som remeselník
                </Button>
                <Button
                  onClick={handleSetCustomer}
                  className="w-full"
                  variant="outline"
                >
                  Som zákazník
                </Button>
              </div>
              <Separator className="my-2" />
            </>
          )}
          
          <Button 
            onClick={handleCreateProfile} 
            className="w-full flex items-center justify-center gap-2"
            disabled={!user || !userType || isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isCreating ? "Vytváranie profilu..." : "Vytvoriť profil"}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Domov
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Odhlásiť sa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNotFound;
