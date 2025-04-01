
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase, chatTables } from "@/integrations/supabase/client";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ChatContact {
  id: string;
  name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  user_type: string;
  conversation_id?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

// Interface for chat_conversations table
interface ChatConversation {
  id: string;
  customer_id: string;
  craftsman_id: string;
  created_at: string;
  updated_at: string;
  is_archived_by_customer: boolean;
  is_archived_by_craftsman: boolean;
  is_deleted_by_customer: boolean;
  is_deleted_by_craftsman: boolean;
}

// Interface for chat_messages table
interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

const Chat = () => {
  const { user, userType } = useAuth();
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['chat-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const contactType = userType === 'customer' ? 'craftsman' : 'customer';
      
      // First get all conversations for current user
      const { data: conversations, error: convError } = await chatTables.conversations()
        .select('*')
        .or(`customer_id.eq.${user.id},craftsman_id.eq.${user.id}`)
        .eq(userType === 'customer' ? 'is_deleted_by_customer' : 'is_deleted_by_craftsman', false);
      
      if (convError) {
        console.error("Error fetching conversations:", convError);
        toast.error("Nastala chyba pri načítaní konverzácií");
        return [];
      }
      
      // No conversations yet, get potential contacts
      if (!conversations || conversations.length === 0) {
        const { data, error } = await supabase
          .from(contactType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles')
          .select('id, name, profile_image_url')
          .limit(10);
          
        if (error) {
          console.error("Error fetching potential contacts:", error);
          toast.error("Nastala chyba pri načítaní kontaktov");
          return [];
        }
        
        return data.map((contact): ChatContact => ({
          id: contact.id,
          name: contact.name,
          avatar_url: contact.profile_image_url,
          last_message: 'Kliknite pre zahájenie konverzácie',
          last_message_time: new Date().toISOString(),
          unread_count: 0,
          user_type: contactType
        }));
      }
      
      // Get contact details for each conversation
      const contactPromises = conversations.map(async (conv: ChatConversation) => {
        const contactId = userType === 'customer' ? conv.craftsman_id : conv.customer_id;
        const profileTable = userType === 'customer' ? 'craftsman_profiles' : 'customer_profiles';
        
        const { data: contactData, error: contactError } = await supabase
          .from(profileTable)
          .select('id, name, profile_image_url')
          .eq('id', contactId)
          .single();
          
        if (contactError || !contactData) {
          console.error("Error fetching contact details:", contactError);
          return null;
        }
        
        // Get last message and unread count
        const { data: lastMessageData, error: lastMessageError } = await chatTables.messages()
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        const lastMessage = lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null;
        
        // Count unread messages
        const { count, error: countError } = await chatTables.messages()
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('receiver_id', user.id)
          .eq('read', false);
          
        return {
          id: contactData.id,
          name: contactData.name,
          avatar_url: contactData.profile_image_url,
          last_message: lastMessage ? lastMessage.content : 'Kliknite pre zobrazenie správ',
          last_message_time: lastMessage ? lastMessage.created_at : conv.created_at,
          unread_count: count || 0,
          user_type: contactType,
          conversation_id: conv.id
        } as ChatContact;
      });
      
      const resolvedContacts = await Promise.all(contactPromises);
      return resolvedContacts.filter(contact => contact !== null) as ChatContact[];
    },
    enabled: !!user,
  });

  // Fetch messages for selected contact
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', selectedContact?.conversation_id],
    queryFn: async () => {
      if (!selectedContact || !user) return [];
      
      if (!selectedContact.conversation_id) {
        return [];
      }
      
      const { data, error } = await chatTables.messages()
        .select('*')
        .eq('conversation_id', selectedContact.conversation_id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Nastala chyba pri načítaní správ");
        return [];
      }
      
      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => msg.receiver_id === user.id && !msg.read);
        
        if (unreadMessages.length > 0) {
          unreadMessages.forEach(async (msg) => {
            await chatTables.messages()
              .update({ read: true })
              .eq('id', msg.id);
          });
          
          // Refresh contact list to update unread count
          queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
        }
      }
      
      return data as Message[];
    },
    enabled: !!selectedContact?.conversation_id && !!user,
  });
  
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
      if (!user || !contactId || !content.trim()) return null;
      
      let convId = conversationId;
      
      // Create a new conversation if it doesn't exist
      if (!convId) {
        const newConversation = {
          customer_id: userType === 'customer' ? user.id : contactId,
          craftsman_id: userType === 'craftsman' ? user.id : contactId,
        };

        const { data: insertedConv, error: convError } = await chatTables.conversations()
          .insert(newConversation)
          .select()
          .single();
          
        if (convError) {
          // Check if conversation already exists (because of unique constraint)
          const { data: existingConv, error: fetchError } = await chatTables.conversations()
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
        } else if (insertedConv) {
          convId = insertedConv.id;
        }
      }
      
      // Insert the message
      const newMessage = {
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: contactId,
        content: content,
      };

      const { data: insertedMessage, error: msgError } = await chatTables.messages()
        .insert(newMessage)
        .select()
        .single();
        
      if (msgError) {
        console.error("Error sending message:", msgError);
        toast.error("Nastala chyba pri odosielaní správy");
        return null;
      }
      
      // Update conversation's updated_at timestamp
      await chatTables.conversations()
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
      
      return { message: insertedMessage, conversationId: convId };
    },
    onSuccess: (data) => {
      if (data) {
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
    }
  });

  // Set first contact as selected by default
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  // Clear selected contact when user changes
  useEffect(() => {
    setSelectedContact(null);
  }, [user]);

  useEffect(() => {
    setLoading(contactsLoading);
  }, [contactsLoading]);

  const sendMessage = async (content: string) => {
    if (!selectedContact || !content.trim() || !user) return;
    
    sendMessageMutation.mutate({
      content,
      contactId: selectedContact.id,
      conversationId: selectedContact.conversation_id
    });
  };

  // Subscribe to new messages via Supabase realtime
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        // Refresh messages if conversation is selected
        if (selectedContact?.conversation_id) {
          refetchMessages();
        }
        
        // Refresh contact list
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedContact, refetchMessages, queryClient]);

  const archiveConversation = async () => {
    if (!selectedContact?.conversation_id || !user) return;
    
    const fieldToUpdate = userType === 'customer' 
      ? 'is_archived_by_customer' 
      : 'is_archived_by_craftsman';
      
    const { error } = await chatTables.conversations()
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
      
    const { error } = await chatTables.conversations()
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gray-50 h-64">
        <p className="text-gray-500 mb-4">Pre zobrazenie správ sa prosím prihláste.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[75vh]">
      <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden border border-border">
        <ChatList 
          contacts={contacts}
          selectedContactId={selectedContact?.id}
          onSelectContact={setSelectedContact}
          loading={loading}
        />
      </div>
      <div className="md:col-span-3 bg-white rounded-lg shadow-sm overflow-hidden border border-border">
        <ChatWindow 
          contact={selectedContact}
          messages={messages}
          onSendMessage={sendMessage}
          onArchive={archiveConversation}
          onDelete={deleteConversation}
        />
      </div>
    </div>
  );
};

export default Chat;
