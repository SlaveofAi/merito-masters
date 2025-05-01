
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
    
    // Create a unique channel name for the user
    const userChannelName = `user-messages-${user.id}`;
    console.log(`Setting up global user subscription for ${userChannelName}`);
    
    // Set up a global subscription for the user to track all message changes
    const userChannel = supabase
      .channel(userChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received for user:', payload);
          refetchContacts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Message updated for user (read status):', payload);
          // Force refetch contacts to update unread counts properly
          refetchContacts();
        }
      )
      .subscribe((status) => {
        console.log(`User channel subscription status for ${userChannelName}:`, status);
      });
    
    // Also set up specific conversation subscription if a contact is selected
    let conversationChannel = null;
    
    if (selectedContact?.conversation_id) {
      const channelName = `conversation-${selectedContact.conversation_id}`;
      console.log(`Setting up conversation subscription for ${channelName}`);
      
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
            console.log('New message received in conversation:', payload);
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
            console.log('Message updated in conversation:', payload);
            refetchMessages();
            refetchContacts();
          }
        )
        .subscribe((status) => {
          console.log(`Conversation subscription status for ${channelName}:`, status);
        });
    }
    
    // Cleanup function
    return () => {
      console.log(`Removing user channel ${userChannelName}`);
      supabase.removeChannel(userChannel);
      
      if (conversationChannel) {
        const channelName = `conversation-${selectedContact?.conversation_id}`;
        console.log(`Removing conversation channel ${channelName}`);
        supabase.removeChannel(conversationChannel);
      }
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts]);
  
  return {};
};
