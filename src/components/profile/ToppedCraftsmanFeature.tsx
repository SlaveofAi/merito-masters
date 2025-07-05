import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, CheckCircle, AlertTriangle, RefreshCw, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  
  // Actual values from profileData
  const isTopped = profileData?.is_topped || false;
  const toppedUntil = profileData?.topped_until ? new Date(profileData.topped_until) : null;
  const isActive = isTopped && toppedUntil && new Date() < toppedUntil;

  // Function to check if topped status has expired and update it
  const checkAndUpdateToppedExpiration = async () => {
    if (!isCurrentUser || !isTopped || !toppedUntil) return;
    
    const now = new Date();
    const expirationTime = new Date(toppedUntil);
    
    console.log("Checking topped expiration:", {
      now: now.toISOString(),
      expirationTime: expirationTime.toISOString(),
      isExpired: now > expirationTime
    });
    
    if (now > expirationTime) {
      console.log("Topped status expired, updating profile");
      
      try {
        // Update the craftsman profile to remove topped status
        const { error } = await supabase
          .from('craftsman_profiles')
          .update({ 
            is_topped: false,
            topped_until: null 
          })
          .eq('id', profileData.id);
          
        if (error) {
          console.error("Error updating topped status:", error);
          return;
        }
        
        console.log("Successfully updated topped status to expired");
        
        // Create notification about expiration
        await createNotification(
          profileData.id, 
          "Premium profil vypršal", 
          "Váš prémiový profil vypršal. Pre pokračovanie prémiových výhod si obnovte platbu."
        );
        
        // Refresh the profile data
        onProfileUpdate();
        
        toast.info("Váš premium profil vypršal", {
          description: "Obnovte platbu pre pokračovanie prémiových výhod"
        });
      } catch (error) {
        console.error("Error checking topped expiration:", error);
      }
    }
  };
  
  // Create notification function
  const createNotification = async (userId: string, title: string, content: string) => {
    try {
      if (!userId) return;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          content,
          type: "topped_status",
          read: false,
          metadata: {
            status: "topped",
            topped_until: toppedUntil?.toISOString()
          }
        });
        
      if (error) {
        console.error("Error creating notification:", error);
      }
    } catch (error) {
      console.error("Error in createNotification:", error);
    }
  };

  const handlePayment = async () => {
    if (!user || !session) {
      toast.error("Musíte byť prihlásený");
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorDetails(null);
      setErrorCode(null);
      
      console.log("Creating Stripe checkout session...");
      
      // Call the Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-topped-session', {
        body: {
          days: 7,
          amount: 999 // 9.99 EUR in cents
        }
      });
      
      if (error) {
        console.error("Error from create-topped-session:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL received");
      }
      
      console.log("Checkout session created, redirecting to:", data.url);
      
      // Store session ID for verification
      if (data.sessionId) {
        sessionStorage.setItem('topped_session_id', data.sessionId);
        localStorage.setItem('topped_session_id', data.sessionId);
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error("Error creating topped session:", error);
      setHasError(true);
      setErrorDetails(error.message || "Unknown error");
      setErrorCode(error.errorCode || "client_error");
      toast.error("Nepodarilo sa vytvoriť platbu", { 
        description: "Skúste to prosím neskôr. Ak problém pretrváva, kontaktujte podporu." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check payment status if there's a topped=success query parameter
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const url = new URL(window.location.href);
      const toppedStatus = url.searchParams.get('topped');
      const sessionId = sessionStorage.getItem('topped_session_id') || localStorage.getItem('topped_session_id');
      
      if (toppedStatus === 'success' && sessionId) {
        try {
          setIsLoading(true);
          setHasError(false);
          setErrorCode(null);
          
          console.log("Verifying payment for session:", sessionId);
          
          // Call the verification function
          const { data, error } = await supabase.functions.invoke('verify-topped-payment', {
            body: { sessionId }
          });
          
          if (error) {
            console.error("Error verifying payment:", error);
            throw new Error(error.message || "Payment verification failed");
          }
          
          if (data?.success) {
            // Create notification
            await createNotification(
              profileData.id, 
              "Premium profil aktivovaný", 
              "Váš profil je teraz zvýraznený na vrchole výsledkov vyhľadávania počas nasledujúcich 7 dní."
            );
            
            // Clear the session ID from storage
            sessionStorage.removeItem('topped_session_id');
            localStorage.removeItem('topped_session_id');
            
            // Remove the query parameter from the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Call the update function to refresh the profile
            if (onProfileUpdate) {
              onProfileUpdate();
            }
            
            // Success toast
            toast.success("Premium profil aktivovaný", {
              description: "Váš profil je teraz zvýraznený na vrchole výsledkov vyhľadávania."
            });
          } else {
            throw new Error(`Payment not completed. Status: ${data?.status || 'unknown'}`);
          }
          
        } catch (error: any) {
          console.error("Error verifying payment:", error);
          setHasError(true);
          setErrorDetails(error.message || "Unknown error");
          setErrorCode("verification_error");
          toast.error("Chyba pri overovaní platby", {
            description: "Skúste to prosím neskôr. Ak problém pretrváva, kontaktujte podporu."
          });
        } finally {
          setIsLoading(false);
        }
      } else if (toppedStatus === 'canceled') {
        toast.info("Platba bola zrušená");
        // Clear the query parameter from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkPaymentStatus();
  }, [onProfileUpdate, profileData, user]);
  
  // Check for topped status expiration - more frequent checks
  useEffect(() => {
    // Initial check
    checkAndUpdateToppedExpiration();
    
    // Check every 5 minutes instead of every hour for more responsive expiration
    const interval = setInterval(() => {
      checkAndUpdateToppedExpiration();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [isTopped, toppedUntil, isCurrentUser, profileData?.id]);

  // Also check when component mounts or when toppedUntil changes
  useEffect(() => {
    if (isCurrentUser && toppedUntil) {
      checkAndUpdateToppedExpiration();
    }
  }, [toppedUntil, isCurrentUser]);

  // Helper function to get user-friendly error message
  const getErrorMessage = () => {
    if (errorCode === "stripe_api_key_invalid" || errorCode === "invalid_api_key") {
      return "Konfiguračná chyba platobného systému. Prosím kontaktujte administrátora.";
    } else if (errorCode === "user_not_authenticated") {
      return "Pre dokončenie platby sa musíte prihlásiť.";
    } else if (errorCode?.includes("craftsman_profile")) {
      return "Profil remeselníka nebol nájdený. Skontrolujte, či máte správne nastavený profil.";
    } else {
      return "Služba momentálne nie je dostupná. Skúste to prosím neskôr.";
    }
  };

  // If not current user and not topped, don't show anything
  if (!isCurrentUser && !isActive) {
    return null;
  }
  
  // If it's topped but not the current user, don't show the card
  if (!isCurrentUser && isActive) {
    return null;
  }

  return (
    <>
      <Card className={`${isActive ? 'border-yellow-400 bg-yellow-50/30' : hasError ? 'border-red-200' : 'border-gray-200'} mb-6`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                {isActive ? (
                  <Crown className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                ) : (
                  <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
                )}
                {isActive ? "Premium profil" : "Zvýraznený profil"}
              </CardTitle>
              <CardDescription>
                {isActive ? 
                  "Váš profil je zvýraznený na vrchole výsledkov vyhľadávania" : 
                  "Zobrazte svoj profil na vrchu výsledkov vyhľadávania"
                }
              </CardDescription>
            </div>
            {isActive && (
              <Badge variant="outline" className="border-yellow-400 text-yellow-600 bg-yellow-100 px-3 py-1">
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
          
          {hasError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md text-sm flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-700">Nepodarilo sa spustiť platbu</p>
                <p className="text-red-600">{getErrorMessage()}</p>
                <Button 
                  variant="link" 
                  className="text-red-700 p-0 h-auto mt-1" 
                  onClick={() => setIsErrorDialogOpen(true)}
                >
                  Zobraziť detaily chyby
                </Button>
              </div>
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
                <>Získať premium profil na 7 dní (9,99 €)</>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detaily chyby</DialogTitle>
            <DialogDescription>
              Technické informácie o chybe
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-100 p-3 rounded-md overflow-x-auto">
            <code className="text-xs text-red-600 whitespace-pre-wrap break-all">
              {errorDetails || "No error details available"}
              {errorCode && `\n\nError code: ${errorCode}`}
            </code>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsErrorDialogOpen(false)}>
              Zavrieť
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setHasError(false);
                setErrorDetails(null);
                setErrorCode(null);
                toast.info("Skúšam znova...");
                setTimeout(handlePayment, 500);
              }}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Skúsiť znova
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToppedCraftsmanFeature;
