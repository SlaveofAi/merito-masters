
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, AlertTriangle, User, LogOut, AlertCircle, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createDefaultProfile } from "@/utils/profileCreation";

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

  console.log("=== PROFILE NOT FOUND DETAILED DEBUG ===");
  console.log("ProfileNotFound props:", { isCurrentUser, error });
  console.log("Auth state:", { 
    user: !!user, 
    userId: user?.id,
    userEmail: user?.email,
    userType,
    userMetadata: user?.user_metadata
  });

  // Automatically try to create a profile when component loads for current user
  useEffect(() => {
    if (isCurrentUser && user && userType && onCreateProfile && !isCreating) {
      console.log("Auto-creating profile for current user:", user.id, "with type:", userType);
      handleCreateProfile();
    }
  }, [isCurrentUser, user, userType, onCreateProfile]);

  const handleCreateProfile = async () => {
    if (!user || !userType) {
      console.log("Cannot create profile: missing user or userType", { user: !!user, userType });
      toast.error("Chýbajúce údaje pre vytvorenie profilu");
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log("Creating profile with user:", user.id, "userType:", userType);
      
      await createDefaultProfile(
        user,
        userType,
        isCurrentUser,
        () => {
          console.log("Profile created successfully");
          toast.success("Profil bol úspešne vytvorený!");
          
          // Reload page to reflect new profile
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      );
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Nepodarilo sa vytvoriť profil");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetCustomer = async () => {
    if (!user) return;
    try {
      console.log("Setting user type to customer");
      await updateUserType('customer');
      toast.success("Typ používateľa nastavený na zákazníka");
      setTimeout(() => {
        navigate('/profile/reviews', { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Error setting user type:", error);
      toast.error("Chyba pri nastavení typu používateľa");
    }
  };

  const handleSetCraftsman = async () => {
    if (!user) return;
    try {
      console.log("Setting user type to craftsman");
      await updateUserType('craftsman');
      toast.success("Typ používateľa nastavený na remeselníka");
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 1000);
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
          Zdá sa, že registrácia nebola úplne dokončená. Pre vytvorenie profilu kliknite na tlačidlo nižšie.
        </p>
        
        <div className="text-sm mb-4">
          <div className="font-medium">Informácie o ladení:</div>
          <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
            <li>Používateľ: {user ? "Prihlásený" : "Neprihlásený"}</li>
            <li>ID používateľa: {user?.id ? `${user.id.substring(0, 8)}...` : "Nedostupné"}</li>
            <li>Email: {user?.email || "Nedostupný"}</li>
            <li>Typ používateľa: {userType || "Nenastavený"}</li>
            <li>Email potvrdený: {user?.email_confirmed_at ? "Áno" : "Nie"}</li>
            <li>Metadáta: {user?.user_metadata ? JSON.stringify(user.user_metadata) : "Žiadne"}</li>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Vyskytla sa chyba:</p>
            <p className="text-sm">{error}</p>
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
