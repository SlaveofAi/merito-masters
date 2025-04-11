
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!user || !selectedContact?.conversation_id) return;

    const subscribeToChanges = async () => {
      try {
        console.log(`Setting up subscription for conversation ${selectedContact.conversation_id}`);
        
        // Subscribe to all changes in the conversation
        const channel = supabase
          .channel(`conversation:${selectedContact.conversation_id}`)
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
              refetchMessages();
              refetchContacts();
            }
          )
          .subscribe((status) => {
            console.log(`Supabase channel status: ${status}`);
            if (status === 'SUBSCRIBED') {
              setSubscribed(true);
              setSubscriptionFailed(false);
            } else if (status === 'CHANNEL_ERROR') {
              setSubscriptionFailed(true);
              setSubscribed(false);
            }
          });

        return () => {
          console.log('Cleaning up subscription');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Failed to set up realtime subscription:', error);
        setSubscriptionFailed(true);
        return () => {};
      }
    };

    const cleanup = subscribeToChanges();
    
    // Set up a periodic refresh as a fallback mechanism
    const interval = setInterval(() => {
      if (!subscribed) {
        console.log('Fallback: Refreshing messages and contacts due to no active subscription');
        refetchMessages();
        refetchContacts();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts, subscribed]);

  return { 
    subscriptionFailed
  };
};
