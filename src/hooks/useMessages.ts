
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useContactDetails } from "@/hooks/useContactDetails";
import { useCustomerReviews } from "@/hooks/useCustomerReviews";

export const useMessages = (selectedContact: ChatContact | null, refetchContacts: () => void) => {
  const { user } = useAuth();
  
  // Use the extracted hooks
  const { data: messages = [], refetch: refetchMessages } = useChatMessages(selectedContact, user, refetchContacts);
  const { data: contactDetails } = useContactDetails(selectedContact, user);
  const { data: customerReviews = [] } = useCustomerReviews(selectedContact, user);

  // Return everything together, maintaining the same interface
  return {
    messages,
    refetchMessages,
    contactDetails,
    customerReviews
  };
};
