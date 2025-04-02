
import React, { useState } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const { contacts, contactsLoading } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews } = useMessages(selectedContact);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  
  // Set up real-time updates
  useChatSubscription(selectedContact, refetchMessages);
  
  const handleContactSelect = (contact: ChatContact) => {
    setSelectedContact(contact);
  };
  
  const handleSendMessage = (content: string, mediaFile?: File) => {
    sendMessage(content, mediaFile);
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
          onSendMessage={handleSendMessage}
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
