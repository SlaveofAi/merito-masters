
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";

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

  // Fetch detailed contact information
  const { data: contactDetails } = useQuery({
    queryKey: ['contact-details', selectedContact?.id, selectedContact?.user_type],
    queryFn: async () => {
      if (!selectedContact || !user) return null;
      
      // Determine which table to query based on the contact type
      const tableName = selectedContact.user_type === 'customer' 
        ? 'customer_profiles' 
        : 'craftsman_profiles';
      
      console.log(`Fetching ${tableName} details for contact ${selectedContact.id}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', selectedContact.id)
        .maybeSingle(); // Changed from single() to maybeSingle() to handle no data case
        
      if (error) {
        console.error(`Error fetching ${tableName} details:`, error);
        return null;
      }
      
      console.log("Contact details fetched:", data);
      return data;
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
