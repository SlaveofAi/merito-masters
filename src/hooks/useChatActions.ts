
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, MessageMetadata } from "@/types/chat";
import { v4 as uuidv4 } from 'uuid';

export const useChatActions = (
  selectedContact: ChatContact | null,
  setSelectedContact: (contact: ChatContact | null) => void,
  refetchMessages: () => void
) => {
  const { user, userType } = useAuth();
  const queryClient = useQueryClient();

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      content, 
      contactId, 
      conversationId,
      metadata
    }: { 
      content: string; 
      contactId: string;
      conversationId?: string;
      metadata?: MessageMetadata;
    }) => {
      if (!user || !contactId || !content.trim()) {
        console.error("Missing required data for sending message", { user, contactId, content });
        throw new Error("Missing data for sending message");
      }
      
      // Get or create conversation
      let convId = conversationId;
      
      if (!convId) {
        // Determine customer and craftsman IDs based on user type
        const normalizedUserType = userType?.toLowerCase() || '';
        const customerId = normalizedUserType === 'customer' ? user.id : contactId;
        const craftsmanId = normalizedUserType === 'craftsman' ? user.id : contactId;
        
        try {
          // Check if conversation already exists
          const { data: existingConv, error: fetchError } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('customer_id', customerId)
            .eq('craftsman_id', craftsmanId)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error checking for existing conversation:", fetchError);
            throw new Error("Error checking for existing conversation");
          }
          
          if (existingConv) {
            convId = existingConv.id;
          } else {
            // Create new conversation
            const { data: newConv, error: insertError } = await supabase
              .from('chat_conversations')
              .insert({
                customer_id: customerId,
                craftsman_id: craftsmanId
              })
              .select();
              
            if (insertError) {
              console.error("Error creating conversation:", insertError);
              throw new Error("Error creating conversation");
            }
            
            if (newConv && newConv.length > 0) {
              convId = newConv[0].id;
            } else {
              throw new Error("Failed to create conversation");
            }
          }
        } catch (err) {
          console.error("Error with conversation:", err);
          throw err;
        }
      }
      
      // Handle booking metadata
      if (metadata?.type === 'booking_request' && !metadata.booking_id) {
        metadata.booking_id = uuidv4();
      }
      
      // Prepare message data
      const messageData: any = {
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: contactId,
        content: content
      };
      
      // Only add metadata if it exists
      if (metadata) {
        messageData.metadata = metadata;
      }
      
      // Send message
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select();
        
      if (messageError) {
        console.error("Error sending message:", messageError);
        throw new Error("Error sending message");
      }
      
      // Create booking request if needed
      if (metadata?.type === 'booking_request' && metadata.booking_id) {
        try {
          const normalizedUserType = userType?.toLowerCase() || '';
          
          const bookingData = {
            id: metadata.booking_id,
            conversation_id: convId,
            craftsman_id: normalizedUserType === 'customer' ? contactId : user.id,
            customer_id: normalizedUserType === 'customer' ? user.id : contactId,
            customer_name: user.user_metadata?.name || "Customer",
            date: metadata.details?.date || new Date().toISOString().split('T')[0],
            start_time: metadata.details?.time || "00:00",
            end_time: metadata.details?.time ? 
              (parseInt(metadata.details.time.split(':')[0]) + 1) + ":" + metadata.details.time.split(':')[1] : 
              "01:00",
            message: metadata.details?.message || null
          };
          
          const { error: bookingError } = await supabase
            .from('booking_requests')
            .insert(bookingData);
            
          if (bookingError) {
            console.error("Error creating booking request:", bookingError);
          }
        } catch (err) {
          console.error("Error creating booking:", err);
        }
      }
      
      // Update conversation timestamp
      try {
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId);
      } catch (err) {
        console.error("Error updating conversation timestamp:", err);
      }
      
      return { message, conversationId: convId };
    },
    onSuccess: (data) => {
      // Update selected contact if needed
      if (selectedContact && !selectedContact.conversation_id && data?.conversationId) {
        setSelectedContact({
          ...selectedContact,
          conversation_id: data.conversationId
        });
      }
      
      // Refresh data
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    },
    onError: (error: any) => {
      console.error("Error sending message:", error);
      toast.error(error?.message || "Nastala chyba pri odosielaní správy");
    }
  });

  // Mutation for archiving or deleting conversations
  const updateConversationMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      action 
    }: { 
      conversationId: string; 
      action: 'archive' | 'delete';
    }) => {
      if (!conversationId || !userType) {
        return null;
      }
      
      const fieldToUpdate = action === 'archive' 
        ? (userType.toLowerCase() === 'customer' ? 'is_archived_by_customer' : 'is_archived_by_craftsman')
        : (userType.toLowerCase() === 'customer' ? 'is_deleted_by_customer' : 'is_deleted_by_craftsman');
        
      const { error } = await supabase
        .from('chat_conversations')
        .update({ [fieldToUpdate]: true })
        .eq('id', conversationId);
        
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      setSelectedContact(null);
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    },
    onError: (error, variables) => {
      const action = variables.action;
      toast.error(`Nastala chyba pri ${action === 'archive' ? 'archivácii' : 'mazaní'} konverzácie`);
    }
  });

  // Public methods
  return {
    sendMessage: async (content: string, metadata?: MessageMetadata) => {
      if (!selectedContact || !content.trim() || !user) {
        return Promise.reject("Missing data for sending message");
      }
      
      const contactIdToUse = selectedContact.contactId || selectedContact.id;
      
      return sendMessageMutation.mutateAsync({
        content,
        contactId: contactIdToUse,
        conversationId: selectedContact.conversation_id,
        metadata
      });
    },
    archiveConversation: () => {
      if (!selectedContact?.conversation_id || !user) return;
      
      updateConversationMutation.mutate({
        conversationId: selectedContact.conversation_id,
        action: 'archive'
      });
    },
    deleteConversation: () => {
      if (!selectedContact?.conversation_id || !user) return;
      
      updateConversationMutation.mutate({
        conversationId: selectedContact.conversation_id,
        action: 'delete'
      });
    }
  };
};
