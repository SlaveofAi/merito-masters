
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

export const useContacts = () => {
  const { user, userType } = useAuth();
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['chat-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const contactType = userType === 'customer' ? 'craftsman' : 'customer';
      
      console.log(`Fetching conversations for ${userType} with ID ${user.id}`);
      
      // First get all conversations for current user
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`customer_id.eq.${user.id},craftsman_id.eq.${user.id}`)
        .eq(userType === 'customer' ? 'is_deleted_by_customer' : 'is_deleted_by_craftsman', false);
      
      if (convError) {
        console.error("Error fetching conversations:", convError);
        toast.error("Nastala chyba pri načítaní konverzácií");
        return [];
      }
      
      console.log("Fetched conversations:", conversations);
      
      // No conversations yet, get potential contacts
      if (!conversations || conversations.length === 0) {
        console.log(`No conversations found, fetching potential ${contactType} contacts`);
        
        const { data, error } = await supabase
          .from(contactType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles')
          .select('id, name, profile_image_url')
          .limit(10);
          
        if (error) {
          console.error("Error fetching potential contacts:", error);
          toast.error("Nastala chyba pri načítaní kontaktov");
          return [];
        }
        
        console.log(`Found ${data?.length || 0} potential contacts`);
        
        return data.map((contact): ChatContact => ({
          id: contact.id,
          name: contact.name,
          avatar_url: contact.profile_image_url,
          last_message: 'Kliknite pre zahájenie konverzácie',
          last_message_time: new Date().toISOString(),
          unread_count: 0,
          user_type: contactType
        }));
      }
      
      // Get contact details for each conversation
      const contactPromises = conversations.map(async (conv) => {
        const contactId = userType === 'customer' ? conv.craftsman_id : conv.customer_id;
        const profileTable = userType === 'customer' ? 'craftsman_profiles' : 'customer_profiles';
        
        console.log(`Getting contact details for ${contactId} from ${profileTable}`);
        
        try {
          const { data: contactData, error: contactError } = await supabase
            .from(profileTable)
            .select('id, name, profile_image_url')
            .eq('id', contactId)
            .single();
            
          if (contactError) {
            console.error("Error fetching contact details:", contactError);
            return null;
          }
          
          if (!contactData) {
            console.error(`No contact found with ID ${contactId}`);
            return null;
          }
          
          // Get last message and unread count
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          const lastMessage = lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null;
          
          // Count unread messages
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', user.id)
            .eq('read', false);
            
          return {
            id: contactData.id,
            name: contactData.name,
            avatar_url: contactData.profile_image_url,
            last_message: lastMessage ? lastMessage.content : 'Kliknite pre zobrazenie správ',
            last_message_time: lastMessage ? lastMessage.created_at : conv.created_at,
            unread_count: count || 0,
            user_type: contactType,
            conversation_id: conv.id
          } as ChatContact;
        } catch (err) {
          console.error("Error in contact processing:", err);
          return null;
        }
      });
      
      const resolvedContacts = await Promise.all(contactPromises);
      const filteredContacts = resolvedContacts.filter(contact => contact !== null) as ChatContact[];
      console.log(`Retrieved ${filteredContacts.length} contacts with conversations`);
      return filteredContacts;
    },
    enabled: !!user,
  });

  // Update loading state
  useState(() => {
    setLoading(contactsLoading);
  });

  return {
    contacts,
    loading,
    contactsLoading,
    refetchContacts: () => queryClient.invalidateQueries({ queryKey: ['chat-contacts'] })
  };
};
