
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
  
  // Force a re-fetch of contacts when selectedContact changes to ensure badges are updated
  useEffect(() => {
    if (selectedContact) {
      // If the contact has unread messages, trigger contacts refresh
      if (selectedContact.unread_count && selectedContact.unread_count > 0) {
        // Small delay to allow messages to be marked as read first
        const timer = setTimeout(() => {
          console.log("Refreshing contacts after message read");
          refetchContacts();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [selectedContact, refetchContacts]);
  
  const handleContactSelect = (contact: ChatContact) => {
    console.log("Selected contact with unread count:", contact.unread_count);
    setSelectedContact(contact);
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
