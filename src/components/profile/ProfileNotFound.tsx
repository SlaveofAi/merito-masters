
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProfileNotFoundProps {
  isCurrentUser: boolean;
  onCreateProfile?: () => void;
}

const ProfileNotFound: React.FC<ProfileNotFoundProps> = ({ isCurrentUser, onCreateProfile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate("/")}
          variant="outline"
        >
          Späť na domovskú stránku
        </Button>
        <Button 
          onClick={onCreateProfile} 
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
