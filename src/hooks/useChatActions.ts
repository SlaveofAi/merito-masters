
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message, MessageMetadata } from "@/types/chat";
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
        return null;
      }
      
      let convId = conversationId;
      
      // Check for existing conversation first
      if (!convId) {
        console.log("No conversation ID provided, checking for existing conversation");
        
        // Normalize userType to lowercase for consistent comparison
        const normalizedUserType = userType?.toLowerCase() || '';
        
        try {
          // Check if conversation already exists
          const { data: existingConv, error: fetchError } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('customer_id', normalizedUserType === 'customer' ? user.id : contactId)
            .eq('craftsman_id', normalizedUserType === 'craftsman' ? user.id : contactId)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error checking for existing conversation:", fetchError);
            throw new Error("Nastala chyba pri overovaní existujúcej konverzácie");
          } else if (existingConv) {
            convId = existingConv.id;
            console.log("Found existing conversation:", convId);
          }
        } catch (err) {
          console.error("Error checking for existing conversation:", err);
          throw new Error("Nastala chyba pri overovaní existujúcej konverzácie");
        }
        
        // Create a new conversation if it doesn't exist
        if (!convId) {
          console.log("Creating new conversation");
          
          try {
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
              console.error("Error creating conversation:", convError);
              throw new Error("Nastala chyba pri vytváraní konverzácie");
            } else if (insertedConv && insertedConv.length > 0) {
              convId = insertedConv[0].id;
              console.log("Created new conversation:", convId);
            } else {
              throw new Error("Nastala chyba pri vytváraní konverzácie - žiadne dáta");
            }
          } catch (err) {
            console.error("Error creating conversation:", err);
            throw new Error("Nastala chyba pri vytváraní konverzácie");
          }
        }
      }
      
      if (!convId) {
        console.error("Failed to get or create conversation");
        throw new Error("Nastala chyba pri vytváraní konverzácie");
      }
      
      // Generate a booking_id if this is a booking request and doesn't have one
      if (metadata?.type === 'booking_request' && !metadata.booking_id) {
        const bookingId = uuidv4();
        console.log("Generated booking ID for request:", bookingId);
        metadata.booking_id = bookingId;
      }
      
      // Prepare message data
      const newMessage = {
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: contactId,
        content: content,
      };

      // Only add metadata if it exists
      let messageToInsert: any = {...newMessage};
      
      if (metadata && Object.keys(metadata).length > 0) {
        console.log("Adding metadata to message:", JSON.stringify(metadata));
        messageToInsert.metadata = metadata;
      } else {
        console.log("Sending message without metadata");
      }

      console.log("Final message to insert:", JSON.stringify(messageToInsert));

      // Retry sending the message up to 3 times if it fails
      let retries = 0;
      let messageSuccess = false;
      let insertedMessage = null;
      
      while (!messageSuccess && retries < 3) {
        try {
          const { data, error: msgError } = await supabase
            .from('chat_messages')
            .insert(messageToInsert)
            .select();
            
          if (msgError) {
            console.error(`Error sending message (attempt ${retries + 1}):`, msgError);
            retries++;
            // Wait before retrying (exponential backoff)
            if (retries < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            }
          } else {
            messageSuccess = true;
            insertedMessage = data && data.length > 0 ? data[0] : null;
            break;
          }
        } catch (err) {
          console.error(`Exception sending message (attempt ${retries + 1}):`, err);
          retries++;
          if (retries < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
          }
        }
      }
      
      if (!messageSuccess) {
        throw new Error("Nastala chyba pri odosielaní správy po viacerých pokusoch");
      }
      
      console.log("Message sent successfully:", insertedMessage);
      
      // If this is a booking request, create entry in booking_requests table
      if (metadata?.type === 'booking_request' && metadata.booking_id) {
        console.log("Creating booking request entry with ID:", metadata.booking_id);
        
        try {
          // Normalize userType for consistent comparison
          const normalizedUserType = userType?.toLowerCase() || '';
          
          // Create booking in booking_requests table
          const bookingData = {
            id: metadata.booking_id,
            conversation_id: convId,
            craftsman_id: normalizedUserType === 'customer' ? contactId : user.id,
            customer_id: normalizedUserType === 'customer' ? user.id : contactId,
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
          
          console.log("Creating booking with data:", JSON.stringify(bookingData));
          
          const { error: bookingError } = await supabase
            .from('booking_requests')
            .insert(bookingData);
            
          if (bookingError) {
            console.error("Error creating booking request:", bookingError);
            // Log but don't throw - the message was already sent
            console.warn("Booking request creation failed, but message was sent");
          } else {
            console.log("Booking request created successfully");
          }
        } catch (err) {
          console.error("Error creating booking request:", err);
          // Log but don't throw - the message was already sent
          console.warn("Booking request creation failed with exception, but message was sent");
        }
      }
      
      try {
        // Update conversation's updated_at timestamp
        const { error: updateError } = await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId);
          
        if (updateError) {
          console.error("Error updating conversation timestamp:", updateError);
        }
      } catch (err) {
        console.error("Error updating conversation timestamp:", err);
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
    onError: (error: any) => {
      console.error("Send message mutation failed:", error);
      toast.error(error?.message || "Nastala chyba pri odosielaní správy");
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
        return Promise.reject("Missing data for sending message");
      }
      
      console.log(`Sending message to ${selectedContact.name}:`, content);
      console.log("With metadata:", JSON.stringify(metadata));
      
      // Use contactId for the database operations
      const contactIdToUse = selectedContact.contactId || selectedContact.id;
      
      return new Promise((resolve, reject) => {
        sendMessageMutation.mutate({
          content,
          contactId: contactIdToUse,
          conversationId: selectedContact.conversation_id,
          metadata
        }, {
          onSuccess: () => resolve(true),
          onError: (error) => reject(error)
        });
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
