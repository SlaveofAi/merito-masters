
// This file re-exports a combined hook for Chat.tsx that includes messages, contact details, and reviews
import { useChatMessages } from './useChatMessages';
import { useContactDetails } from './useContactDetails';
import { useCustomerReviews } from './useCustomerReviews';
import { ChatContact, Message } from "@/types/chat";
import { useEffect, useCallback, useRef } from 'react';

// Create a combined hook that returns all the data needed for the chat
export function useMessages(selectedContact: ChatContact | null, refetchContacts: () => void) {
  // Get the user from the auth context
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const previousContactRef = useRef<ChatContact | null>(null);
  
  console.log('useMessages hook initialized with user:', user?.id, 'type:', user?.user_metadata?.user_type);
  console.log('Selected contact:', selectedContact);
  
  // Get messages data
  const messagesQuery = useChatMessages(selectedContact, user, refetchContacts);
  
  // Get contact details
  const contactDetailsQuery = useContactDetails(selectedContact, user);
  
  // Get customer reviews if relevant
  const customerReviewsQuery = useCustomerReviews(selectedContact, user);
  
  // Force refetch when switching conversations to ensure read status is properly updated
  useEffect(() => {
    if (selectedContact && previousContactRef.current?.id !== selectedContact.id) {
      console.log(`Selected contact changed from ${previousContactRef.current?.name || 'none'} to ${selectedContact.name}, refetching data`);
      
      // Update previous contact reference
      previousContactRef.current = selectedContact;
      
      // First refetch messages to mark them as read
      messagesQuery.refetch().then(() => {
        // Then update the contacts list to reflect new unread counts
        // Small delay to ensure database operations complete
        setTimeout(() => {
          refetchContacts();
        }, 300);
      });
    }
  }, [selectedContact, messagesQuery, refetchContacts]);
  
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
