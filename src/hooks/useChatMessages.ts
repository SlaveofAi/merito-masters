
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
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        // Mark unread messages as read
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          // Mark each message as read individually to avoid race conditions
          for (const msg of unreadMessages) {
            await supabase
              .from('chat_messages')
              .update({ read: true })
              .eq('id', msg.id);
          }
          
          // Refresh contact list to update unread counts
          refetchContacts();
        }
        
        // Process messages
        return data.map(msg => processMessageData(msg, user.id));
      } catch (error) {
        console.error("Error processing messages:", error);
        return [];
      }
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    staleTime: 5000,
    refetchInterval: 10000, // Poll every 10 seconds as a fallback
  });
}
