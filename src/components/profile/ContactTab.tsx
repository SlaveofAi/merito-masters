
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/formatters";
import { useProfile } from "@/contexts/ProfileContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const ContactTab = () => {
  const { profileData, loading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [bookingDescription, setBookingDescription] = useState("");
  const [address, setAddress] = useState("");
  const [bookingPrice, setBookingPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("booking");

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    if (!selectedDate || !profileData?.id) return;
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    try {
      const { data, error } = await supabase
        .from("craftsman_availability")
        .select("time_slots")
        .eq("craftsman_id", profileData.id)
        .eq("date", formattedDate)
        .single();
        
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching available time slots:", error);
        setAvailableTimeSlots([]);
        return;
      }
      
      // If no data found, generate default time slots (9:00 to 17:00)
      if (!data) {
        const defaultSlots = [];
        for (let i = 9; i <= 17; i++) {
          defaultSlots.push(`${i}:00`);
        }
        setAvailableTimeSlots(defaultSlots);
      } else {
        // Use the retrieved time slots or empty array if none found
        setAvailableTimeSlots(data.time_slots || []);
      }
      
      // Reset selected time slot if it was previously set
      setSelectedTimeSlot("");
    } catch (error) {
      console.error("Error in fetch available time slots:", error);
      setAvailableTimeSlots([]);
    }
  };

  const handleSubmitBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Pre odoslanie požiadavky sa musíte prihlásiť");
      navigate("/login", { state: { from: "profile-contact" } });
      return;
    }
    
    if (!profileData || !selectedDate || !selectedTimeSlot) {
      toast.error("Vyplňte prosím všetky povinné polia");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // First check if conversation exists
      const { data: existingConversation, error: convFetchError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("craftsman_id", profileData.id)
        .maybeSingle();
        
      if (convFetchError && convFetchError.code !== "PGRST116") {
        throw convFetchError;
      }
      
      let conversationId;
      
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: convCreateError } = await supabase
          .from("chat_conversations")
          .insert({
            customer_id: user.id,
            craftsman_id: profileData.id
          })
          .select("id")
          .single();
          
        if (convCreateError) {
          throw convCreateError;
        }
        
        conversationId = newConversation.id;
      }
      
      if (!conversationId) {
        throw new Error("Nepodarilo sa vytvoriť konverzáciu");
      }
      
      // Create booking request - Fixed property names to match database schema
      const { error: bookingError } = await supabase
        .from('booking_requests')
        .insert({
          conversation_id: conversationId,
          customer_id: user.id,
          craftsman_id: profileData.id,
          customer_name: user.user_metadata?.name || "Customer",
          date: formattedDate,  // Changed from requested_date to date
          start_time: selectedTimeSlot, // Changed from requested_time to start_time
          end_time: (parseInt(selectedTimeSlot.split(':')[0]) + 1) + ":" + selectedTimeSlot.split(':')[1], // Added end_time
          message: bookingDescription, // Changed from description to message
          amount: bookingPrice ? bookingPrice : null,
          status: 'pending'
        });
        
      if (bookingError) {
        throw bookingError;
      }
      
      // Send system message to conversation about booking request - Fixed property names
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: profileData.id, // Changed from recipient_id to receiver_id
          content: `Rezervácia: ${formattedDate} ${selectedTimeSlot}`,
          metadata: { type: 'booking_request' }, // Added metadata object
          read: false
        });
        
      if (messageError) {
        throw messageError;
      }
      
      // Navigate to messages view with the conversation
      navigate("/messages", {
        state: {
          from: "booking",
          conversationId: conversationId,
          contactId: profileData.id
        }
      });
      
      toast.success("Požiadavka na rezerváciu odoslaná");
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast.error("Nastala chyba pri odoslaní požiadavky");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Pre kontaktovanie remeselníka sa musíte prihlásiť");
      navigate("/login", { state: { from: "profile-contact" } });
      return;
    }
    
    if (!profileData) {
      toast.error("Nepodarilo sa načítať profil remeselníka");
      return;
    }
    
    try {
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("craftsman_id", profileData.id)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking for conversation:", fetchError);
        toast.error("Nastala chyba pri kontrole konverzácie");
        return;
      }
      
      let conversationId;
      
      if (existingConversation) {
        // Use existing conversation
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("chat_conversations")
          .insert({
            customer_id: user.id,
            craftsman_id: profileData.id
          })
          .select();
          
        if (createError) {
          console.error("Error creating conversation:", createError);
          toast.error("Nepodarilo sa vytvoriť konverzáciu");
          return;
        }
        
        conversationId = newConversation?.[0]?.id;
      }
      
      if (conversationId) {
        // Navigate to messages with the conversation context
        navigate("/messages", { 
          state: { 
            from: "profile",
            conversationId,
            contactId: profileData.id 
          } 
        });
        toast.success("Presmerované do správ");
      }
    } catch (err) {
      console.error("Error navigating to chat:", err);
      toast.error("Nastala chyba pri presmerovaní do správ");
    }
  };

  if (loading || !profileData) {
    return <div className="py-8 text-center">Načítavam...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="booking">Rezervácia termínu</TabsTrigger>
          <TabsTrigger value="message">Poslať správu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="booking">
          <h3 className="text-xl font-semibold mb-6">Rezervácia termínu s {profileData.name}</h3>
          
          <form onSubmit={handleSubmitBookingRequest}>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">1. Vyberte dátum</h4>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={sk}
                    disabled={{
                      before: new Date(),
                    }}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Vyberte čas</h4>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={selectedTimeSlot === slot ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {slot}
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-4">Žiadne dostupné termíny</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Detaily požiadavky</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Popis práce*
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Opíšte, akú prácu potrebujete vykonať..."
                      value={bookingDescription}
                      onChange={(e) => setBookingDescription(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresa*
                    </label>
                    <Input
                      id="address"
                      placeholder="Zadajte adresu, kde sa má práca vykonať"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Predpokladaná cena
                    </label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Zadajte predpokladanú cenu"
                      value={bookingPrice}
                      onChange={(e) => setBookingPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!selectedDate || !selectedTimeSlot || !bookingDescription || isSubmitting}
                >
                  {isSubmitting ? "Odosielam..." : "Odoslať požiadavku"}
                </Button>
                
                {profileData.hourly_rate && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Hodinová sadzba: {formatCurrency(profileData.hourly_rate)}
                  </p>
                )}
              </div>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="message">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Poslať správu remeselníkovi</h3>
            <p className="mb-6 text-gray-600">
              Kliknite na tlačidlo nižšie pre kontaktovanie remeselníka {profileData.name} priamo cez správy.
            </p>
            <Button onClick={handleSendMessage}>
              Prejsť na správy
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactTab;
