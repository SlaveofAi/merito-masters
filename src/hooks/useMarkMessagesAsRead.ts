
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";

/**
 * Hook specifically for marking messages as read
 */
export const useMarkMessagesAsRead = (refetchContacts: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mutation for marking messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return { success: false };
      
      console.log(`Explicitly marking all messages as read for conversation ${conversationId}`);
      
      try {
        // Use direct update for better reliability - update in batch
        const { error } = await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('conversation_id', conversationId)
          .eq('receiver_id', user.id)
          .eq('read', false);
        
        if (error) {
          console.error("Error marking messages as read:", error);
          return { success: false, error };
        }
        
        console.log("Successfully marked all messages as read");
        return { success: true };
      } catch (err) {
        console.error("Exception marking messages as read:", err);
        return { success: false, error: err };
      }
    },
    onSuccess: () => {
      // Force refresh contacts to update badges immediately
      refetchContacts();
      
      // Invalidate queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      
      // Additional invalidation after a short delay to ensure changes propagate
      setTimeout(() => {
        refetchContacts();
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      }, 300);
    }
  });
  
  // Expose function to be called from outside
  const markMessagesAsRead = useCallback((conversationId: string) => {
    console.log(`Marking messages as read for conversation ${conversationId}`);
    return markAsReadMutation.mutate(conversationId);
  }, [markAsReadMutation]);

  return { markMessagesAsRead };
};
