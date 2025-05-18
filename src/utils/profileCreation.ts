
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const createDefaultProfile = async (
  user: User | null,
  userType: 'customer' | 'craftsman' | null,
  isCurrentUser: boolean,
  onSuccess: () => void
) => {
  if (!user || !userType || !isCurrentUser) {
    const errorMsg = "Nemožno vytvoriť profil: používateľ nie je prihlásený alebo typ používateľa nie je nastavený";
    console.error(errorMsg, { user: !!user, userType, isCurrentUser });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    console.log("Creating default profile for user:", user.id, "userType:", userType);
    
    const email = user.email || '';
    const name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';
    
    // Get trade category from metadata if available (for craftsmen)
    const tradeCategory = user.user_metadata?.trade_category || 'Stolár';
    
    if (userType === 'craftsman') {
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('craftsman_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        
        // We'll try to proceed anyway, assuming the profile doesn't exist
        console.log("Proceeding with profile creation despite error");
      }
      
      if (existingProfile) {
        console.log("Craftsman profile already exists, fetching it");
        toast.success("Profil už existuje, načítavam ho");
        onSuccess();
        return;
      }
      
      console.log("Creating new craftsman profile for user:", user.id);
      
      // Retry logic for creating profile
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        const { error: insertError } = await supabase
          .from('craftsman_profiles')
          .insert({
            id: user.id,
            name,
            email,
            location: 'Bratislava',
            trade_category: tradeCategory, // Use the trade_category from metadata if available
            custom_specialization: tradeCategory, // Set the same value for custom specialization
            phone: null,
            description: 'Zadajte popis vašich služieb',
            profile_image_url: null
          });
          
        if (insertError) {
          console.error(`Error creating craftsman profile (retry ${3-retries+1}/3):`, insertError);
          
          if (retries > 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            toast.error(`Chyba pri vytváraní profilu remeselníka: ${insertError.message}`);
            throw new Error(`Chyba pri vytváraní profilu remeselníka: ${insertError.message}`);
          }
        } else {
          console.log("Default craftsman profile created successfully");
          toast.success("Profil bol vytvorený", { duration: 3000 });
          success = true;
          
          // Don't try to update metadata here - it's causing the auth session missing error
          // Instead we'll store user type in localStorage as a backup
          try {
            localStorage.setItem("userType", userType);
          } catch (e) {
            console.error("Error saving user type to localStorage:", e);
          }
          
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      }
    } else {
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        
        // We'll try to proceed anyway, assuming the profile doesn't exist
        console.log("Proceeding with profile creation despite error");
      }
      
      if (existingProfile) {
        console.log("Customer profile already exists, fetching it");
        toast.success("Profil už existuje, načítavam ho");
        onSuccess();
        return;
      }
      
      console.log("Creating new customer profile for user:", user.id);
      
      // Retry logic for creating profile
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        const { error: insertError } = await supabase
          .from('customer_profiles')
          .insert({
            id: user.id,
            name,
            email,
            location: 'Bratislava',
            phone: null,
            profile_image_url: null
          });
          
        if (insertError) {
          console.error(`Error creating customer profile (retry ${3-retries+1}/3):`, insertError);
          
          if (retries > 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            toast.error(`Chyba pri vytváraní profilu zákazníka: ${insertError.message}`);
            throw new Error(`Chyba pri vytváraní profilu zákazníka: ${insertError.message}`);
          }
        } else {
          console.log("Default customer profile created successfully");
          toast.success("Profil bol vytvorený", { duration: 3000 });
          success = true;
          
          // Don't try to update metadata here - it's causing the auth session missing error
          // Instead we'll store user type in localStorage as a backup
          try {
            localStorage.setItem("userType", userType);
          } catch (e) {
            console.error("Error saving user type to localStorage:", e);
          }
          
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      }
    }
  } catch (error: any) {
    console.error("Error in createDefaultProfile:", error);
    toast.error("Nastala chyba pri vytváraní profilu", {
      description: error.message || "Neznáma chyba"
    });
    throw error;
  }
};
