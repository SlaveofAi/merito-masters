import React, { useState, useEffect, useCallback } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import BookingRequestForm from "@/components/booking/BookingRequestForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { contacts, contactsLoading, refetchContacts } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews, hasActiveConversation } = useMessages(selectedContact, refetchContacts);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  const { userType } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
          if (isMobile) setSheetOpen(true);
          navigate('/messages', { replace: true });
          return;
        }
      }
      
      if (bookingConversationId) {
        const contact = contacts.find(c => c.conversation_id === bookingConversationId);
        if (contact) {
          console.log("Setting selected contact from booking redirect (conversation ID):", contact);
          setSelectedContact(contact);
          if (isMobile) setSheetOpen(true);
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
        if (isMobile) setSheetOpen(true);
        navigate('/messages', { replace: true });
      }
    } else if (conversationId && contacts && contacts.length > 0) {
      const contact = contacts.find(c => c.conversation_id === conversationId);
      if (contact) {
        console.log("Setting selected contact from conversation ID:", contact);
        setSelectedContact(contact);
        if (isMobile) setSheetOpen(true);
        navigate('/messages', { replace: true });
      }
    }
  }, [contacts, location, navigate, isMobile]);
  
  // New handler for navigating to profile when clicking on contact name
  const handleNavigateToProfile = (contactId: string) => {
    if (contactId) {
      console.log("Navigating to profile:", contactId);
      navigate(`/profile/${contactId}`);
      if (isMobile) {
        setSheetOpen(false);
      }
    }
  };
  
  const handleContactSelect = (contact: ChatContact) => {
    console.log("Selected contact:", contact);
    setSelectedContact(contact);
    if (isMobile) {
      setSheetOpen(true);
    }
  };
  
  const handleCloseChat = () => {
    setSheetOpen(false);
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
  
  // Check if the customer should see an empty chat view
  // This is true when they have craftsman contacts but no active conversations
  const showCustomerEmptyChat = userType === 'customer' && 
                              contacts && 
                              contacts.length > 0 && 
                              selectedContact && 
                              !selectedContact.conversation_id;
  
  // Mobile view using Sheet component
  if (isMobile) {
    return (
      <div className="flex flex-col h-[75vh]">
        {/* Contact list is always visible on mobile */}
        <div className="w-full h-full border rounded-lg shadow-sm bg-white">
          <ChatList 
            contacts={contacts} 
            selectedContactId={selectedContact?.id} 
            onSelectContact={handleContactSelect}
            loading={contactsLoading}
          />
        </div>
        
        {/* Chat window appears as a sliding sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="h-[92vh] p-0 pt-8">
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-2 border-b">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCloseChat}
                  className="mr-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 
                  className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => selectedContact && handleNavigateToProfile(selectedContact.contactId || selectedContact.id)}
                >
                  {selectedContact?.name || "Chat"}
                </h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow 
                  contact={selectedContact} 
                  messages={showCustomerEmptyChat ? [] : messages}
                  onSendMessage={handleSendMessage}
                  onArchive={archiveConversation}
                  onDelete={deleteConversation}
                  contactDetails={contactDetails}
                  customerReviews={customerReviews}
                  isMobile={true}
                  onContactNameClick={handleNavigateToProfile}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
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
  }
  
  // Desktop view
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
            messages={showCustomerEmptyChat ? [] : messages}
            onSendMessage={handleSendMessage}
            onArchive={archiveConversation}
            onDelete={deleteConversation}
            contactDetails={contactDetails}
            customerReviews={customerReviews}
            onContactNameClick={handleNavigateToProfile}
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
