
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

  // Fetch contacts with improved caching strategy
  const { data: contacts = [], isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ['chat-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const contactType = userType === 'customer' ? 'craftsman' : 'customer';
      
      console.log(`Fetching conversations for ${userType} with ID ${user.id}`);
      
      // First get all conversations for current user
      const fieldToCheck = userType === 'customer' ? 'is_deleted_by_customer' : 'is_deleted_by_craftsman';
      
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`customer_id.eq.${user.id},craftsman_id.eq.${user.id}`)
        .eq(fieldToCheck, false);
      
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
        
        // Create a fallback contact if we can't find the profile
        const createFallbackContact = (): ChatContact => ({
          id: contactId,
          name: "Neznámy užívateľ",
          avatar_url: undefined,
          last_message: "No messages yet",
          last_message_time: conv.created_at,
          unread_count: 0,
          user_type: contactType,
          conversation_id: conv.id
        });
        
        try {
          const { data: contactData, error: contactError } = await supabase
            .from(profileTable)
            .select('id, name, profile_image_url')
            .eq('id', contactId);
            
          if (contactError || !contactData || contactData.length === 0) {
            console.error(`Error or no data for contact with ID ${contactId}:`, contactError);
            return createFallbackContact();
          }
          
          const contact = contactData[0];
          if (!contact) {
            console.error(`No contact found with ID ${contactId}`);
            return createFallbackContact();
          }
          
          // Get last message - use a fresh request without any caching
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          const lastMessage = lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null;
          
          // Count unread messages - CRITICAL - use a completely separate request
          // with no cache to ensure accurate counts
          console.log(`Counting unread messages for conversation ${conv.id}`);
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', user.id)
            .eq('read', false);
            
          console.log(`Found contact ${contact.name} with ${count || 0} unread messages`);
          
          return {
            id: contact.id,
            name: contact.name,
            avatar_url: contact.profile_image_url,
            last_message: lastMessage ? lastMessage.content : 'Kliknite pre zobrazenie správ',
            last_message_time: lastMessage ? lastMessage.created_at : conv.created_at,
            unread_count: count || 0,
            user_type: contactType,
            conversation_id: conv.id
          } as ChatContact;
        } catch (err) {
          console.error("Error in contact processing:", err);
          return createFallbackContact();
        }
      });
      
      const resolvedContacts = await Promise.all(contactPromises);
      // Filter out null values and ensure we have unique contacts
      const filteredContacts = resolvedContacts.filter(contact => contact !== null) as ChatContact[];
      console.log(`Retrieved ${filteredContacts.length} contacts with conversations`);
      
      return filteredContacts;
    },
    enabled: !!user,
    // More aggressive refetching to ensure unread counts are accurate
    refetchInterval: 5000, // Refresh more frequently (every 5 seconds)
    refetchOnWindowFocus: true,
    staleTime: 0, // No stale time - always fetch fresh data
    networkMode: 'always', // Always fetch from network
    refetchOnMount: true,
  });

  // Update loading state
  useState(() => {
    setLoading(contactsLoading);
  });

  return {
    contacts,
    loading,
    contactsLoading,
    refetchContacts
  };
};
