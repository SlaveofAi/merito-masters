
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const createDefaultProfile = async (
  user: User | null,
  userType: 'customer' | 'craftsman' | null,
  isCurrentUser: boolean,
  onSuccess: () => void
) => {
  console.log("=== createDefaultProfile called ===");
  console.log("User object:", user);
  console.log("User type:", userType);
  console.log("Is current user:", isCurrentUser);
  
  if (!user || !userType || !isCurrentUser) {
    const errorMsg = "Cannot create profile: missing required parameters";
    console.error(errorMsg, { 
      hasUser: !!user, 
      userType, 
      isCurrentUser,
      userId: user?.id
    });
    toast.error("Chyba pri vytváraní profilu: chýbajúce údaje");
    throw new Error(errorMsg);
  }
  
  try {
    console.log("Creating profile for user:", user.id, "type:", userType);
    
    const email = user.email || '';
    const name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';
    const tradeCategory = user.user_metadata?.trade_category || 'Stolár';
    
    // First ensure user type is set in the database
    const { error: userTypeError } = await supabase
      .from('user_types')
      .upsert({
        user_id: user.id,
        user_type: userType
      }, {
        onConflict: 'user_id'
      });
    
    if (userTypeError) {
      console.error("Error setting user type:", userTypeError);
      toast.error(`Chyba pri nastavení typu používateľa: ${userTypeError.message}`);
      throw userTypeError;
    }
    
    console.log("User type set successfully:", userType);
    
    if (userType === 'craftsman') {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('craftsman_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing craftsman profile:", checkError);
      }
      
      if (existingProfile) {
        console.log("Craftsman profile already exists");
        toast.success("Profil už existuje");
        onSuccess();
        return;
      }
      
      console.log("Creating new craftsman profile");
      
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
        console.error("Error creating craftsman profile:", insertError);
        toast.error(`Chyba pri vytváraní profilu remeselníka: ${insertError.message}`);
        throw insertError;
      }
      
      console.log("Craftsman profile created successfully");
      toast.success("Profil remeselníka bol vytvorený");
      
    } else {
      // Customer profile creation
      const { data: existingProfile, error: checkError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing customer profile:", checkError);
      }
      
      if (existingProfile) {
        console.log("Customer profile already exists");
        toast.success("Profil už existuje");
        onSuccess();
        return;
      }
      
      console.log("Creating new customer profile");
      
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
        console.error("Error creating customer profile:", insertError);
        toast.error(`Chyba pri vytváraní profilu zákazníka: ${insertError.message}`);
        throw insertError;
      }
      
      console.log("Customer profile created successfully");
      toast.success("Profil zákazníka bol vytvorený");
    }
    
    // Store user type in localStorage as backup
    localStorage.setItem("userType", userType);
    
    onSuccess();
    
  } catch (error: any) {
    console.error("Error in createDefaultProfile:", error);
    toast.error("Nastala chyba pri vytváraní profilu", {
      description: error.message || "Neznáma chyba"
    });
    throw error;
  }
};
