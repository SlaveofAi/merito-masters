
import React, { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useContacts } from '@/hooks/useContacts';
import { useMessages } from '@/hooks/useMessages';
import { useChatActions } from '@/hooks/useChatActions';
import { useChatSubscription } from '@/hooks/useChatSubscription';
import { ChatContact } from '@/types/chat';
import { toast } from 'sonner';

const Chat = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const { contacts, refetchContacts, contactsLoading } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews, isLoading } = useMessages(selectedContact, refetchContacts);

  // Get chat actions (send, archive, delete messages)
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  
  // Set up realtime subscriptions
  useChatSubscription(selectedContact, refetchMessages, refetchContacts);
  
  // Check localStorage for selected contact on initial load
  useEffect(() => {
    try {
      const savedContactData = localStorage.getItem('selectedContact');
      if (savedContactData) {
        console.log("Found saved contact in localStorage:", savedContactData);
        const savedContact = JSON.parse(savedContactData);
        
        // Only set if we have the required fields
        if (savedContact && savedContact.id && savedContact.name) {
          console.log("Setting selected contact from localStorage:", savedContact);
          setSelectedContact(savedContact);
          
          // Clear the saved contact after setting it to prevent reusing it on subsequent visits
          localStorage.removeItem('selectedContact');
        }
      }
    } catch (e) {
      console.error("Error parsing saved contact:", e);
    }
  }, []);

  // Update the selected contact if it's found in the contacts list
  useEffect(() => {
    if (selectedContact?.contactId && contacts && contacts.length > 0 && !selectedContact.conversation_id) {
      // Try to find the contact in the contacts list
      const foundContact = contacts.find(contact => 
        contact.contactId === selectedContact.contactId || contact.id === selectedContact.contactId
      );
      
      if (foundContact && foundContact.conversation_id) {
        console.log("Updating selected contact with conversation ID:", foundContact.conversation_id);
        setSelectedContact(prevContact => ({
          ...prevContact!,
          conversation_id: foundContact.conversation_id
        }));
      }
    }
  }, [contacts, selectedContact]);

  // If a contact is selected but has no messages, show a message prompt
  useEffect(() => {
    if (selectedContact && !selectedContact.conversation_id && messages.length === 0) {
      console.log("New conversation with contact:", selectedContact.name);
      // Optionally show a toast or welcome message
      toast.info(`Nová konverzácia s ${selectedContact.name}`, {
        description: "Napíšte správu pre začiatok konverzácie",
        duration: 3000
      });
    }
  }, [selectedContact, messages.length]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex h-[75vh]">
      <div className="w-1/3 border-r border-gray-200">
        <ChatList 
          contacts={contacts} 
          selectedContactId={selectedContact?.id}
          onSelectContact={setSelectedContact}
          loading={contactsLoading}
        />
      </div>
      
      <div className="w-2/3">
        <ChatWindow
          contact={selectedContact}
          messages={messages}
          isLoading={isLoading}
          contactDetails={contactDetails}
          customerReviews={customerReviews}
          sendMessage={sendMessage}
          archiveConversation={archiveConversation}
          deleteConversation={deleteConversation}
        />
      </div>
    </div>
  );
};

export default Chat;
