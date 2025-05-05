
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserTypeSelectorProps {
  userId: string;
  userEmail?: string | null;
  updateUserType: (type: 'craftsman' | 'customer') => Promise<void>;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ 
  userId, 
  userEmail, 
  updateUserType 
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<'craftsman' | 'customer' | null>(null);

  const handleSelectUserType = async (type: 'craftsman' | 'customer') => {
    try {
      setIsProcessing(type);
      console.log(`Setting user type to ${type}`);
      
      await updateUserType(type);
      
      toast.success(`Vybrali ste si typ účtu: ${type === 'craftsman' ? 'remeselník' : 'zákazník'}. Váš profil sa vytvára.`);
      
      // Reload the page after a short delay to ensure state is updated
      setTimeout(() => {
        if (type === 'craftsman') {
          navigate("/profile", { replace: true });
        } else {
          navigate("/profile/reviews", { replace: true });
        }
      }, 1500);
    } catch (error) {
      console.error(`Error setting user type to ${type}:`, error);
      toast.error("Nastala chyba pri nastavení typu používateľa");
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-xl font-bold mb-4">Typ používateľa nie je nastavený</h1>
        <p className="mb-4">
          Váš typ používateľa (zákazník alebo remeselník) nie je nastavený. 
          Toto je potrebné pre správne fungovanie profilu.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-amber-600">
            Je potrebné vybrať si typ účtu nižšie pre vytvorenie profilu.
          </p>
          <div className="bg-gray-50 p-3 rounded text-left text-sm">
            <p className="font-medium">Aktuálne informácie:</p>
            <ul className="list-disc list-inside mt-1">
              <li>ID používateľa: {userId.substring(0, 8)}...</li>
              <li>Email: {userEmail}</li>
              <li>Typ používateľa: <span className="text-red-500">Nenastavený</span></li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <p className="font-medium">Vyberte typ používateľa:</p>
            <Button 
              onClick={() => handleSelectUserType('craftsman')}
              className="w-full"
              disabled={isProcessing !== null}
            >
              {isProcessing === 'craftsman' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Spracovávam...
                </>
              ) : (
                "Som remeselník"
              )}
            </Button>
            <Button 
              onClick={() => handleSelectUserType('customer')}
              variant="outline"
              className="w-full"
              disabled={isProcessing !== null}
            >
              {isProcessing === 'customer' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Spracovávam...
                </>
              ) : (
                "Som zákazník"
              )}
            </Button>
            <div className="text-sm text-muted-foreground mt-2">
              Alebo
            </div>
            <Button 
              onClick={() => navigate("/register")}
              variant="secondary"
              className="w-full"
              disabled={isProcessing !== null}
            >
              Prejsť na registráciu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
