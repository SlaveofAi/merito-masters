
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
        // Check if the column metadata exists in the table
        const { data: tableInfo, error: tableError } = await supabase
          .from('chat_messages')
          .select('metadata')
          .limit(1);
          
        if (tableError) {
          console.error("Error checking metadata column:", tableError);
          // Continue anyway - we'll handle missing metadata in the processMessageData function
        }
        
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
        console.log("Raw message data:", data);
        
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
        
        // Return the messages with updated read status and processed metadata
        const processedMessages = data.map(msg => {
          const processed = processMessageData(msg, user.id);
          console.log("Processed message:", processed);
          return processed;
        });
        
        return processedMessages;
      } catch (error) {
        console.error("Error processing messages:", error);
        return [];
      }
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    gcTime: 0, // Use gcTime instead of cacheTime
  });
}
