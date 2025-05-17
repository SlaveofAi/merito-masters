
import React, { useState, useEffect, useCallback } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact, ChatContactClickHandler } from "@/types/chat";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import BookingRequestForm from "@/components/booking/BookingRequestForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ChatProps extends ChatContactClickHandler {
  initialContact?: any;
  contactIdFromUrl?: string | null;
}

const Chat: React.FC<ChatProps> = ({ onContactNameClick, initialContact, contactIdFromUrl }) => {
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
  
  // Handle initial contact selection based on URL params or location state
  useEffect(() => {
    console.log("Initial contact data:", { initialContact, contactIdFromUrl, contacts, userType });
    
    // Wait until contacts are loaded
    if (contactsLoading) {
      return;
    }
    
    // First priority: Select contact from initialContact prop (from profile page)
    if (initialContact && !selectedContact) {
      console.log("Setting contact from initialContact:", initialContact);
      
      // Check if we already have this contact in our contacts list
      const existingContact = contacts?.find(c => 
        c.id === initialContact.id || c.contactId === initialContact.id
      );
      
      if (existingContact) {
        console.log("Found existing contact in contacts list:", existingContact);
        setSelectedContact(existingContact);
        if (isMobile) setSheetOpen(true);
      } else {
        // Create a synthetic contact for initial messaging
        // FIX: Ensure we have proper user_type and other fields set
        const syntheticContact: ChatContact = {
          id: initialContact.id,
          contactId: initialContact.id,
          name: initialContact.name || "Contact",
          avatar_url: initialContact.profile_image_url || undefined,
          last_message: "",
          last_message_time: new Date().toISOString(),
          unread_count: 0,
          user_type: initialContact.user_type || (userType === 'customer' ? 'craftsman' : 'customer'),
          conversation_id: undefined // No conversation yet
        };
        
        console.log("Created synthetic contact for initial messaging:", syntheticContact);
        setSelectedContact(syntheticContact);
        if (isMobile) setSheetOpen(true);

        // Immediately attempt to send an empty message to create the conversation
        // This ensures the chat window is properly set up
        setTimeout(() => {
          sendMessage(" ", { type: "initialization" }).then(() => {
            // After creating the conversation, refresh contacts to show it in the list
            refetchContacts();
            setTimeout(refetchMessages, 500);
          }).catch(err => {
            console.error("Error initializing chat:", err);
          });
        }, 500);
      }
      
      // Clear the location state to avoid re-selecting this contact on navigation
      navigate('/messages', { replace: true });
      return;
    }
    
    // Second priority: Select contact from URL param
    if (contactIdFromUrl && contacts?.length > 0 && !selectedContact) {
      const contact = contacts.find(c => c.id === contactIdFromUrl || c.contactId === contactIdFromUrl);
      if (contact) {
        console.log("Setting selected contact from URL param:", contact);
        setSelectedContact(contact);
        if (isMobile) setSheetOpen(true);
        // Clear the URL parameter
        navigate('/messages', { replace: true });
      } else {
        // FIX: Contact ID is provided but not found in existing contacts
        // This happens when coming from profile "Send Message" button
        // We should create a synthetic contact and initialize chat
        console.log("Contact ID provided but not found in contacts, creating synthetic contact");
        
        // Attempt to load the contact details from Supabase
        const fetchContactDetails = async () => {
          try {
            // First determine if this is a customer or craftsman
            const { data: userTypeData } = await supabase
              .from('user_types')
              .select('user_type')
              .eq('user_id', contactIdFromUrl)
              .maybeSingle();
              
            if (!userTypeData) {
              console.error("Could not determine user type for contact");
              return;
            }
            
            // Then fetch profile from appropriate table
            const isContactCraftsman = userTypeData.user_type === 'craftsman';
            const profileTable = isContactCraftsman ? 'craftsman_profiles' : 'customer_profiles';
            
            const { data: profile } = await supabase
              .from(profileTable)
              .select('*')
              .eq('id', contactIdFromUrl)
              .maybeSingle();
              
            if (profile) {
              // Create synthetic contact
              const syntheticContact: ChatContact = {
                id: contactIdFromUrl,
                contactId: contactIdFromUrl,
                name: profile.name || "Contact",
                avatar_url: profile.profile_image_url || undefined,
                last_message: "",
                last_message_time: new Date().toISOString(),
                unread_count: 0,
                user_type: userTypeData.user_type,
                conversation_id: undefined
              };
              
              console.log("Created synthetic contact from database:", syntheticContact);
              setSelectedContact(syntheticContact);
              if (isMobile) setSheetOpen(true);
              
              // Initialize the conversation
              setTimeout(() => {
                sendMessage(" ", { type: "initialization" }).then(() => {
                  refetchContacts();
                  setTimeout(refetchMessages, 500);
                }).catch(err => {
                  console.error("Error initializing chat:", err);
                });
              }, 500);
            }
          } catch (error) {
            console.error("Error fetching contact details:", error);
          }
        };
        
        fetchContactDetails();
      }
      return;
    }
    
    // Third priority: Handle redirects from location state
    if (location.state && !selectedContact) {
      console.log("Current location state:", location.state);
      
      // Handle booking redirects
      if (location.state.from === 'booking') {
        console.log("Redirected from booking page with data:", location.state);
        
        const { contactId, conversationId } = location.state;
        
        if (contactId && contacts?.length > 0) {
          const contact = contacts.find(c => c.id === contactId || c.contactId === contactId);
          if (contact) {
            console.log("Setting selected contact from booking redirect (contact ID):", contact);
            setSelectedContact(contact);
            if (isMobile) setSheetOpen(true);
            navigate('/messages', { replace: true });
            return;
          }
        }
        
        if (conversationId && contacts?.length > 0) {
          const contact = contacts.find(c => c.conversation_id === conversationId);
          if (contact) {
            console.log("Setting selected contact from booking redirect (conversation ID):", contact);
            setSelectedContact(contact);
            if (isMobile) setSheetOpen(true);
            navigate('/messages', { replace: true });
            return;
          }
        }
      }
    }
  }, [contacts, contactsLoading, initialContact, contactIdFromUrl, selectedContact, location, navigate, isMobile, userType, sendMessage, refetchContacts, refetchMessages]);
  
  useEffect(() => {
    refetchContacts();
    
    const refreshInterval = setInterval(() => {
      console.log("Performing scheduled data refresh");
      refreshData();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(refreshInterval);
  }, [refetchContacts, refreshData]);
  
  // New handler for navigating to profile when clicking on contact name
  const handleNavigateToProfile = (contactId: string) => {
    if (contactId) {
      console.log("Navigating to profile:", contactId);
      
      // Use the provided callback if available, otherwise use default navigation
      if (onContactNameClick) {
        onContactNameClick(contactId);
      } else {
        navigate(`/profile/${contactId}`);
      }
      
      if (isMobile) {
        setSheetOpen(false);
      }
    }
  };
  
  // Handle contact selection
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
