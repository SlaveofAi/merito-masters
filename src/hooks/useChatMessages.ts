
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatContact, Message } from "@/types/chat";
import { processMessageData } from "@/utils/messageUtils";

export function useChatMessages(
  selectedContact: ChatContact | null, 
  user: any,
  refetchContacts: () => void
) {
  return useQuery({
    queryKey: ['chat-messages', selectedContact?.conversation_id],
    queryFn: async () => {
      if (!selectedContact || !user) return [];
      
      if (!selectedContact.conversation_id) {
        console.log("No conversation ID for selected contact");
        return [];
      }
      
      console.log(`Fetching messages for conversation ${selectedContact.conversation_id}`);
      
      try {
        // Use a direct query with explicit columns to avoid issues with table structure changes
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id, 
            conversation_id, 
            sender_id, 
            receiver_id, 
            content, 
            created_at, 
            read, 
            metadata
          `)
          .eq('conversation_id', selectedContact.conversation_id)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching messages:", error);
          toast.error("Nastala chyba pri načítaní správ");
          return [];
        }
        
        // Ensure data is an array before proceeding
        if (!data || !Array.isArray(data)) {
          console.error("No data returned or data is not an array");
          return [];
        }
        
        console.log(`Retrieved ${data.length} messages`);
        if (data.length > 0) {
          console.log("Raw message data sample:", data[0]);
        }
        
        // Mark messages as read - safely check the data structure first
        // Filter unread messages that are valid and require marking as read
        const unreadMessages = data.filter((msg) => {
          // First ensure msg is not null
          if (msg === null) {
            return false;
          }
          
          // Then check if it has the necessary properties
          return typeof msg === 'object' && 
                 'id' in msg &&
                 'receiver_id' in msg && 
                 'read' in msg &&
                 msg.receiver_id === user.id && 
                 !msg.read;
        });
          
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read`);
          
          // Using a more reliable approach to update
          const updatePromises = unreadMessages.map(msg => {
            if (msg && 'id' in msg) {
              return supabase
                .from('chat_messages')
                .update({ read: true })
                .eq('id', msg.id);
            }
            return Promise.resolve(); // Return resolved promise for any null entries
          });
          
          try {
            await Promise.all(updatePromises);
            console.log("All messages marked as read");
            // Refresh contact list to update unread count
            refetchContacts();
          } catch (updateError) {
            console.error("Error marking messages as read:", updateError);
          }
        }
        
        // Return the messages with updated read status and processed metadata
        const processedMessages = data.map(msg => {
          if (!msg) {
            console.error("Received null message in data array");
            return null;
          }
          
          const processed = processMessageData(msg, user.id);
          console.log("Processed message with ID:", processed.id);
          if (processed.metadata) {
            console.log("Message has metadata:", processed.metadata);
          }
          return processed;
        }).filter((msg): msg is Message => msg !== null);
        
        return processedMessages;
      } catch (error) {
        console.error("Error processing messages:", error);
        return [];
      }
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    gcTime: 0, // Use gcTime instead of cacheTime
    // Adding staleTime to prevent too frequent refetches
    staleTime: 1000,
    // Adding retry logic for better reliability
    retry: 3,
    retryDelay: attempt => Math.min(1000 * (2 ** attempt), 30000),
  });
}
