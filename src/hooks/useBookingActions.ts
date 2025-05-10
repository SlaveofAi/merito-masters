
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type BookingAction = 'approve' | 'decline' | 'delete';

export const useBookingActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateBookingStatus = useMutation({
    mutationFn: async ({ 
      bookingId, 
      action, 
      customerId 
    }: { 
      bookingId: string; 
      action: BookingAction; 
      customerId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      let status;
      switch (action) {
        case 'approve':
          status = 'approved';
          break;
        case 'decline':
          status = 'declined';
          break;
        case 'delete':
          // For deletion, we'll delete the record directly instead of updating status
          const { error: deleteError } = await supabase
            .from('booking_requests')
            .delete()
            .eq('id', bookingId)
            .eq('craftsman_id', user.id);
            
          if (deleteError) throw deleteError;
          return { success: true, action };
        default:
          throw new Error("Invalid action");
      }
      
      // Update booking status
      const { data, error } = await supabase
        .from('booking_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('craftsman_id', user.id)
        .select('*');
        
      if (error) throw error;
      
      // Create notification for the customer
      try {
        // Get craftsman name
        const { data: craftsmanData } = await supabase
          .from('craftsman_profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        const craftsmanName = craftsmanData?.name || 'Remeselník';
        const bookingDate = data?.[0]?.date ? new Date(data[0].date).toLocaleDateString('sk-SK') : '';
        
        const notificationData = {
          user_id: customerId,
          title: status === 'approved' ? "Rezervácia schválená" : "Rezervácia zamietnutá",
          content: status === 'approved' 
            ? `${craftsmanName} schválil vašu rezerváciu na ${bookingDate}`
            : `${craftsmanName} zamietol vašu rezerváciu na ${bookingDate}`,
          type: 'booking_update' as const,
          metadata: {
            booking_id: bookingId,
            status: status,
            contact_id: user.id
          }
        };
        
        await supabase
          .from('notifications')
          .insert(notificationData);
      } catch (err) {
        console.error("Error creating notification for booking update:", err);
      }
      
      return { success: true, action, data: data?.[0] };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      const actionText = data.action === 'approve' 
        ? 'schválená' 
        : data.action === 'decline' 
          ? 'zamietnutá' 
          : 'vymazaná';
      
      toast.success(`Rezervácia bola ${actionText}`);
    },
    onError: (error: any) => {
      console.error("Error updating booking status:", error);
      toast.error(error?.message || "Nastala chyba pri aktualizácii rezervácie");
    }
  });

  return {
    approveBooking: (bookingId: string, customerId: string) => 
      updateBookingStatus.mutate({ bookingId, action: 'approve', customerId }),
    declineBooking: (bookingId: string, customerId: string) => 
      updateBookingStatus.mutate({ bookingId, action: 'decline', customerId }),
    deleteBooking: (bookingId: string, customerId: string) => 
      updateBookingStatus.mutate({ bookingId, action: 'delete', customerId })
  };
};
