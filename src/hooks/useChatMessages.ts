
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
      if (!selectedContact?.conversation_id || !user) return [];
      
      try {
        console.log(`Fetching messages for conversation: ${selectedContact.conversation_id}`);
        console.log(`Current user ID: ${user.id}`);
        
        // Fetch messages
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
        
        console.log(`Retrieved ${data?.length || 0} messages for conversation ${selectedContact.conversation_id}`);
        
        if (!data || !Array.isArray(data)) {
          console.log("No messages found or data is not an array");
          return [];
        }
        
        // Identify unread messages sent to the current user
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read for user ${user.id}`);
          
          // Use a single update query for all unread messages
          const messageIds = unreadMessages.map(msg => msg.id);
          
          try {
            // Perform the update with immediate retry if it fails
            const updateMessage = async () => {
              const { error: updateError } = await supabase
                .from('chat_messages')
                .update({ read: true })
                .in('id', messageIds);
                
              if (updateError) {
                console.error("Error marking messages as read:", updateError);
                
                // If bulk update fails, try individual updates as fallback
                console.log("Attempting individual message updates as fallback");
                
                for (const id of messageIds) {
                  await supabase
                    .from('chat_messages')
                    .update({ read: true })
                    .eq('id', id);
                }
              }
            };
            
            // Execute update
            await updateMessage();
            
            console.log(`Successfully marked ${messageIds.length} messages as read`);
            
            // Trigger multiple contact refetches with increasing delays
            // This ensures the contact list updates with correct unread counts
            setTimeout(() => refetchContacts(), 100);
            setTimeout(() => refetchContacts(), 500);
            setTimeout(() => refetchContacts(), 1500);
          } catch (updateErr) {
            console.error("Error in update process:", updateErr);
          }
        } else {
          console.log("No unread messages to mark as read");
        }
        
        // Process messages for display
        const processedMessages = data.map(msg => {
          // Mark messages as read in the returned data if they were just updated
          if (msg.receiver_id === user.id && !msg.read) {
            msg.read = true;
          }
          return processMessageData(msg, user.id);
        });
        
        return processedMessages;
      } catch (error) {
        console.error("Error processing messages:", error);
        return [];
      }
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    staleTime: 0, // Always refetch when query is invalidated
    refetchOnWindowFocus: true, // Refetch when window regains focus
    gcTime: 0, // Don't keep old data in cache
  });
}
