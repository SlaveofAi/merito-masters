
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookingCard } from "./BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export interface BookingRequest {
  id: string;
  craftsman_id: string;
  customer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  message: string | null;
  amount: string | null;
  image_url: string | null;
  conversation_id: string;
  customer_name: string;
  created_at: string;
  craftsman_name?: string;
  craftsman_trade?: string;
  craftsman_image?: string;
  customer_image?: string;
}

const BookingsList = () => {
  const { user, userType } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("approved");

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        console.log(`Fetching bookings with activeTab: ${activeTab}`);
        
        // First, let's fetch the booking requests based on user type and status
        let query = supabase.from('booking_requests').select('*');
        
        // Filter by user type
        if (userType?.toLowerCase() === 'customer') {
          query = query.eq('customer_id', user.id);
        } else {
          query = query.eq('craftsman_id', user.id);
        }
        
        // Filter by status
        if (activeTab === 'approved') {
          query = query.in('status', ['approved', 'accepted']);
        } else if (activeTab === 'pending') {
          query = query.eq('status', 'pending');
        }
        
        // Order by date (newest first)
        const { data: bookingData, error: bookingError } = await query.order('date', { ascending: false });
        
        if (bookingError) {
          console.error("Error fetching booking requests:", bookingError);
          throw bookingError;
        }
        
        console.log(`Fetched ${bookingData?.length || 0} booking requests with status: ${activeTab}`);
        
        if (!bookingData || bookingData.length === 0) {
          return [];
        }
        
        // Collect all profile IDs we need to fetch
        const craftsmanIds = bookingData
          .map(booking => booking.craftsman_id)
          .filter((id, index, self) => self.indexOf(id) === index);
          
        const customerIds = bookingData
          .map(booking => booking.customer_id)
          .filter((id, index, self) => self.indexOf(id) === index);
        
        // Fetch craftsman profiles
        let craftsmanProfiles = {};
        if (craftsmanIds.length > 0) {
          const { data: craftsmanData, error: craftsmanError } = await supabase
            .from('craftsman_profiles')
            .select('id, name, trade_category, profile_image_url')
            .in('id', craftsmanIds);
            
          if (craftsmanError) {
            console.error("Error fetching craftsman profiles:", craftsmanError);
          } else if (craftsmanData) {
            craftsmanProfiles = craftsmanData.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }
        
        // Fetch customer profiles - FIXED: make sure we always fetch customer profiles
        let customerProfiles = {};
        if (customerIds.length > 0) {
          const { data: customerData, error: customerError } = await supabase
            .from('customer_profiles')
            .select('id, name, profile_image_url')
            .in('id', customerIds);
            
          if (customerError) {
            console.error("Error fetching customer profiles:", customerError);
          } else if (customerData) {
            customerProfiles = customerData.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
          
          // If customer profile not found, try fetching from profiles table as fallback
          const missingCustomerIds = customerIds.filter(id => !customerProfiles[id]);
          if (missingCustomerIds.length > 0) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, name')
              .in('id', missingCustomerIds);
              
            if (profileData) {
              profileData.forEach(profile => {
                if (!customerProfiles[profile.id]) {
                  customerProfiles[profile.id] = {
                    id: profile.id,
                    name: profile.name,
                    profile_image_url: null
                  };
                }
              });
            }
          }
        }
        
        // Merge booking data with profiles
        const enhancedBookings = bookingData.map(booking => {
          const craftsmanProfile = craftsmanProfiles[booking.craftsman_id];
          const customerProfile = customerProfiles[booking.customer_id];
          
          return {
            ...booking,
            craftsman_name: craftsmanProfile?.name || "Neznámy majster",
            craftsman_trade: craftsmanProfile?.trade_category,
            craftsman_image: craftsmanProfile?.profile_image_url,
            // Make sure customer data is properly assigned
            customer_name: customerProfile?.name || booking.customer_name || "Neznámy zákazník",
            customer_image: customerProfile?.profile_image_url
          };
        });
        
        console.log("Enhanced bookings:", enhancedBookings.length);
        return enhancedBookings;
      } catch (err) {
        console.error("Error in booking request query:", err);
        toast.error("Nastala chyba pri načítaní zákaziek");
        return [];
      }
    },
    enabled: !!user
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  if (error) {
    console.error("Error loading bookings:", error);
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <Tabs 
        defaultValue="approved" 
        className="w-full" 
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="approved">Schválené</TabsTrigger>
          <TabsTrigger value="pending">Čakajúce</TabsTrigger>
        </TabsList>
        
        <TabsContent value="approved" className="mt-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-36" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking: BookingRequest) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Žiadne schválené zákazky</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-36" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking: BookingRequest) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Žiadne čakajúce zákazky</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsList;
