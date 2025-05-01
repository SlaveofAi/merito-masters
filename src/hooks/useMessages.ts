
// This file re-exports a combined hook for Chat.tsx that includes messages, contact details, and reviews
import { useChatMessages } from './useChatMessages';
import { useContactDetails } from './useContactDetails';
import { useCustomerReviews } from './useCustomerReviews';
import { ChatContact, Message } from "@/types/chat";
import { useEffect, useCallback, useRef, useState } from 'react';

// Create a combined hook that returns all the data needed for the chat
export function useMessages(selectedContact: ChatContact | null, refetchContacts: () => void) {
  // Get the user from the auth context
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const previousContactRef = useRef<ChatContact | null>(null);
  const [lastSwitchTime, setLastSwitchTime] = useState<number>(0);
  const [forceRefreshKey, setForceRefreshKey] = useState<number>(0);
  
  console.log('useMessages hook initialized with user:', user?.id, 'type:', user?.user_metadata?.user_type);
  console.log('Selected contact:', selectedContact);
  
  // Get messages data
  const messagesQuery = useChatMessages(selectedContact, user, refetchContacts);
  
  // Get contact details
  const contactDetailsQuery = useContactDetails(selectedContact, user);
  
  // Get customer reviews if relevant
  const customerReviewsQuery = useCustomerReviews(selectedContact, user);

  // Force a re-fetch every minute as a safety measure
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedContact) {
        console.log("Performing periodic forced refresh of messages and contacts");
        messagesQuery.refetch();
        refetchContacts();
        // Change the key to force re-renders and re-evaluation
        setForceRefreshKey(prev => prev + 1);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [selectedContact, messagesQuery, refetchContacts]);
  
  // Critical fix: Force refetch when switching conversations to ensure read status is properly updated
  useEffect(() => {
    if (!selectedContact) return;

    const contactChanged = 
      !previousContactRef.current || 
      previousContactRef.current?.id !== selectedContact.id || 
      previousContactRef.current?.conversation_id !== selectedContact.conversation_id;

    if (contactChanged) {
      const now = Date.now();
      console.log(`Selected contact changed from ${previousContactRef.current?.name || 'none'} to ${selectedContact.name}, refetching data`);
      console.log(`Time since last switch: ${now - lastSwitchTime}ms`);
      
      // Update previous contact reference and switch time
      previousContactRef.current = selectedContact;
      setLastSwitchTime(now);
      
      // Force immediate refetch of messages to mark them as read
      messagesQuery.refetch().then(() => {
        // Then update the contacts list to reflect new unread counts with multiple waves of refetches
        // IMPROVED: More aggressive refetch schedule with shorter initial delay
        const refetchWaves = [
          { delay: 100, message: "Immediate contacts refetch after contact change" },
          { delay: 500, message: "Initial contacts refetch" },
          { delay: 1500, message: "Secondary contacts refetch" },
          { delay: 3000, message: "Third contacts refetch" },
          { delay: 6000, message: "Fourth contacts refetch" },
          { delay: 10000, message: "Final contacts refetch" },
          { delay: 15000, message: "Extended cleanup contacts refetch" }
        ];
        
        refetchWaves.forEach(wave => {
          setTimeout(() => {
            console.log(wave.message);
            refetchContacts();
          }, wave.delay);
        });
      });

      // Perform direct database update to mark messages as read for this conversation
      // This is a fallback mechanism in case the regular query doesn't update the read status
      setTimeout(async () => {
        if (user && selectedContact.conversation_id) {
          try {
            console.log("Direct database update: Marking all messages as read for current conversation");
            
            const { data, error } = await supabase
              .from('chat_messages')
              .update({ read: true })
              .eq('conversation_id', selectedContact.conversation_id)
              .eq('receiver_id', user.id)
              .eq('read', false);
              
            if (error) {
              console.error("Error in direct read status update:", error);
            } else {
              console.log("Direct read status update completed");
              // Force another contact refetch
              setTimeout(() => refetchContacts(), 1000);
            }
          } catch (err) {
            console.error("Exception in direct read status update:", err);
          }
        }
      }, 2000);
    }
  }, [selectedContact, messagesQuery, refetchContacts, lastSwitchTime, user, forceRefreshKey]);
  
  // Additional forced refresh of contacts whenever messages change
  useEffect(() => {
    if (messagesQuery.data && messagesQuery.data.length > 0 && selectedContact) {
      // Something changed in messages, make sure contacts are up to date
      console.log("Messages data changed, ensuring contacts are up to date");
      
      // Use multiple waves of refetches with increasing delays
      setTimeout(() => {
        refetchContacts();
      }, 500);
      
      setTimeout(() => {
        refetchContacts();
      }, 2000);

      // Force a direct database check to ensure we have the correct unread count
      setTimeout(async () => {
        if (user && selectedContact.conversation_id) {
          try {
            console.log("Performing direct unread count check for conversation:", selectedContact.conversation_id);
            
            const { count, error } = await supabase
              .from('chat_messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', selectedContact.conversation_id)
              .eq('receiver_id', user.id)
              .eq('read', false);
              
            if (!error) {
              console.log(`Direct database check: Found ${count || 0} unread messages for conversation ${selectedContact.conversation_id}`);
              if (count && count > 0) {
                // If we still have unread messages, force another round of read status updates
                console.log("Still have unread messages, forcing another read status update");
                
                // Update read status directly
                await supabase
                  .from('chat_messages')
                  .update({ read: true })
                  .eq('conversation_id', selectedContact.conversation_id)
                  .eq('receiver_id', user.id)
                  .eq('read', false);
                  
                // Force refetches
                setTimeout(() => refetchContacts(), 1000);
                setTimeout(() => refetchContacts(), 3000);
                
                // Force message refetch
                messagesQuery.refetch();
              }
            }
          } catch (err) {
            console.error("Error in direct unread count check:", err);
          }
        }
      }, 5000);
    }
  }, [messagesQuery.data, refetchContacts, selectedContact, user, messagesQuery]);
  
  // Return a combined object with all data needed by Chat.tsx
  return {
    messages: messagesQuery.data || [],
    refetchMessages: messagesQuery.refetch,
    isLoading: messagesQuery.isLoading,
    contactDetails: contactDetailsQuery.data,
    customerReviews: customerReviewsQuery.data || [],
  };
}

// Also export the individual hooks for direct usage if needed
export { useChatMessages };

import { supabase } from "@/integrations/supabase/client";
