
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

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
      conversationId 
    }: { 
      content: string; 
      contactId: string;
      conversationId?: string;
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

        const { data: insertedConv, error: convError } = await supabase
          .from('chat_conversations')
          .insert(newConversation)
          .select()
          .single();
          
        if (convError) {
          // Check if conversation already exists (because of unique constraint)
          console.log("Error creating conversation, checking if it already exists");
          
          const { data: existingConv, error: fetchError } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('customer_id', userType === 'customer' ? user.id : contactId)
            .eq('craftsman_id', userType === 'craftsman' ? user.id : contactId)
            .single();
            
          if (fetchError || !existingConv) {
            console.error("Error creating conversation:", convError);
            toast.error("Nastala chyba pri vytváraní konverzácie");
            return null;
          }
          
          convId = existingConv.id;
          console.log("Found existing conversation:", convId);
        } else if (insertedConv) {
          convId = insertedConv.id;
          console.log("Created new conversation:", convId);
        }
      }
      
      // Insert the message
      const newMessage = {
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: contactId,
        content: content,
      };

      console.log("Sending message:", newMessage);

      const { data: insertedMessage, error: msgError } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select()
        .single();
        
      if (msgError) {
        console.error("Error sending message:", msgError);
        toast.error("Nastala chyba pri odosielaní správy");
        return null;
      }
      
      console.log("Message sent successfully:", insertedMessage);
      
      // Update conversation's updated_at timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
      
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

  const sendMessage = async (content: string) => {
    if (!selectedContact || !content.trim() || !user) {
      console.error("Cannot send message - missing data", { selectedContact, content, user });
      return;
    }
    
    console.log(`Sending message to ${selectedContact.name}:`, content);
    
    sendMessageMutation.mutate({
      content,
      contactId: selectedContact.id,
      conversationId: selectedContact.conversation_id
    });
  };

  const archiveConversation = async () => {
    if (!selectedContact?.conversation_id || !user) return;
    
    const fieldToUpdate = userType === 'customer' 
      ? 'is_archived_by_customer' 
      : 'is_archived_by_craftsman';
      
    const { error } = await supabase
      .from('chat_conversations')
      .update({ [fieldToUpdate]: true })
      .eq('id', selectedContact.conversation_id);
      
    if (error) {
      console.error("Error archiving conversation:", error);
      toast.error("Nastala chyba pri archivácii konverzácie");
      return;
    }
    
    toast.success("Konverzácia bola archivovaná");
    queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    setSelectedContact(null);
  };

  const deleteConversation = async () => {
    if (!selectedContact?.conversation_id || !user) return;
    
    const fieldToUpdate = userType === 'customer' 
      ? 'is_deleted_by_customer' 
      : 'is_deleted_by_craftsman';
      
    const { error } = await supabase
      .from('chat_conversations')
      .update({ [fieldToUpdate]: true })
      .eq('id', selectedContact.conversation_id);
      
    if (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Nastala chyba pri mazaní konverzácie");
      return;
    }
    
    toast.success("Konverzácia bola zmazaná");
    queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    setSelectedContact(null);
  };

  return {
    sendMessage,
    archiveConversation,
    deleteConversation
  };
};
