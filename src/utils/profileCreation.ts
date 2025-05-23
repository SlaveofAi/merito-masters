
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
    
    // First ensure user type is set in the database with retry logic
    let userTypeSet = false;
    let typeRetries = 3;
    
    while (!userTypeSet && typeRetries > 0) {
      try {
        const { error: userTypeError } = await supabase
          .from('user_types')
          .upsert({
            user_id: user.id,
            user_type: userType
          }, {
            onConflict: 'user_id'
          });
        
        if (userTypeError) {
          console.error(`Error setting user type (retry ${3-typeRetries+1}/3):`, userTypeError);
          typeRetries--;
          
          if (typeRetries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          console.log("User type set successfully:", userType);
          userTypeSet = true;
          
          // Store user type in localStorage and sessionStorage as backup
          try {
            localStorage.setItem("userType", userType);
            sessionStorage.setItem("userType", userType);
          } catch (e) {
            console.error("Error saving user type to storage:", e);
          }
          
          // Wait for the RLS policies to take effect
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.error("Error in userType setting:", e);
        typeRetries--;
        
        if (typeRetries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!userTypeSet) {
      console.warn("Could not set user type after multiple retries");
      // Continue anyway and try to create profile
    }
    
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
      console.log("With trade category:", tradeCategory);
      
      // Retry logic for creating profile
      let retries = 5; // Increased number of retries
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          const { error: insertError } = await supabase
            .from('craftsman_profiles')
            .insert({
              id: user.id,
              name,
              email,
              location: 'Bratislava',
              trade_category: tradeCategory,
              custom_specialization: tradeCategory,
              phone: null,
              description: 'Zadajte popis vašich služieb',
              profile_image_url: null
            });
            
          if (insertError) {
            console.error(`Error creating craftsman profile (retry ${5-retries+1}/5):`, insertError);
            
            if (retries > 1) {
              // Use exponential backoff for retries
              const delay = 1000 * Math.pow(2, 5-retries);
              await new Promise(resolve => setTimeout(resolve, delay));
              retries--;
            } else {
              toast.error(`Chyba pri vytváraní profilu remeselníka: ${insertError.message}`);
              throw insertError;
            }
          } else {
            console.log("Default craftsman profile created successfully");
            toast.success("Profil bol vytvorený", { duration: 3000 });
            success = true;
            
            // Store user type in localStorage as a backup
            try {
              localStorage.setItem("userType", userType);
            } catch (e) {
              console.error("Error saving user type to localStorage:", e);
            }
            
            setTimeout(() => {
              onSuccess();
            }, 500);
          }
        } catch (err) {
          console.error(`Error in profile creation try/catch block (retry ${5-retries+1}/5):`, err);
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, 5-retries)));
        }
      }
    } else { // Customer profile creation
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
      let retries = 5; // Increased number of retries
      let success = false;
      
      while (retries > 0 && !success) {
        try {
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
            console.error(`Error creating customer profile (retry ${5-retries+1}/5):`, insertError);
            
            if (retries > 1) {
              // Use exponential backoff for retries
              const delay = 1000 * Math.pow(2, 5-retries);
              await new Promise(resolve => setTimeout(resolve, delay));
              retries--;
            } else {
              toast.error(`Chyba pri vytváraní profilu zákazníka: ${insertError.message}`);
              throw insertError;
            }
          } else {
            console.log("Default customer profile created successfully");
            toast.success("Profil bol vytvorený", { duration: 3000 });
            success = true;
            
            // Store user type in localStorage as a backup
            try {
              localStorage.setItem("userType", userType);
            } catch (e) {
              console.error("Error saving user type to localStorage:", e);
            }
            
            setTimeout(() => {
              onSuccess();
            }, 500);
          }
        } catch (err) {
          console.error(`Error in profile creation try/catch block (retry ${5-retries+1}/5):`, err);
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, 5-retries)));
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
