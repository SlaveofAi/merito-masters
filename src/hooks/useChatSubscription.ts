
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to new messages via Supabase realtime
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
        
        // Refresh contact list
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [user, selectedContact, refetchMessages, queryClient]);
};
