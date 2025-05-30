
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setSubscriptionData({ subscribed: false });
      setLoading(false);
      return;
    }

    try {
      console.log("Checking subscription status for user:", user.id);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Error checking subscription:", error);
        toast.error("Chyba pri overovaní predplatného");
        return;
      }

      console.log("Subscription check result:", data);
      setSubscriptionData(data);
    } catch (error) {
      console.error("Error in checkSubscription:", error);
      toast.error("Nastala chyba pri overovaní predplatného");
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (plan: string = "basic") => {
    if (!user) {
      toast.error("Musíte sa prihlásiť pre pokračovanie");
      return;
    }

    try {
      console.log("Creating checkout session for plan:", plan);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) {
        console.error("Error creating checkout:", error);
        toast.error("Chyba pri vytváraní platby");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to checkout:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error in createCheckout:", error);
      toast.error("Nastala chyba pri vytváraní platby");
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error("Musíte sa prihlásiť pre pokračovanie");
      return;
    }

    try {
      console.log("Opening customer portal for user:", user.id);
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error("Error opening customer portal:", error);
        toast.error("Chyba pri otváraní správy predplatného");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to customer portal:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error in openCustomerPortal:", error);
      toast.error("Nastala chyba pri otváraní správy predplatného");
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscriptionData,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
