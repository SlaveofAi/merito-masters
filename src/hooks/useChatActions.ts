import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message, MessageMetadata } from "@/types/chat";
import { useNavigate } from "react-router-dom";

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
        
        const newConversation = {
          customer_id: userType === 'customer' ? user.id : contactId,
          craftsman_id: userType === 'craftsman' ? user.id : contactId,
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
            .eq('customer_id', userType === 'customer' ? user.id : contactId)
            .eq('craftsman_id', userType === 'craftsman' ? user.id : contactId)
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
      
      // Insert the message
      const newMessage = {
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: contactId,
        content: content,
        metadata: metadata || null
      };

      console.log("Sending message:", newMessage);

      const { data: insertedMessage, error: msgError } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select();
        
      if (msgError) {
        console.error("Error sending message:", msgError);
        toast.error("Nastala chyba pri odosielaní správy");
        return null;
      }
      
      console.log("Message sent successfully:", insertedMessage);
      
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

  const sendMessage = async (content: string, metadata?: MessageMetadata) => {
    if (!selectedContact || !content.trim() || !user) {
      console.error("Cannot send message - missing data", { selectedContact, content, user });
      return;
    }
    
    console.log(`Sending message to ${selectedContact.name}:`, content);
    console.log("With metadata:", metadata);
    
    sendMessageMutation.mutate({
      content,
      contactId: selectedContact.id,
      conversationId: selectedContact.conversation_id,
      metadata
    });
  };

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
        ? (userType === 'customer' ? 'is_archived_by_customer' : 'is_archived_by_craftsman')
        : (userType === 'customer' ? 'is_deleted_by_customer' : 'is_deleted_by_craftsman');
        
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
    sendMessage,
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
