
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";

/**
 * Hook for fetching chat messages for a selected contact
 */
export const useChatMessages = (
  selectedContact: ChatContact | null, 
  markMessagesAsRead: (conversationId: string) => void
) => {
  const { user } = useAuth();

  // Fetch messages for selected contact with improved read status handling
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', selectedContact?.conversation_id],
    queryFn: async () => {
      if (!selectedContact || !user) return [];
      
      if (!selectedContact.conversation_id) {
        console.log("No conversation ID for selected contact");
        return [];
      }
      
      console.log(`Fetching messages for conversation ${selectedContact.conversation_id}`);
      
      // First get messages
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
      
      // Mark messages as read - use more aggressive approach to ensure updates
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Found ${unreadMessages.length} unread messages - marking as read immediately`);
          
          // Use our explicit function to mark messages as read
          markMessagesAsRead(selectedContact.conversation_id);
        }
      }
      
      return data as Message[];
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    // Improve refetching strategy for better real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // No stale time for critical data
    gcTime: 0, // Updated from cacheTime to gcTime - the modern property name
    networkMode: 'always', // Always fetch from network, don't use cache for critical data
  });

  return { messages, refetchMessages };
};
