
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to new messages and message status changes via Supabase realtime
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up realtime subscription for chat messages");
    
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        console.log("Received new message via realtime:", payload);
        
        // Play notification sound
        const audio = new Audio('/message.mp3');
        audio.play().catch(e => console.log("Could not play notification sound", e));
        
        // Show toast notification
        toast.success("Nová správa");
        
        // Refresh messages if conversation is selected
        if (selectedContact?.conversation_id === payload.new.conversation_id) {
          console.log("Refreshing messages for current conversation");
          refetchMessages();
        }
        
        // Always refresh contact list for new messages
        refetchContacts();
        
        // Force invalidate the contacts query to update unread count
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        // If messages are marked as read, update the contact list to reflect new unread counts
        console.log("Message status changed:", payload);
        
        // If this is a message being marked as read, update the contacts list
        if (payload.old.read === false && payload.new.read === true) {
          console.log("Message marked as read via realtime, updating contacts list");
          // Force refresh for read status changes
          refetchContacts();
          
          // Invalidate cache for both messages and contacts
          queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
          queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
          
          // If this is for the currently selected contact, update their unread count in cache
          if (selectedContact && payload.new.conversation_id === selectedContact.conversation_id) {
            queryClient.setQueryData(['chat-contacts'], (oldData: any) => {
              if (!oldData) return oldData;
              
              return oldData.map((contact: ChatContact) => {
                if (contact.conversation_id === payload.new.conversation_id) {
                  // Set or decrement unread count
                  const currentCount = contact.unread_count || 0;
                  return { ...contact, unread_count: Math.max(0, currentCount - 1) };
                }
                return contact;
              });
            });
          }
        }
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        
        // If we're reconnecting, force refresh the data
        if (status === "SUBSCRIBED") {
          refetchContacts();
          if (selectedContact?.conversation_id) {
            refetchMessages();
          }
        }
      });
      
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [user, selectedContact, refetchMessages, refetchContacts, queryClient]);
};
