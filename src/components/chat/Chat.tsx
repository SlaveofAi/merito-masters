
import React, { useState, useEffect } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const { contacts, contactsLoading, refetchContacts } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews } = useMessages(selectedContact, refetchContacts);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  
  // Set up real-time updates
  useChatSubscription(selectedContact, refetchMessages, refetchContacts);
  
  const handleContactSelect = (contact: ChatContact) => {
    setSelectedContact(contact);
    
    // If the contact has unread messages, we'll mark them as read in the useMessages hook
    // but we should also refresh the contacts list in case there was already a selection
    if (contact.unread_count && contact.unread_count > 0) {
      // Allow a small delay for the messages to be marked as read first
      setTimeout(() => {
        refetchContacts();
      }, 300);
    }
  };
  
  return (
    <div className="flex bg-white rounded-lg shadow-sm overflow-hidden h-[75vh]">
      <div className="w-full sm:w-1/3 border-r">
        <ChatList 
          contacts={contacts} 
          selectedContactId={selectedContact?.id} 
          onSelectContact={handleContactSelect}
          loading={contactsLoading}
        />
      </div>
      <div className="hidden sm:block sm:w-2/3">
        <ChatWindow 
          contact={selectedContact} 
          messages={messages}
          onSendMessage={sendMessage}
          onArchive={archiveConversation}
          onDelete={deleteConversation}
          contactDetails={contactDetails}
          customerReviews={customerReviews}
        />
      </div>
    </div>
  );
};

export default Chat;
