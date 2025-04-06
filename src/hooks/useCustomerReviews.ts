
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatContact } from "@/types/chat";

export function useCustomerReviews(selectedContact: ChatContact | null, user: any) {
  return useQuery({
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
    gcTime: 0, // Use gcTime instead of cacheTime
  });
}
