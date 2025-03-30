
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const { user } = useAuth();

  const handleCreateProfile = () => {
    if (onCreateProfile) {
      toast.info("Pokúšam sa vytvoriť profil...");
      onCreateProfile();
    }
  };

  if (!isCurrentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Profil nebol nájdený</h1>
        <Button onClick={() => navigate("/")}>Späť na domovskú stránku</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Váš profil nie je úplný</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Zdá sa, že registrácia nebola úplne dokončená. Kliknite na tlačidlo nižšie pre vytvorenie profilu,
        alebo obnovte stránku.
      </p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 max-w-md">
          <p className="font-medium">Vyskytla sa chyba:</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Problém môže byť v nastaveniach databázy. Skúste sa odhlásiť a znova prihlásiť.</p>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate("/")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Späť na domovskú stránku
        </Button>
        <Button 
          onClick={handleCreateProfile} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Vytvoriť profil
        </Button>
      </div>
    </div>
  );
};

export default ProfileNotFound;
