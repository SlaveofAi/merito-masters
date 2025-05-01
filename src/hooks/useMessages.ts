
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
  
  console.log('useMessages hook initialized with user:', user?.id, 'type:', user?.user_metadata?.user_type);
  console.log('Selected contact:', selectedContact);
  
  // Get messages data
  const messagesQuery = useChatMessages(selectedContact, user, refetchContacts);
  
  // Get contact details
  const contactDetailsQuery = useContactDetails(selectedContact, user);
  
  // Get customer reviews if relevant
  const customerReviewsQuery = useCustomerReviews(selectedContact, user);
  
  // Critical fix: Force refetch when switching conversations to ensure read status is properly updated
  useEffect(() => {
    if (selectedContact && (
      previousContactRef.current?.id !== selectedContact.id || 
      previousContactRef.current?.conversation_id !== selectedContact.conversation_id
    )) {
      const now = Date.now();
      console.log(`Selected contact changed from ${previousContactRef.current?.name || 'none'} to ${selectedContact.name}, refetching data`);
      console.log(`Time since last switch: ${now - lastSwitchTime}ms`);
      
      // Update previous contact reference and switch time
      previousContactRef.current = selectedContact;
      setLastSwitchTime(now);
      
      // Force immediate refetch of messages to mark them as read
      messagesQuery.refetch().then(() => {
        // Then update the contacts list to reflect new unread counts with multiple waves of refetches
        const refetchWaves = [
          { delay: 500, message: "Initial contacts refetch" },
          { delay: 1500, message: "Secondary contacts refetch" },
          { delay: 3000, message: "Final contacts refetch" },
          { delay: 6000, message: "Extended contacts refetch" },
          { delay: 10000, message: "Final cleanup contacts refetch" }
        ];
        
        refetchWaves.forEach(wave => {
          setTimeout(() => {
            console.log(wave.message);
            refetchContacts();
          }, wave.delay);
        });
      });
    }
  }, [selectedContact, messagesQuery, refetchContacts, lastSwitchTime]);
  
  // Additional forced refresh of contacts whenever messages change
  useEffect(() => {
    if (messagesQuery.data && messagesQuery.data.length > 0) {
      // Something changed in messages, make sure contacts are up to date
      console.log("Messages data changed, ensuring contacts are up to date");
      
      // Use multiple waves of refetches with increasing delays
      setTimeout(() => {
        refetchContacts();
      }, 800);
      
      setTimeout(() => {
        refetchContacts();
      }, 2500);
    }
  }, [messagesQuery.data, refetchContacts]);
  
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
