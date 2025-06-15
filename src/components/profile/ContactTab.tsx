
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProfileData } from "@/types/profile";

interface ContactTabProps {
  profileData: ProfileData;
  isCurrentUser: boolean;
}

const ContactTab: React.FC<ContactTabProps> = ({ profileData, isCurrentUser }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSendMessage = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate("/login", { 
        state: { 
          from: "contact",
          returnTo: `/profile/${profileData.id}`
        } 
      });
      return;
    }

    // Navigate to messages with contact info
    navigate("/messages", {
      state: {
        from: "profile",
        contactId: profileData.id,
        contactName: profileData.name,
        contactType: profileData.user_type
      }
    });
  };

  if (isCurrentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Toto je váš profil - kontaktný formulár nie je dostupný.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">Kontaktovanie remeselníka</h3>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Môžete kontaktovať {profileData.name} cez náš bezpečný chat systém.
            </p>
            
            <Button onClick={handleSendMessage} className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Poslať správu
            </Button>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Prihlásenie potrebné</h4>
            </div>
            
            <p className="text-sm text-blue-700 mb-4">
              Pre kontaktovanie remeselníka sa musíte najprv zaregistrovať alebo prihlásiť.
            </p>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="flex-1"
              >
                Prihlásiť sa
              </Button>
              <Button 
                onClick={() => navigate("/register")}
                className="flex-1"
              >
                Registrovať sa
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactTab;
