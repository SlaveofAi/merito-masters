
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const handleSelectCustomer = async () => {
    try {
      console.log("Setting user type to customer");
      await updateUserType('customer');
      toast.success("Vybrali ste si typ účtu: zákazník. Váš profil sa vytvára.");
      
      // Reload the page after a short delay to ensure state is updated
      setTimeout(() => {
        navigate("/profile/reviews", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Error setting user type to customer:", error);
      toast.error("Nastala chyba pri nastavení typu používateľa");
    }
  };

  const handleSelectCraftsman = async () => {
    try {
      console.log("Setting user type to craftsman");
      await updateUserType('craftsman');
      toast.success("Vybrali ste si typ účtu: remeselník. Váš profil sa vytvára.");
      
      // Reload the page after a short delay to ensure state is updated
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Error setting user type to craftsman:", error);
      toast.error("Nastala chyba pri nastavení typu používateľa");
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
              onClick={handleSelectCraftsman}
              className="w-full"
            >
              Som remeselník
            </Button>
            <Button 
              onClick={handleSelectCustomer}
              variant="outline"
              className="w-full"
            >
              Som zákazník
            </Button>
            <div className="text-sm text-muted-foreground mt-2">
              Alebo
            </div>
            <Button 
              onClick={() => navigate("/register")}
              variant="secondary"
              className="w-full"
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
