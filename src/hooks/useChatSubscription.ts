
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const subscriptionsRef = useRef<{ userChannel: any; conversationChannel: any }>({
    userChannel: null,
    conversationChannel: null
  });
  
  useEffect(() => {
    if (!user) return;
    
    // Create a unique channel name for the user
    const userChannelName = `user-messages-${user.id}-${Date.now()}`;
    console.log(`Setting up global user subscription for ${userChannelName}`);
    
    const setupUserChannel = () => {
      try {
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
              // Always refetch both messages and contacts on new message
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
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Message updated for user (read status):', payload);
              // Force refetch contacts AND messages to ensure everything is in sync
              refetchMessages();
              refetchContacts();
            }
          )
          .subscribe((status) => {
            console.log(`User channel subscription status for ${userChannelName}:`, status);
          });
          
        subscriptionsRef.current.userChannel = userChannel;
      } catch (err) {
        console.error("Error setting up user subscription:", err);
      }
    };
    
    // Set up user channel with retry logic
    let retryAttempt = 0;
    const maxRetries = 3;
    
    const attemptSetup = () => {
      try {
        setupUserChannel();
      } catch (err) {
        retryAttempt++;
        if (retryAttempt < maxRetries) {
          console.log(`Retrying subscription setup (attempt ${retryAttempt})`);
          setTimeout(attemptSetup, 1000);
        } else {
          console.error("Failed to set up subscription after multiple attempts");
        }
      }
    };
    
    attemptSetup();
    
    // Also set up specific conversation subscription if a contact is selected
    if (selectedContact?.conversation_id) {
      try {
        const channelName = `conversation-${selectedContact.conversation_id}-${Date.now()}`;
        console.log(`Setting up conversation subscription for ${channelName}`);
        
        const conversationChannel = supabase
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
          
        subscriptionsRef.current.conversationChannel = conversationChannel;
      } catch (err) {
        console.error("Error setting up conversation subscription:", err);
      }
    }
    
    // Cleanup function
    return () => {
      try {
        console.log(`Removing user channel ${userChannelName}`);
        if (subscriptionsRef.current.userChannel) {
          supabase.removeChannel(subscriptionsRef.current.userChannel);
        }
        
        if (subscriptionsRef.current.conversationChannel) {
          console.log(`Removing conversation channel for ${selectedContact?.conversation_id}`);
          supabase.removeChannel(subscriptionsRef.current.conversationChannel);
        }
      } catch (err) {
        console.error("Error cleaning up channels:", err);
      }
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts]);
  
  return {};
};
