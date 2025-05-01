
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
        console.log(`Current user type: ${user.user_type || user?.user_metadata?.user_type}`);
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
        
        // Mark unread messages as read if they are sent to the current user
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Marking ${unreadMessages.length} messages as read for conversation ${selectedContact.conversation_id}`);
          
          // Use a single batch update instead of individual updates for better performance
          const messageIds = unreadMessages.map(msg => msg.id);
          
          // CRITICAL FIX: Force immediate update in the database with explicit transaction
          const { error: updateError } = await supabase
            .from('chat_messages')
            .update({ read: true })
            .in('id', messageIds);
          
          if (updateError) {
            console.error("Error marking messages as read:", updateError);
          } else {
            console.log(`Successfully marked ${unreadMessages.length} messages as read`);
            
            // Update the local data to reflect read status changes immediately
            data.forEach(msg => {
              if (messageIds.includes(msg.id)) {
                msg.read = true;
              }
            });
            
            // Force multiple waves of contacts refetches with increasing delays
            // to ensure the database has time to complete its operations
            setTimeout(() => {
              console.log("First wave of contacts refetch after marking messages as read");
              refetchContacts();
            }, 500);
            
            setTimeout(() => {
              console.log("Second wave of contacts refetch to ensure unread counts are updated");
              refetchContacts();
            }, 1500);
            
            setTimeout(() => {
              console.log("Final contacts refetch to ensure UI is fully up to date");
              refetchContacts();
            }, 3000);
          }
        } else {
          console.log("No unread messages to mark as read");
        }
        
        // Process messages
        const processedMessages = data.map(msg => processMessageData(msg, user.id));
        console.log(`Processed ${processedMessages.length} messages`);
        return processedMessages;
      } catch (error) {
        console.error("Error processing messages:", error);
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
