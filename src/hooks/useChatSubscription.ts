
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  // Simple implementation that doesn't attempt to use Supabase realtime
  // Instead we rely on periodic refetching in the Chat component
  
  return { 
    subscriptionFailed: false // Set to false to disable error messaging
  };
};
