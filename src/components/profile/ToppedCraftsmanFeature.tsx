
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ToppedCraftsmanFeatureProps {
  isCurrentUser: boolean;
  profileData: any;
  onProfileUpdate: () => void;
}

const ToppedCraftsmanFeature: React.FC<ToppedCraftsmanFeatureProps> = ({
  isCurrentUser,
  profileData,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isTopped = profileData?.is_topped || false;
  const toppedUntil = profileData?.topped_until ? new Date(profileData.topped_until) : null;
  const isActive = isTopped && toppedUntil && new Date() < toppedUntil;

  const handlePayment = async () => {
    if (!user) {
      toast.error("Musíte byť prihlásený");
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-topped-session', {
        body: { days: 7, amount: 1000 } // 10 EUR for 7 days
      });

      if (error) throw error;
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error("Error creating topped session:", error);
      toast.error("Nepodarilo sa vytvoriť platbu", { 
        description: error.message || "Skúste to prosím neskôr" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check payment status if there's a topped=success query parameter
  React.useEffect(() => {
    const checkPaymentStatus = async () => {
      const url = new URL(window.location.href);
      const toppedStatus = url.searchParams.get('topped');
      const sessionId = localStorage.getItem('topped_session_id');
      
      if (toppedStatus === 'success' && sessionId) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase.functions.invoke('verify-topped-payment', {
            body: { sessionId }
          });
          
          if (error) throw error;
          
          if (data.success) {
            toast.success("Vaša platba bola úspešne spracovaná", {
              description: "Váš profil je teraz zvýraznený na vrchole výsledkov vyhľadávania"
            });
            // Clear the session ID from localStorage
            localStorage.removeItem('topped_session_id');
            // Refresh the profile data to show the updated topped status
            onProfileUpdate();
            // Remove the query parameter from the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            toast.error("Platba nebola dokončená", {
              description: "Skúste to prosím znova neskôr"
            });
          }
        } catch (error: any) {
          console.error("Error verifying payment:", error);
          toast.error("Chyba pri overovaní platby", {
            description: error.message || "Skúste to prosím neskôr"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkPaymentStatus();
  }, [onProfileUpdate]);

  // If not current user and not topped, don't show anything
  if (!isCurrentUser && !isActive) {
    return null;
  }

  return (
    <Card className={`${isActive ? 'border-yellow-400' : 'border-gray-200'} mb-6`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
              Zvýraznený profil
            </CardTitle>
            <CardDescription>
              Zobrazte svoj profil na vrchu výsledkov vyhľadávania
            </CardDescription>
          </div>
          {isActive && (
            <Badge variant="outline" className="border-yellow-400 text-yellow-600 px-3 py-1">
              <CheckCircle className="w-3 h-3 mr-1" /> Aktívne
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isActive ? (
          <div className="text-sm text-muted-foreground">
            <p>
              Váš profil je zvýraznený a zobrazuje sa na vrchole výsledkov vyhľadávania do{" "}
              <span className="font-semibold">
                {formatDistanceToNow(toppedUntil, { addSuffix: true })}
              </span>
            </p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>
              {isCurrentUser ? (
                "Získajte viac zákaziek! Zvýraznite svoj profil v kategórii i výsledkoch vyhľadávania."
              ) : (
                "Tento profil je zvýraznený a zobrazuje sa na vrchole výsledkov vyhľadávania."
              )}
            </p>
          </div>
        )}
      </CardContent>

      {isCurrentUser && !isActive && (
        <CardFooter className="pt-0">
          <Button 
            onClick={handlePayment} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Spracovanie</>
            ) : (
              <>Zvýrazniť profil na 7 dní (10 €)</>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ToppedCraftsmanFeature;
