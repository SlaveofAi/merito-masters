
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
            read
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
        
        // Filter out null messages and then check for unread messages
        const validMessages = data.filter((msg): msg is NonNullable<typeof msg> => 
          msg !== null && typeof msg === 'object'
        );
        
        // Mark messages as read - safely check the data structure first
        const unreadMessages = validMessages.filter(msg => {
          return 'receiver_id' in msg && 
                 'read' in msg &&
                 msg.receiver_id === user.id && 
                 !msg.read;
        });
          
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read`);
          
          // Using a more reliable approach to update
          const updatePromises = unreadMessages.map(msg => {
            if ('id' in msg) {
              return supabase
                .from('chat_messages')
                .update({ read: true })
                .eq('id', msg.id);
            }
            return Promise.resolve({ data: null, error: new Error("Message missing ID") });
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
        const processedMessages = validMessages
          .map(msg => {
            try {
              const processed = processMessageData(msg, user.id);
              console.log("Processed message with ID:", processed.id);
              
              // Safely check if processed has metadata before logging
              if (processed.metadata) {
                console.log("Message has metadata:", processed.metadata);
              }
              
              return processed;
            } catch (err) {
              console.error(`Error processing message:`, err, msg);
              return null;
            }
          })
          .filter((msg): msg is Message => msg !== null);
        
        return processedMessages;
      } catch (error) {
        console.error("Error processing messages:", error);
        return [];
      }
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    gcTime: 0, // Use gcTime instead of cacheTime
    staleTime: 1000,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * (2 ** attempt), 30000),
  });
}
