
import { useQueryClient } from "@tanstack/react-query";
import { ChatContact } from "@/types/chat";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { useContactDetails } from "@/hooks/useContactDetails";
import { useCustomerReviews } from "@/hooks/useCustomerReviews";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useEffect } from "react";

export const useMessages = (selectedContact: ChatContact | null, refetchContacts: () => void) => {
  const queryClient = useQueryClient();
  
  // Import functionalities from separate hooks
  const { markMessagesAsRead } = useMarkMessagesAsRead(refetchContacts);
  const { contactDetails } = useContactDetails(selectedContact);
  const { customerReviews } = useCustomerReviews(selectedContact);
  const { messages, refetchMessages } = useChatMessages(selectedContact, markMessagesAsRead);

  // Enhanced effect to update contacts more aggressively when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedContact?.conversation_id) {
      console.log("Messages loaded - ensuring all are marked as read");
      
      // Mark all messages as read whenever messages are loaded
      markMessagesAsRead(selectedContact.conversation_id);
      
      // Immediate refresh
      refetchContacts();
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      
      // Multiple staggered refreshes to ensure updates take effect
      const refreshTimes = [200, 500, 1000, 2000];
      const timers = refreshTimes.map(time => {
        return setTimeout(() => {
          console.log(`Refreshing contacts after ${time}ms delay since messages changed`);
          refetchContacts();
          queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
        }, time);
      });
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [messages, selectedContact, refetchContacts, queryClient, markMessagesAsRead]);

  return {
    messages,
    refetchMessages,
    contactDetails,
    customerReviews,
    markMessagesAsRead
  };
};
