
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user || !selectedContact?.conversation_id) return;
    
    // Create a unique channel name
    const channelName = `conversation-${selectedContact.conversation_id}`;
    
    // Set up subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedContact.conversation_id}`
        },
        () => {
          // On new message
          refetchMessages();
          refetchContacts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedContact.conversation_id}`
        },
        () => {
          // On message updates (like read status)
          refetchContacts();
        }
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts]);
  
  // Return empty object since this hook is used for its side effects
  return {};
};
