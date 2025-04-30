
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookingCard } from "./BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
}

const BookingsList = () => {
  const { user, userType } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("approved");

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['approved-bookings', user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Build the query based on the user type and active tab
        let query = supabase
          .from('booking_requests')
          .select(`
            *,
            craftsman_profiles:craftsman_id(name, trade_category, profile_image_url)
          `);
        
        // Filter by user type
        if (userType?.toLowerCase() === 'customer') {
          query = query.eq('customer_id', user.id);
        } else {
          query = query.eq('craftsman_id', user.id);
        }
        
        // Filter by status
        if (activeTab === 'approved') {
          query = query.eq('status', 'approved');
        } else if (activeTab === 'pending') {
          query = query.eq('status', 'pending');
        } else {
          // All other statuses (rejected, completed, etc.)
          query = query.not('status', 'in', '("approved","pending")');
        }
        
        // Order by date (newest first)
        const { data, error } = await query.order('date', { ascending: false });
        
        if (error) {
          console.error("Error fetching booking requests:", error);
          throw error;
        }
        
        // Process the data to include craftsman details
        return data.map((booking: any) => {
          const craftsmanData = booking.craftsman_profiles;
          return {
            ...booking,
            craftsman_name: craftsmanData?.name,
            craftsman_trade: craftsmanData?.trade_category,
            craftsman_image: craftsmanData?.profile_image_url
          };
        });
      } catch (err) {
        console.error("Error in booking request query:", err);
        return [];
      }
    },
    enabled: !!user
  });

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
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="approved">Schválené</TabsTrigger>
          <TabsTrigger value="pending">Čakajúce</TabsTrigger>
          <TabsTrigger value="others">Ostatné</TabsTrigger>
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
        
        <TabsContent value="others" className="mt-2">
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
              <p className="text-gray-500">Žiadne ďalšie zákazky</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsList;
