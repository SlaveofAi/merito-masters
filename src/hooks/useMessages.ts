
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";
import { BasicProfile } from "@/types/profile";
import { useEffect, useCallback } from "react";

export const useMessages = (selectedContact: ChatContact | null, refetchContacts: () => void) => {
  const { user, userType } = useAuth();
  const queryClient = useQueryClient();

  // Add a specific mutation for marking messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return { success: false };
      
      console.log(`Explicitly marking all messages as read for conversation ${conversationId}`);
      
      try {
        // Use direct update for better reliability - update in batch
        const { error } = await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('conversation_id', conversationId)
          .eq('receiver_id', user.id)
          .eq('read', false);
        
        if (error) {
          console.error("Error marking messages as read:", error);
          return { success: false, error };
        }
        
        console.log("Successfully marked all messages as read");
        return { success: true };
      } catch (err) {
        console.error("Exception marking messages as read:", err);
        return { success: false, error: err };
      }
    },
    onSuccess: () => {
      // Force refresh contacts to update badges immediately
      refetchContacts();
      
      // Invalidate queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      
      // Additional invalidation after a short delay to ensure changes propagate
      setTimeout(() => {
        refetchContacts();
        queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      }, 300);
    }
  });
  
  // Expose this function to be called from outside
  const markMessagesAsRead = useCallback((conversationId: string) => {
    console.log(`Marking messages as read for conversation ${conversationId}`);
    return markAsReadMutation.mutate(conversationId);
  }, [markAsReadMutation]);

  // Fetch messages for selected contact with improved read status handling
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', selectedContact?.conversation_id],
    queryFn: async () => {
      if (!selectedContact || !user) return [];
      
      if (!selectedContact.conversation_id) {
        console.log("No conversation ID for selected contact");
        return [];
      }
      
      console.log(`Fetching messages for conversation ${selectedContact.conversation_id}`);
      
      // First get messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedContact.conversation_id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Nastala chyba pri načítaní správ");
        return [];
      }
      
      console.log(`Retrieved ${data?.length || 0} messages`);
      
      // Mark messages as read - use more aggressive approach to ensure updates
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Found ${unreadMessages.length} unread messages - marking as read immediately`);
          
          // Use our explicit function to mark messages as read
          markMessagesAsRead(selectedContact.conversation_id);
          
          // Also immediately update the local contact cache to show 0 unread
          queryClient.setQueryData(['chat-contacts'], (oldData: any) => {
            if (!oldData) return oldData;
            
            return oldData.map((contact: ChatContact) => {
              if (contact.id === selectedContact.id) {
                console.log(`Immediately setting unread count for ${contact.name} to 0 in cache`);
                return { ...contact, unread_count: 0 };
              }
              return contact;
            });
          });
        }
      }
      
      return data as Message[];
    },
    enabled: !!selectedContact?.conversation_id && !!user,
    // Improve refetching strategy for better real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // No stale time for critical data
    gcTime: 0, // Updated from cacheTime to gcTime - the modern property name
    networkMode: 'always', // Always fetch from network, don't use cache for critical data
  });

  // Enhanced effect to update contacts more aggressively when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedContact?.conversation_id) {
      console.log("Messages loaded - ensuring all are marked as read");
      
      // Mark all messages as read whenever messages are loaded
      markMessagesAsRead(selectedContact.conversation_id);
      
      // Immediate refresh
      refetchContacts();
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
      
      // Multiple staggered refreshes to ensure updates take effect
      const refreshTimes = [200, 500, 1000, 2000];
      const timers = refreshTimes.map(time => {
        return setTimeout(() => {
          console.log(`Refreshing contacts after ${time}ms delay since messages changed`);
          refetchContacts();
          queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
        }, time);
      });
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [messages, selectedContact, refetchContacts, queryClient, markMessagesAsRead]);

  // Fetch detailed contact information with better error handling and fallbacks
  const { data: contactDetails } = useQuery({
    queryKey: ['contact-details', selectedContact?.id, selectedContact?.user_type],
    queryFn: async () => {
      if (!selectedContact || !user) return null;
      
      console.log(`Attempting to fetch details for contact ${selectedContact.id} of type ${selectedContact.user_type}`);
      
      try {
        // Determine which table to query based on the contact type
        const primaryTable = selectedContact.user_type === 'customer' 
          ? 'customer_profiles' 
          : 'craftsman_profiles';
        
        // Step 1: Try primary profile table first
        console.log(`First attempt: Querying ${primaryTable} for contact ${selectedContact.id}`);
        const { data: primaryData, error: primaryError } = await supabase
          .from(primaryTable)
          .select('*')
          .eq('id', selectedContact.id)
          .maybeSingle();
          
        if (!primaryError && primaryData) {
          console.log(`Successfully found contact in ${primaryTable}:`, primaryData);
          
          // Make sure we have a consistent profile shape regardless of the table source
          return {
            ...primaryData,
            user_type: selectedContact.user_type
          };
        }
        
        // If primary lookup failed, log the error
        if (primaryError) {
          console.error(`Error querying ${primaryTable}:`, primaryError);
        } else {
          console.log(`No data found in ${primaryTable} for id ${selectedContact.id}`);
        }
        
        // Step 2: Try the profiles table as fallback
        console.log(`Second attempt: Querying profiles table for contact ${selectedContact.id}`);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', selectedContact.id)
          .maybeSingle();
          
        if (!profileError && profileData) {
          console.log(`Found contact in profiles table:`, profileData);
          
          // Ensure the profile data has all the required fields
          const enhancedProfile: BasicProfile = {
            id: profileData.id,
            name: profileData.name || "Neznámy užívateľ",
            email: "",
            location: "",
            profile_image_url: null,
            phone: null,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
            user_type: selectedContact.user_type
          };
          
          return enhancedProfile;
        }
        
        if (profileError) {
          console.error("Error querying profiles table:", profileError);
        } else {
          console.log(`No data found in profiles table for id ${selectedContact.id}`);
        }
        
        // Step 3: Create a minimal profile from what we know if all lookups fail
        console.log(`Third attempt: Creating basic profile from contact info`);
        
        // Create a minimal profile from what we know
        return {
          id: selectedContact.id,
          name: selectedContact.name || "Neznámy užívateľ",
          email: "",
          profile_image_url: selectedContact.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "",
          phone: null,
          user_type: selectedContact.user_type
        };
      } catch (err) {
        console.error(`Error in contactDetails query:`, err);
        // Return a fallback profile rather than null
        return {
          id: selectedContact.id,
          name: selectedContact.name || "Neznámy užívateľ",
          email: "",
          profile_image_url: selectedContact.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "",
          phone: null,
          user_type: selectedContact.user_type
        };
      }
    },
    enabled: !!selectedContact?.id && !!user,
  });
  
  // For customers, fetch their reviews
  const { data: customerReviews = [] } = useQuery({
    queryKey: ['customer-reviews', selectedContact?.id, selectedContact?.user_type],
    queryFn: async () => {
      if (!selectedContact || !user || selectedContact.user_type !== 'customer') return [];
      
      console.log(`Fetching reviews written by customer ${selectedContact.id}`);
      
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('customer_id', selectedContact.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching customer reviews:", error);
        return [];
      }
      
      console.log("Customer reviews fetched:", data);
      return data;
    },
    enabled: !!selectedContact?.id && !!user && selectedContact?.user_type === 'customer',
  });

  return {
    messages,
    refetchMessages,
    contactDetails,
    customerReviews,
    markMessagesAsRead
  };
};
