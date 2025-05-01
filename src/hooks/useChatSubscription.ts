
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
    if (!user) return;
    
    console.log("Setting up chat subscriptions for user:", user.id);
    
    // Subscribe to all new messages for user to update unread counts
    const userMessagesChannel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          // Always refetch contacts to update unread counts
          refetchContacts();
          
          // Also refetch after a delay to ensure counts are updated
          setTimeout(() => {
            refetchContacts();
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log(`User messages subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error("Error with user messages channel. Reconnecting...");
          setTimeout(() => {
            userMessagesChannel.subscribe();
          }, 2000);
        }
      });

    // If a specific conversation is selected, subscribe to it
    let conversationChannel;
    if (selectedContact?.conversation_id) {
      const channelName = `conversation-${selectedContact.conversation_id}`;
      console.log(`Setting up subscription for conversation: ${selectedContact.conversation_id}`);
      
      conversationChannel = supabase
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
            console.log(`New message in conversation ${selectedContact.conversation_id}:`, payload);
            // Refetch messages for the current conversation
            refetchMessages();
            // Also refetch contacts to update unread counts
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
            console.log(`Message updated in conversation ${selectedContact.conversation_id}:`, payload);
            // Refetch messages for the current conversation
            refetchMessages();
            // Also refetch contacts to update unread counts
            refetchContacts();
            
            // Additional refetch with delay to ensure changes are reflected
            setTimeout(() => {
              refetchContacts();
              refetchMessages();
            }, 1000);
          }
        )
        .subscribe((status) => {
          console.log(`Conversation subscription status: ${status}`);
          if (status === 'CHANNEL_ERROR') {
            console.error("Error with conversation channel. Reconnecting...");
            setTimeout(() => {
              conversationChannel.subscribe();
            }, 2000);
          }
        });
    }
    
    // Cleanup function
    return () => {
      console.log("Cleaning up chat subscriptions");
      if (userMessagesChannel) {
        supabase.removeChannel(userMessagesChannel);
      }
      if (conversationChannel) {
        supabase.removeChannel(conversationChannel);
      }
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts]);
  
  return {};
};
