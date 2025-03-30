import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, AlertTriangle, User, LogOut, AlertCircle, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  const { user, signOut, userType } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProfile = async () => {
    if (!onCreateProfile) {
      toast.error("Funkcia pre vytvorenie profilu nie je dostupná");
      return;
    }
    
    try {
      setIsCreating(true);
      toast.info("Pokúšam sa vytvoriť profil...");
      console.log("Attempting to create profile...");
      await onCreateProfile();
      // Don't set isCreating to false here as we want to keep the button disabled
      // until the profile creation process completes or fails
    } catch (error) {
      console.error("Error in handleCreateProfile:", error);
      setIsCreating(false); // Only set back to false if there's an error
      // Error is already handled by the createDefaultProfile function
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
          <p>Problém je pravdepodobne spôsobený nastaveniami oprávnení v databáze (Row Level Security).</p>
          <ol className="list-decimal list-inside space-y-1 pl-4">
            <li>Skúste sa odhlásiť a znova prihlásiť</li>
            <li>Ak problém pretrváva, môže byť potrebné nastaviť Row Level Security v Supabase</li>
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
