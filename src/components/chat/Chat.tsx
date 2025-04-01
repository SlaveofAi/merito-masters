
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { toast } from "sonner";

export interface ChatContact {
  id: string;
  name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  user_type: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

const Chat = () => {
  const { user, userType } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch contacts from your database
      // For now, we'll generate sample contacts
      const contactType = userType === 'customer' ? 'craftsman' : 'customer';
      
      const { data, error } = await supabase
        .from(contactType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles')
        .select('id, name, profile_image_url')
        .limit(5);
        
      if (error) throw error;
      
      const formattedContacts = data.map((contact): ChatContact => ({
        id: contact.id,
        name: contact.name,
        avatar_url: contact.profile_image_url,
        last_message: 'Nová správa... (ukážka)',
        last_message_time: new Date().toISOString(),
        unread_count: Math.floor(Math.random() * 3),
        user_type: contactType
      }));
      
      setContacts(formattedContacts);
      
      // Select the first contact by default
      if (formattedContacts.length > 0 && !selectedContact) {
        setSelectedContact(formattedContacts[0]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Nastala chyba pri načítaní kontaktov");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      // In a real app, you would fetch messages from your database
      // For now, we'll generate sample messages
      const sampleMessages: Message[] = [
        {
          id: '1',
          sender_id: user?.id || '',
          receiver_id: contactId,
          content: 'Dobrý deň, mám záujem o vaše služby.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: '2',
          sender_id: contactId,
          receiver_id: user?.id || '',
          content: 'Dobrý deň, ďakujem za správu. Kedy by vám vyhovoval termín stretnutia?',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          read: true
        },
        {
          id: '3',
          sender_id: user?.id || '',
          receiver_id: contactId,
          content: 'Mohol by som prísť v utorok okolo 14:00?',
          created_at: new Date(Date.now() - 2000000).toISOString(),
          read: true
        },
        {
          id: '4',
          sender_id: contactId,
          receiver_id: user?.id || '',
          content: 'Áno, utorok o 14:00 mi vyhovuje. Teším sa na stretnutie.',
          created_at: new Date(Date.now() - 1000000).toISOString(),
          read: false
        }
      ];
      
      setMessages(sampleMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Nastala chyba pri načítaní správ");
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedContact || !content.trim() || !user) return;
    
    try {
      // In a real app, you would save the message to your database
      // For now, we'll just add it to the local state
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: content,
        created_at: new Date().toISOString(),
        read: false
      };
      
      setMessages([...messages, newMessage]);
      
      // Update the last message in contacts
      setContacts(contacts.map(contact => 
        contact.id === selectedContact.id 
          ? { 
              ...contact, 
              last_message: content,
              last_message_time: new Date().toISOString() 
            } 
          : contact
      ));
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Nastala chyba pri odosielaní správy");
    }
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
        />
      </div>
    </div>
  );
};

export default Chat;
