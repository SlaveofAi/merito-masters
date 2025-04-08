
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const [subscriptionFailed, setSubscriptionFailed] = useState(true);
  
  // Realtime subscriptions are disabled for stability
  // Simpler implementation that just returns subscription state
  
  return { 
    subscriptionFailed: true // Always set to true to indicate we're using manual refresh mode
  };
};
