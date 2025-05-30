
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createToppedPayment = async () => {
    if (!user) {
      toast.error("Musíte sa prihlásiť pre pokračovanie");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating topped payment session for user:", user.id);
      
      const { data, error } = await supabase.functions.invoke('create-topped-session', {
        body: { 
          days: 7,
          amount: 999 // €9.99 in cents
        }
      });

      if (error) {
        console.error("Error creating topped payment:", error);
        toast.error("Chyba pri vytváraní platby");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to checkout:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error in createToppedPayment:", error);
      toast.error("Nastala chyba pri vytváraní platby");
    } finally {
      setLoading(false);
    }
  };

  return {
    createToppedPayment,
    loading,
  };
};
