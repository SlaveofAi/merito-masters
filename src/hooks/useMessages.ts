
import { useChatMessages } from './useChatMessages';
import { useContactDetails } from './useContactDetails';
import { useCustomerReviews } from './useCustomerReviews';
import { ChatContact, Message } from "@/types/chat";
import { useEffect } from 'react';

// Create a combined hook that returns all the data needed for the chat
export function useMessages(selectedContact: ChatContact | null, refetchContacts: () => void) {
  // Get the user from the auth context
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  console.log('useMessages hook initialized with user:', user?.id, 'type:', user?.user_metadata?.user_type);
  console.log('Selected contact:', selectedContact);
  
  // Get messages data
  const messagesQuery = useChatMessages(selectedContact, user, refetchContacts);
  
  // Get contact details
  const contactDetailsQuery = useContactDetails(selectedContact, user);
  
  // Get customer reviews if relevant
  const customerReviewsQuery = useCustomerReviews(selectedContact, user);

  // Effect to refetch contacts when a conversation is selected
  useEffect(() => {
    if (selectedContact?.conversation_id) {
      console.log("Conversation selected, refetching contacts to update unread counts");
      
      // Immediate refetch
      refetchContacts();
      
      // Multiple refetches with increasing delays to ensure unread counts are updated
      const timeoutIds = [100, 500, 1000, 2000].map(delay => 
        setTimeout(() => {
          console.log(`Refetching contacts after ${delay}ms delay`);
          refetchContacts();
        }, delay)
      );
      
      return () => {
        // Clean up timeouts if component unmounts or contact changes
        timeoutIds.forEach(id => clearTimeout(id));
      };
    }
  }, [selectedContact?.conversation_id, refetchContacts]);
  
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
