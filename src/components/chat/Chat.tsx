
import React, { useState, useEffect } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";
import { useNavigate, useLocation } from "react-router-dom";

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const { contacts, contactsLoading, refetchContacts } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews } = useMessages(selectedContact, refetchContacts);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set up real-time updates with improved error handling
  useChatSubscription(selectedContact, refetchMessages, refetchContacts);
  
  // Debug output to help identify issues
  useEffect(() => {
    console.log("Current contacts:", contacts);
    console.log("Current location:", location);
    console.log("Current location state:", location.state);
  }, [contacts, location]);
  
  // Manual refresh effect to ensure we're getting fresh data
  useEffect(() => {
    // Initial data fetch
    refetchContacts();
    
    // Set up periodic refresh in case real-time fails
    const refreshInterval = setInterval(() => {
      console.log("Performing scheduled data refresh");
      refetchContacts();
      if (selectedContact) {
        refetchMessages();
      }
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(refreshInterval);
  }, [refetchContacts, refetchMessages, selectedContact]);
  
  // Check if we have a contact ID in the URL parameters or from navigation state
  useEffect(() => {
    // Check URL parameters first
    const searchParams = new URLSearchParams(location.search);
    const contactId = searchParams.get('contact');
    const conversationId = searchParams.get('conversation');
    
    // Check if we were redirected with state data
    const redirectedFromBooking = location.state?.from === 'booking';
    const bookingContactId = location.state?.contactId;
    const bookingConversationId = location.state?.conversationId;
    
    if (redirectedFromBooking && contacts && contacts.length > 0) {
      console.log("Redirected from booking page with data:", location.state);
      
      // First try to find by contact ID if provided
      if (bookingContactId) {
        const contact = contacts.find(c => c.id === bookingContactId || c.contactId === bookingContactId);
        if (contact) {
          console.log("Setting selected contact from booking redirect (contact ID):", contact);
          setSelectedContact(contact);
          // Clear the state after using it
          navigate('/messages', { replace: true });
          return;
        }
      }
      
      // Then try by conversation ID if provided
      if (bookingConversationId) {
        const contact = contacts.find(c => c.conversation_id === bookingConversationId);
        if (contact) {
          console.log("Setting selected contact from booking redirect (conversation ID):", contact);
          setSelectedContact(contact);
          // Clear the state after using it
          navigate('/messages', { replace: true });
          return;
        }
      }
    }
    
    // If not from booking redirect, check URL params
    if (contactId && contacts && contacts.length > 0) {
      const contact = contacts.find(c => c.id === contactId || c.contactId === contactId);
      if (contact) {
        console.log("Setting selected contact from URL params:", contact);
        setSelectedContact(contact);
        // Clear the URL parameters
        navigate('/messages', { replace: true });
      }
    } else if (conversationId && contacts && contacts.length > 0) {
      const contact = contacts.find(c => c.conversation_id === conversationId);
      if (contact) {
        console.log("Setting selected contact from conversation ID:", contact);
        setSelectedContact(contact);
        // Clear the URL parameters
        navigate('/messages', { replace: true });
      }
    }
  }, [contacts, location, navigate]);
  
  const handleContactSelect = (contact: ChatContact) => {
    console.log("Selected contact:", contact);
    setSelectedContact(contact);
  };
  
  const handleSendMessage = (content: string, metadata?: any) => {
    console.log("Sending message with content:", content);
    if (metadata) {
      console.log("With metadata:", metadata);
    }
    sendMessage(content, metadata);
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
