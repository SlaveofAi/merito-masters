import React, { useState, useEffect, useCallback } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BookingRequestForm from "@/components/booking/BookingRequestForm";

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { contacts, contactsLoading, refetchContacts } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews } = useMessages(selectedContact, refetchContacts);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const refreshData = useCallback(() => {
    console.log("Manual data refresh triggered");
    refetchContacts();
    if (selectedContact) {
      refetchMessages();
    }
  }, [refetchContacts, refetchMessages, selectedContact]);
  
  useChatSubscription(selectedContact, refetchMessages, refetchContacts);
  
  useEffect(() => {
    console.log("Current contacts:", contacts);
    console.log("Current location:", location);
    console.log("Current location state:", location.state);
  }, [contacts, location]);
  
  useEffect(() => {
    refetchContacts();
    
    const refreshInterval = setInterval(() => {
      console.log("Performing scheduled data refresh");
      refreshData();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(refreshInterval);
  }, [refetchContacts, refreshData]);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const contactId = searchParams.get('contact');
    const conversationId = searchParams.get('conversation');
    
    const redirectedFromBooking = location.state?.from === 'booking';
    const bookingContactId = location.state?.contactId;
    const bookingConversationId = location.state?.conversationId;
    
    if (redirectedFromBooking && contacts && contacts.length > 0) {
      console.log("Redirected from booking page with data:", location.state);
      
      if (bookingContactId) {
        const contact = contacts.find(c => c.id === bookingContactId || c.contactId === bookingContactId);
        if (contact) {
          console.log("Setting selected contact from booking redirect (contact ID):", contact);
          setSelectedContact(contact);
          navigate('/messages', { replace: true });
          return;
        }
      }
      
      if (bookingConversationId) {
        const contact = contacts.find(c => c.conversation_id === bookingConversationId);
        if (contact) {
          console.log("Setting selected contact from booking redirect (conversation ID):", contact);
          setSelectedContact(contact);
          navigate('/messages', { replace: true });
          return;
        }
      }
    }
    
    if (contactId && contacts && contacts.length > 0) {
      const contact = contacts.find(c => c.id === contactId || c.contactId === contactId);
      if (contact) {
        console.log("Setting selected contact from URL params:", contact);
        setSelectedContact(contact);
        navigate('/messages', { replace: true });
      }
    } else if (conversationId && contacts && contacts.length > 0) {
      const contact = contacts.find(c => c.conversation_id === conversationId);
      if (contact) {
        console.log("Setting selected contact from conversation ID:", contact);
        setSelectedContact(contact);
        navigate('/messages', { replace: true });
      }
    }
  }, [contacts, location, navigate]);
  
  const handleContactSelect = (contact: ChatContact) => {
    console.log("Selected contact:", contact);
    setSelectedContact(contact);
  };
  
  const handleSendMessage = async (content: string, metadata?: any) => {
    console.log("Sending message with content:", content);
    if (metadata) {
      console.log("With metadata:", metadata);
    }
    
    try {
      await sendMessage(content, metadata);
      
      setTimeout(() => {
        console.log("Refreshing data after sending message");
        refetchMessages();
        refetchContacts();
      }, 1000);
      
      if (metadata?.type === 'booking_request') {
        toast.success("Požiadavka na rezerváciu odoslaná");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Nastala chyba pri odosielaní správy. Skúste to prosím znova.");
      
      setTimeout(() => {
        refetchMessages();
        refetchContacts();
      }, 1000);
    }
  };
  
  const getCraftsmanId = () => {
    const id = selectedContact?.contactId || selectedContact?.id || '';
    console.log("Craftsman ID for booking form:", id, "Selected contact:", selectedContact);
    return id;
  };
  
  return (
    <div className="flex flex-col">
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
      
      {showBookingForm && (
        <BookingRequestForm
          onSubmit={(content, metadata) => {
            handleSendMessage(content, metadata);
            setShowBookingForm(false);
          }}
          onCancel={() => setShowBookingForm(false)}
          craftsmanId={getCraftsmanId()}
        />
      )}
    </div>
  );
};

export default Chat;
