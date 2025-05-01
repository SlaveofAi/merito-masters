
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
    
    console.log(`Setting up subscription for ${channelName}`);
    
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
        (payload) => {
          console.log('New message received:', payload);
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
        (payload) => {
          console.log('Message updated:', payload);
          // On message updates (like read status)
          refetchMessages();
          refetchContacts();
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelName}:`, status);
      });
    
    // Also subscribe to all conversations for the current user to update badges across all chats
    const userChannelName = `user-messages-${user.id}`;
    
    const userChannel = supabase
      .channel(userChannelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          console.log('Any user message updated (read status changed)');
          refetchContacts();
        }
      )
      .subscribe((status) => {
        console.log(`User messages subscription status:`, status);
      });
    
    // Cleanup function
    return () => {
      console.log(`Removing channel ${channelName}`);
      supabase.removeChannel(channel);
      supabase.removeChannel(userChannel);
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts]);
  
  return {};
};
