
import React, { useState, useEffect, useRef } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatSubscription } from "@/hooks/useChatSubscription";
import { ChatContact } from "@/types/chat";
import { useQueryClient } from "@tanstack/react-query";

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const { contacts, contactsLoading, refetchContacts } = useContacts();
  const { messages, refetchMessages, contactDetails, customerReviews } = useMessages(selectedContact, refetchContacts);
  const { sendMessage, archiveConversation, deleteConversation } = useChatActions(
    selectedContact,
    setSelectedContact,
    refetchMessages
  );
  const queryClient = useQueryClient();
  const previousContactIdRef = useRef<string | null>(null);
  
  // Set up real-time updates
  useChatSubscription(selectedContact, refetchMessages, refetchContacts);
  
  // Handle contact selection and force re-fetch
  const handleContactSelect = (contact: ChatContact) => {
    console.log("Selected contact with unread count:", contact.unread_count);
    setSelectedContact(contact);
    
    // Force immediate query invalidation and contact refresh when selecting contact with unread messages
    if (contact.unread_count && contact.unread_count > 0) {
      console.log(`Contact ${contact.name} has ${contact.unread_count} unread messages - forcing immediate refresh`);
      
      // Force immediate message fetch and mark as read
      queryClient.invalidateQueries({ queryKey: ['chat-messages', contact.conversation_id], exact: true });
      
      // Force refresh contacts list right away to update badges
      refetchContacts();
      
      // Also invalidate the contact list to refresh badges
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      
      // Force a small delay and second refresh to ensure badges update
      setTimeout(() => {
        refetchContacts();
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      }, 200);
    }
  };
  
  // Force a re-fetch of contacts when selectedContact changes to ensure badges are updated
  useEffect(() => {
    if (selectedContact) {
      const currentContactId = selectedContact.id;
      
      // Only trigger the refresh if the contact actually changed
      if (previousContactIdRef.current !== currentContactId) {
        console.log(`Contact changed from ${previousContactIdRef.current} to ${currentContactId}`);
        previousContactIdRef.current = currentContactId;
      }
      
      // If the contact has unread messages, trigger contacts refresh
      if (selectedContact.unread_count && selectedContact.unread_count > 0) {
        console.log("Selected contact has unread messages - triggering immediate refresh");
        
        // Immediate refresh to update UI quickly
        refetchContacts();
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
        
        // Multiple staggered refreshes to ensure updates propagate through the system
        const refreshTimes = [200, 500, 1000];
        refreshTimes.forEach(time => {
          const timer = setTimeout(() => {
            console.log(`Refreshing contacts after ${time}ms delay`);
            refetchContacts();
            queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
          }, time);
          
          return () => clearTimeout(timer);
        });
      }
    }
  }, [selectedContact, refetchContacts, queryClient]);
  
  // Force another contacts refresh when messages change
  // This ensures unread counts are updated after messages are loaded
  useEffect(() => {
    if (messages.length > 0 && selectedContact?.unread_count && selectedContact.unread_count > 0) {
      console.log("Messages changed and there were unread messages - refreshing contacts");
      
      // Multiple staggered refreshes to ensure updates propagate
      const refreshTimes = [300, 600, 1000];
      refreshTimes.forEach(time => {
        const timer = setTimeout(() => {
          console.log(`Refreshing contacts after ${time}ms delay from message change`);
          refetchContacts();
          queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
        }, time);
        
        return () => clearTimeout(timer);
      });
    }
  }, [messages, selectedContact, refetchContacts, queryClient]);
  
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
