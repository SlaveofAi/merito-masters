
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileNotFoundProps {
  isCurrentUser: boolean;
}

const ProfileNotFound: React.FC<ProfileNotFoundProps> = ({ isCurrentUser }) => {
  const navigate = useNavigate();

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
        Zdá sa, že registrácia nebola úplne dokončená. Môžete sa skúsiť odhlásiť a prihlásiť znova, 
        alebo sa obrátiť na podporu.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate("/")}
          variant="outline"
        >
          Späť na domovskú stránku
        </Button>
        <Button onClick={() => window.location.reload()}>
          Obnoviť stránku
        </Button>
      </div>
    </div>
  );
};

export default ProfileNotFound;
