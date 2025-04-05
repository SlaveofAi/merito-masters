import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";
import { BasicProfile } from "@/types/profile";

export const useMessages = (selectedContact: ChatContact | null, refetchContacts: () => void) => {
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
      console.log("Messages data:", data);
      
      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read`);
          
          // Using a more reliable approach to update
          const { error: updateError } = await supabase
            .from('chat_messages')
            .update({ read: true })
            .in('id', unreadMessages.map(msg => msg.id));
          
          if (updateError) {
            console.error("Error marking messages as read:", updateError);
          } else {
            console.log("All messages marked as read");
            // Refresh contact list to update unread count
            refetchContacts();
          }
        }
      }
      
      // Return the messages with updated read status and properly parsed metadata
      return data.map(msg => {
        // Ensure the message is properly typed with metadata
        const typedMessage: Message = {
          ...msg,
          read: msg.receiver_id === user.id ? true : msg.read,
          // Handle metadata properly - it might be stored as a string in some database setups
          metadata: msg.metadata ? 
            (typeof msg.metadata === 'string' ? 
              JSON.parse(msg.metadata) : 
              msg.metadata) : 
            undefined
        };
        return typedMessage;
      });
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    gcTime: 0, // Use gcTime instead of cacheTime
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
    gcTime: 0, // Use gcTime instead of cacheTime
  });

  return {
    messages,
    refetchMessages,
    contactDetails,
    customerReviews
  };
};
