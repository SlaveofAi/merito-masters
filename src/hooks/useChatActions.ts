
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message, MessageMetadata } from "@/types/chat";

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
        return null;
      }
      
      let convId = conversationId;
      
      // Create a new conversation if it doesn't exist
      if (!convId) {
        console.log("Creating new conversation");
        
        // Normalize userType to lowercase for consistent comparison
        const normalizedUserType = userType?.toLowerCase() || '';
        
        const newConversation = {
          customer_id: normalizedUserType === 'customer' ? user.id : contactId,
          craftsman_id: normalizedUserType === 'craftsman' ? user.id : contactId,
        };

        console.log("New conversation data:", newConversation);

        const { data: insertedConv, error: convError } = await supabase
          .from('chat_conversations')
          .insert(newConversation)
          .select();
          
        if (convError) {
          // Check if conversation already exists (because of unique constraint)
          console.log("Error creating conversation, checking if it already exists");
          
          const { data: existingConv, error: fetchError } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('customer_id', normalizedUserType === 'customer' ? user.id : contactId)
            .eq('craftsman_id', normalizedUserType === 'craftsman' ? user.id : contactId)
            .maybeSingle();
            
          if (fetchError || !existingConv) {
            console.error("Error creating conversation:", convError);
            toast.error("Nastala chyba pri vytváraní konverzácie");
            return null;
          }
          
          convId = existingConv.id;
          console.log("Found existing conversation:", convId);
        } else if (insertedConv && insertedConv.length > 0) {
          convId = insertedConv[0].id;
          console.log("Created new conversation:", convId);
        }
      }
      
      // Prepare the message data
      const messageData: any = {
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: contactId,
        content: content
      };
      
      // Add metadata if provided
      if (metadata) {
        messageData.metadata = metadata;
      }

      console.log("Sending message with data:", messageData);

      // Insert the message
      const { data: insertedMessage, error: msgError } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select();
        
      if (msgError) {
        console.error("Error sending message:", msgError);
        toast.error("Nastala chyba pri odosielaní správy");
        return null;
      }
      
      console.log("Message sent successfully:", insertedMessage);
      
      // If this is a booking request, create entry in booking_requests table
      if (metadata?.type === 'booking_request' && metadata.booking_id) {
        console.log("Creating booking request entry with metadata:", metadata);
        
        // Normalize userType for consistent comparison
        const normalizedUserType = userType?.toLowerCase() || '';
        
        const craftsman_id = normalizedUserType === 'customer' ? contactId : user.id;
        const customer_id = normalizedUserType === 'customer' ? user.id : contactId;
        
        console.log("Booking participants - craftsman:", craftsman_id, "customer:", customer_id);
        
        // Create booking in booking_requests table
        const bookingData = {
          id: metadata.booking_id,
          conversation_id: convId,
          craftsman_id,
          customer_id,
          customer_name: normalizedUserType === 'customer' ? (user.user_metadata?.name || "Customer") : "Customer",
          date: metadata.details?.date || new Date().toISOString().split('T')[0],
          start_time: metadata.details?.time || "00:00",
          end_time: metadata.details?.time ? 
            (parseInt(metadata.details.time.split(':')[0]) + 1) + ":" + metadata.details.time.split(':')[1] : 
            "01:00",
          message: metadata.details?.message || null,
          amount: metadata.details?.amount || null,
          image_url: metadata.details?.image_url || null
        };
        
        console.log("Creating booking with data:", bookingData);
        
        const { error: bookingError } = await supabase
          .from('booking_requests')
          .insert([bookingData]);
          
        if (bookingError) {
          console.error("Error creating booking request:", bookingError);
          toast.error("Návrh termínu bol odoslaný, ale nastala chyba pri vytváraní požiadavky");
        } else {
          console.log("Booking request created successfully");
        }
      }
      
      // Update conversation's updated_at timestamp
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
        
      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError);
      }
      
      return { message: insertedMessage, conversationId: convId };
    },
    onSuccess: (data) => {
      if (data) {
        console.log("Send message mutation succeeded:", data);
        
        // If a new conversation was created, update the contact
        if (selectedContact && !selectedContact.conversation_id && data.conversationId) {
          setSelectedContact({
            ...selectedContact,
            conversation_id: data.conversationId
          });
        }
        
        // Refresh messages
        refetchMessages();
        
        // Refresh contact list
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      }
    },
    onError: (error) => {
      console.error("Send message mutation failed:", error);
      toast.error("Nastala chyba pri odosielaní správy");
    }
  });

  // Mutation for archiving and deleting conversations
  const updateConversationMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      action 
    }: { 
      conversationId: string; 
      action: 'archive' | 'delete';
    }) => {
      if (!conversationId || !userType) {
        console.error("Missing required data for updating conversation", { conversationId, userType });
        return null;
      }
      
      const fieldToUpdate = action === 'archive' 
        ? (userType.toLowerCase() === 'customer' ? 'is_archived_by_customer' : 'is_archived_by_craftsman')
        : (userType.toLowerCase() === 'customer' ? 'is_deleted_by_customer' : 'is_deleted_by_craftsman');
        
      console.log(`${action === 'archive' ? 'Archiving' : 'Deleting'} conversation ${conversationId}`);
      
      const updateData: Record<string, boolean> = {};
      updateData[fieldToUpdate] = true;
      
      const { error } = await supabase
        .from('chat_conversations')
        .update(updateData)
        .eq('id', conversationId);
        
      if (error) {
        console.error(`Error ${action}ing conversation:`, error);
        return { success: false, error };
      }
      
      return { success: true, conversationId };
    },
    onSuccess: (data, variables) => {
      if (data?.success) {
        const action = variables.action;
        console.log(`Conversation ${action} successful:`, data);
        
        // Reset selected contact
        setSelectedContact(null);
        
        // Show success message
        toast.success(action === 'archive' 
          ? "Konverzácia bola archivovaná" 
          : "Konverzácia bola zmazaná"
        );
        
        // Refresh the contacts list
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      }
    },
    onError: (error, variables) => {
      const action = variables.action;
      console.error(`Conversation ${action} failed:`, error);
      toast.error(`Nastala chyba pri ${action === 'archive' ? 'archivácii' : 'mazaní'} konverzácie`);
    }
  });

  return {
    sendMessage: async (content: string, metadata?: MessageMetadata) => {
      if (!selectedContact || !content.trim() || !user) {
        console.error("Cannot send message - missing data", { selectedContact, content, user });
        return;
      }
      
      console.log(`Sending message to ${selectedContact.name}:`, content);
      console.log("With metadata:", metadata);
      
      // Use contactId for the database operations
      const contactIdToUse = selectedContact.contactId || selectedContact.id;
      
      sendMessageMutation.mutate({
        content,
        contactId: contactIdToUse,
        conversationId: selectedContact.conversation_id,
        metadata
      });
    },
    archiveConversation: async () => {
      if (!selectedContact?.conversation_id || !user) {
        console.error("Cannot archive - missing data", { selectedContact, user });
        return;
      }
      
      updateConversationMutation.mutate({
        conversationId: selectedContact.conversation_id,
        action: 'archive'
      });
    },
    deleteConversation: async () => {
      if (!selectedContact?.conversation_id || !user) {
        console.error("Cannot delete - missing data", { selectedContact, user });
        return;
      }
      
      updateConversationMutation.mutate({
        conversationId: selectedContact.conversation_id,
        action: 'delete'
      });
    }
  };
};
