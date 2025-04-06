
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatContact } from "@/types/chat";
import { BasicProfile } from "@/types/profile";

export function useContactDetails(selectedContact: ChatContact | null, user: any) {
  return useQuery({
    queryKey: ['contact-details', selectedContact?.id, selectedContact?.user_type],
    queryFn: async () => {
      if (!selectedContact || !user) return null;
      
      console.log(`Attempting to fetch details for contact ${selectedContact.id} of type ${selectedContact.user_type}`);
      
      try {
        // Determine which table to query based on the contact type
        const primaryTable = selectedContact.user_type === 'customer' 
          ? 'customer_profiles' 
          : 'craftsman_profiles';
        
        // Step 1: Try primary profile table first
        console.log(`First attempt: Querying ${primaryTable} for contact ${selectedContact.id}`);
        const { data: primaryData, error: primaryError } = await supabase
          .from(primaryTable)
          .select('*')
          .eq('id', selectedContact.id)
          .maybeSingle();
          
        if (!primaryError && primaryData) {
          console.log(`Successfully found contact in ${primaryTable}:`, primaryData);
          
          // Make sure we have a consistent profile shape regardless of the table source
          return {
            ...primaryData,
            user_type: selectedContact.user_type
          };
        }
        
        // If primary lookup failed, log the error
        if (primaryError) {
          console.error(`Error querying ${primaryTable}:`, primaryError);
        } else {
          console.log(`No data found in ${primaryTable} for id ${selectedContact.id}`);
        }
        
        // Step 2: Try the profiles table as fallback
        console.log(`Second attempt: Querying profiles table for contact ${selectedContact.id}`);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', selectedContact.id)
          .maybeSingle();
          
        if (!profileError && profileData) {
          console.log(`Found contact in profiles table:`, profileData);
          
          // Ensure the profile data has all the required fields
          const enhancedProfile: BasicProfile = {
            id: profileData.id,
            name: profileData.name || "Neznámy užívateľ",
            email: "",
            location: "",
            profile_image_url: null,
            phone: null,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
            user_type: selectedContact.user_type
          };
          
          return enhancedProfile;
        }
        
        if (profileError) {
          console.error("Error querying profiles table:", profileError);
        } else {
          console.log(`No data found in profiles table for id ${selectedContact.id}`);
        }
        
        // Step 3: Create a minimal profile from what we know if all lookups fail
        console.log(`Third attempt: Creating basic profile from contact info`);
        
        // Create a minimal profile from what we know
        return {
          id: selectedContact.id,
          name: selectedContact.name || "Neznámy užívateľ",
          email: "",
          profile_image_url: selectedContact.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "",
          phone: null,
          user_type: selectedContact.user_type
        };
      } catch (err) {
        console.error(`Error in contactDetails query:`, err);
        // Return a fallback profile rather than null
        return {
          id: selectedContact.id,
          name: selectedContact.name || "Neznámy užívateľ",
          email: "",
          profile_image_url: selectedContact.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "",
          phone: null,
          user_type: selectedContact.user_type
        };
      }
    },
    enabled: !!selectedContact?.id && !!user,
    gcTime: 0, // Use gcTime instead of cacheTime
  });
}
