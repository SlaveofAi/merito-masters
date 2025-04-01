
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";

const Chat = () => {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  
  const { contacts, loading } = useContacts();
  const { messages, refetchMessages } = useMessages(selectedContact);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  
  // Set up realtime subscription
  useChatSubscription(selectedContact, refetchMessages);

  // Set first contact as selected by default
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      console.log("Setting first contact as selected:", contacts[0]);
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  // Clear selected contact when user changes
  useEffect(() => {
    setSelectedContact(null);
  }, [user]);

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
