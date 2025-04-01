
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";
import { BasicProfile } from "@/types/profile";

export const useMessages = (selectedContact: ChatContact | null) => {
  const { user, userType } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for selected contact
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', selectedContact?.conversation_id],
    queryFn: async () => {
      if (!selectedContact || !user) return [];
      
      if (!selectedContact.conversation_id) {
        console.log("No conversation ID for selected contact");
        return [];
      }
      
      console.log(`Fetching messages for conversation ${selectedContact.conversation_id}`);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedContact.conversation_id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Nastala chyba pri načítaní správ");
        return [];
      }
      
      console.log(`Retrieved ${data?.length || 0} messages`);
      
      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read`);
          
          for (const msg of unreadMessages) {
            const { error: updateError } = await supabase
              .from('chat_messages')
              .update({ read: true })
              .eq('id', msg.id);
              
            if (updateError) {
              console.error("Error marking message as read:", updateError);
            }
          }
          
          // Refresh contact list to update unread count
          queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
        }
      }
      
      return data as Message[];
    },
    enabled: !!selectedContact?.conversation_id && !!user,
  });

  // Fetch detailed contact information with better error handling and fallbacks
  const { data: contactDetails } = useQuery({
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
          return primaryData;
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
          // Convert basic profile to expected format with all required fields
          return {
            id: profileData.id,
            name: profileData.name || "Neznámy užívateľ",
            email: "", // Adding missing fields with default values
            location: "",
            profile_image_url: null,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
            phone: null,
            user_type: selectedContact.user_type
          };
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
          phone: null
        };
      }
    },
    enabled: !!selectedContact?.id && !!user,
  });
  
  // For customers, fetch their reviews
  const { data: customerReviews = [] } = useQuery({
    queryKey: ['customer-reviews', selectedContact?.id, selectedContact?.user_type],
    queryFn: async () => {
      if (!selectedContact || !user || selectedContact.user_type !== 'customer') return [];
      
      console.log(`Fetching reviews written by customer ${selectedContact.id}`);
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('customer_id', selectedContact.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching customer reviews:", error);
        return [];
      }
      
      console.log("Customer reviews fetched:", data);
      return data;
    },
    enabled: !!selectedContact?.id && !!user && selectedContact?.user_type === 'customer',
  });

  return {
    messages,
    refetchMessages,
    contactDetails,
    customerReviews
  };
};
