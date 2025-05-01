
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
        console.log(`Current user: ${user.id}, type: ${user.user_type || user?.user_metadata?.user_type}`);
        
        // Fetch messages
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', selectedContact.conversation_id)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching messages:", error);
          return [];
        }
        
        console.log(`Retrieved ${data?.length || 0} messages for conversation ${selectedContact.conversation_id}`);
        
        if (!data || !Array.isArray(data)) {
          console.log("No messages found or data is not an array");
          return [];
        }
        
        // Mark unread messages as read if they are sent to the current user
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read for conversation ${selectedContact.conversation_id}`);
          
          // CRITICAL FIX: Use direct database update with transaction for more reliable updates
          try {
            // Get message IDs for batch update
            const messageIds = unreadMessages.map(msg => msg.id);
            console.log("Message IDs to mark as read:", messageIds);
            
            // Update read status in multiple attempts with longer timeouts between retries
            let updateAttempts = 0;
            const maxAttempts = 5; // Increased max attempts
            let updateSuccess = false;
            
            while (updateAttempts < maxAttempts && !updateSuccess) {
              // Introduce a delay before each update attempt (longer with each try)
              if (updateAttempts > 0) {
                const delay = 500 * Math.pow(2, updateAttempts); // Exponential backoff
                console.log(`Waiting ${delay}ms before retry attempt ${updateAttempts + 1}`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
              
              const { error: updateError } = await supabase
                .from('chat_messages')
                .update({ read: true })
                .in('id', messageIds);
                
              if (updateError) {
                console.error(`Attempt ${updateAttempts + 1} - Error marking messages as read:`, updateError);
                updateAttempts++;
              } else {
                console.log(`Successfully marked ${messageIds.length} messages as read (attempt ${updateAttempts + 1})`);
                updateSuccess = true;
                
                // Update the local data to reflect read status changes immediately
                data.forEach(msg => {
                  if (messageIds.includes(msg.id)) {
                    msg.read = true;
                  }
                });
                
                // IMPROVED: More aggressive contact refetch strategy with staggered waves
                // The first wave comes faster to update UI quickly
                const refetchWaves = [
                  { delay: 100, message: "Immediate contact refetch" },
                  { delay: 500, message: "First wave contact refetch" },
                  { delay: 1200, message: "Second wave contact refetch" },
                  { delay: 2500, message: "Third wave contact refetch" },
                  { delay: 5000, message: "Fourth wave contact refetch" },
                  { delay: 10000, message: "Final contact refetch" },
                  { delay: 15000, message: "Extended contact refetch" }
                ];
                
                // Launch all refetch waves
                refetchWaves.forEach(wave => {
                  setTimeout(() => {
                    console.log(wave.message);
                    refetchContacts();
                  }, wave.delay);
                });
                
                // Perform immediate additional direct database query to verify read status update
                setTimeout(async () => {
                  try {
                    const { data: verifyData, error: verifyError } = await supabase
                      .from('chat_messages')
                      .select('id, read')
                      .in('id', messageIds);
                      
                    if (!verifyError && verifyData) {
                      const stillUnread = verifyData.filter(msg => !msg.read).length;
                      console.log(`Verification: ${stillUnread} of ${messageIds.length} messages still marked as unread`);
                      
                      // If some messages still unread, force another update
                      if (stillUnread > 0) {
                        console.log("Forcing additional read status update for remaining unread messages");
                        const stillUnreadIds = verifyData.filter(msg => !msg.read).map(msg => msg.id);
                        
                        await supabase
                          .from('chat_messages')
                          .update({ read: true })
                          .in('id', stillUnreadIds);
                          
                        // Force another round of contact refetches
                        setTimeout(() => refetchContacts(), 1000);
                        setTimeout(() => refetchContacts(), 3000);
                      }
                    }
                  } catch (err) {
                    console.error("Error during verification check:", err);
                  }
                }, 2000);
              }
            }
            
            if (!updateSuccess) {
              console.error("Failed to mark messages as read after multiple attempts");
              // Try one more approach - update messages one by one as a last resort
              let individualSuccess = 0;
              
              for (const msgId of messageIds) {
                try {
                  const { error } = await supabase
                    .from('chat_messages')
                    .update({ read: true })
                    .eq('id', msgId);
                    
                  if (!error) {
                    individualSuccess++;
                    // Update the local data as well
                    const msgIndex = data.findIndex(m => m.id === msgId);
                    if (msgIndex >= 0) data[msgIndex].read = true;
                  }
                } catch (err) {
                  console.error(`Error updating individual message ${msgId}:`, err);
                }
              }
              
              console.log(`Individual updates: ${individualSuccess} of ${messageIds.length} messages marked as read`);
              if (individualSuccess > 0) {
                // Some messages were successfully marked as read, trigger refetch
                setTimeout(() => refetchContacts(), 1000);
                setTimeout(() => refetchContacts(), 3000);
              }
            }
          } catch (err) {
            console.error("Critical error in read status update:", err);
          }
        } else {
          console.log("No unread messages to mark as read");
        }
        
        // Process messages
        const processedMessages = data.map(msg => processMessageData(msg, user.id));
        console.log(`Processed ${processedMessages.length} messages`);
        return processedMessages;
      } catch (error) {
        console.error("Error in useChatMessages:", error);
        return [];
      }
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    staleTime: 0, // Don't cache data to ensure we always get fresh data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    gcTime: 0, // Don't keep old data in cache
  });
}
