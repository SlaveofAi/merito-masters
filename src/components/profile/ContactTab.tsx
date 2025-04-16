
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight, Loader2, Clock } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatters";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const ContactTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { userType, user } = useAuth();
  const [month, setMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasShownFirstAvailableMonth, setHasShownFirstAvailableMonth] = useState(false);
  const navigate = useNavigate();

  // Reservation system states
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookingPrice, setBookingPrice] = useState<string>("");
  const [bookingDescription, setBookingDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCraftsmanProfile = profileData && 'trade_category' in profileData;

  useEffect(() => {
    if (profileData?.id && isCraftsmanProfile) {
      fetchAvailableDates();
    } else {
      setIsLoadingDates(false);
    }
  }, [profileData?.id, isCraftsmanProfile]);

  const fetchAvailableDates = async () => {
    if (!profileData?.id) {
      setIsLoadingDates(false);
      return;
    }

    setError(null);
    setIsLoadingDates(true);
    
    try {
      console.log("Fetching available dates for:", profileData?.id);
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('date')
        .eq('craftsman_id', profileData?.id);

      if (error) {
        console.error("Error fetching available dates:", error);
        setError("Nepodarilo sa načítať dostupné dni.");
        setIsLoadingDates(false);
        return;
      }

      if (data && data.length > 0) {
        const parsedDates = data.map(item => new Date(item.date));
        console.log("Found available dates:", parsedDates);
        setAvailableDates(parsedDates);
        
        if (!hasShownFirstAvailableMonth && !isCurrentUser && userType === 'customer') {
          const sortedDates = [...parsedDates].sort((a, b) => a.getTime() - b.getTime());
          if (sortedDates.length > 0) {
            const firstDate = new Date(sortedDates[0]);
            setMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
            setHasShownFirstAvailableMonth(true);
          }
        }
      } else {
        console.log("No available dates found");
        setAvailableDates([]);
      }
    } catch (err: any) {
      console.error("Error processing available dates:", err);
      setError(`Chyba: ${err.message}`);
    } finally {
      setIsLoadingDates(false);
    }
  };

  const handleDateClick = (date: Date) => {
    if (availableDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setMonth(nextMonth);
  };

  const goToPreviousMonth = () => {
    const prevMonth = new Date(month);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setMonth(prevMonth);
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!user) {
      toast.error("Pre rezerváciu termínu sa musíte prihlásiť");
      navigate('/login', { state: { from: 'profile' } });
      return;
    }

    if (!profileData?.id) {
      toast.error("Nepodarilo sa nájsť profil remeselníka");
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Vyberte si termín a čas");
      return;
    }

    if (!bookingDescription) {
      toast.error("Popis požiadavky je povinný");
      return;
    }

    if (!address) {
      toast.error("Adresa je povinná");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Create conversation if it doesn't exist
      let conversationId;
      
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', user.id)
        .eq('craftsman_id', profileData.id)
        .maybeSingle();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            customer_id: user.id,
            craftsman_id: profileData.id
          })
          .select();
          
        if (createError) {
          throw createError;
        }
        
        conversationId = newConversation?.[0]?.id;
      }
      
      if (!conversationId) {
        throw new Error("Nepodarilo sa vytvoriť konverzáciu");
      }
      
      // Create booking request
      const { error: bookingError } = await supabase
        .from('booking_requests')
        .insert({
          conversation_id: conversationId,
          customer_id: user.id,
          craftsman_id: profileData.id,
          requested_date: formattedDate,
          requested_time: selectedTimeSlot,
          description: bookingDescription,
          address: address,
          price: bookingPrice ? parseFloat(bookingPrice) : null,
          status: 'pending'
        });
        
      if (bookingError) {
        throw bookingError;
      }
      
      // Send system message to conversation about booking request
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: profileData.id,
          message: `Rezervácia: ${formattedDate} ${selectedTimeSlot}`,
          message_type: 'booking_request',
          is_system_message: true
        });
        
      if (messageError) {
        throw messageError;
      }
      
      toast.success("Rezervácia bola úspešne odoslaná");
      
      // Navigate to conversation to see the booking request
      navigate('/messages', { 
        state: { 
          from: 'profile',
          conversationId,
          contactId: profileData.id 
        } 
      });
    } catch (err: any) {
      console.error("Error creating booking:", err);
      toast.error(`Chyba pri vytváraní rezervácie: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CraftsmanAvailabilityPanel = () => {
    const upcomingDates = availableDates
      .filter(date => date >= new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    
    return (
      <Card className="border border-border/50 shadow-sm mt-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Vaša dostupnosť
              </h3>
              <Badge variant="outline" className="bg-primary/10">
                {availableDates.length} dní
              </Badge>
            </div>
            
            {upcomingDates.length > 0 ? (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Najbližšie dostupné dni:</p>
                  <div className="flex flex-wrap gap-2">
                    {upcomingDates.slice(0, 5).map((date, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50">
                        {format(date, 'dd.MM.yyyy')}
                      </Badge>
                    ))}
                    {upcomingDates.length > 5 && (
                      <Badge variant="outline">
                        +{upcomingDates.length - 5} ďalších
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium text-gray-700">
                    Výborne! Vaša dostupnosť je nastavená, zákazníci vás môžu kontaktovať!
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-500 mb-2">Zatiaľ nemáte žiadne nastavené dni.</p>
                <p className="text-sm text-gray-400">
                  Nastavte dostupné dni v kalendári, aby vás zákazníci mohli kontaktovať.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const AvailabilityViewer = () => (
    <div className="w-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium capitalize">
            {format(month, 'LLLL yyyy', { locale: sk })}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <CalendarUI
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              handleDateClick(date);
            }
          }}
          month={month}
          onMonthChange={setMonth}
          modifiers={{
            available: (date) => availableDates.some(d => d.toDateString() === date.toDateString())
          }}
          modifiersStyles={{
            available: { backgroundColor: '#dcfce7', color: '#111827', fontWeight: 700 }
          }}
          className="p-3 pointer-events-auto w-full"
          showOutsideDays
          disabled={(date) => !availableDates.some(d => d.toDateString() === date.toDateString())}
        />
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <div className="w-4 h-4 bg-green-100 mr-2 rounded"></div>
        <span className="text-sm text-gray-600">
          Remeselník je dostupný v označené dni
        </span>
      </div>
      
      {availableDates.length === 0 && (
        <div className="mt-4 text-center p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Remeselník momentálne nemá nastavené žiadne dostupné dni.</p>
        </div>
      )}
    </div>
  );

  const ReservationSystem = () => {
    if (!selectedDate) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">Pre zobrazenie voľných termínov vyberte dostupný deň v kalendári</p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <h4 className="font-medium mb-3">Dostupné časy pre {format(selectedDate, 'dd.MM.yyyy')}</h4>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {TIME_SLOTS.map((time) => (
            <Button
              key={time}
              variant={selectedTimeSlot === time ? "default" : "outline"}
              size="sm"
              className="flex items-center"
              onClick={() => setSelectedTimeSlot(time)}
            >
              <Clock className="h-3 w-3 mr-1" />
              {time}
            </Button>
          ))}
        </div>
        
        {selectedTimeSlot && (
          <div className="space-y-4 mt-6 p-4 border border-green-100 bg-green-50/30 rounded-lg">
            <div>
              <Label htmlFor="description">Popis požiadavky</Label>
              <Textarea
                id="description"
                placeholder="Opíšte čo potrebujete..."
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                placeholder="Zadajte adresu kde sa má vykonať práca"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="price">Navrhovaná cena (€)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Nepovinné"
                value={bookingPrice}
                onChange={(e) => setBookingPrice(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Zadávajte len čísla, napr. 50 pre 50€
              </p>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleBookingSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Odosielam...
                </>
              ) : (
                "Odoslať rezerváciu"
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const handleStartChat = () => {
    if (!user) {
      toast.error("Pre kontaktovanie remeselníka sa musíte prihlásiť");
      return;
    }

    if (!profileData?.id) {
      toast.error("Nepodarilo sa nájsť profil remeselníka");
      return;
    }

    navigate('/messages');
  };

  if (!profileData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Kontaktné informácie</h3>
            <div className="space-y-4">
              {profileData.phone && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Telefón</p>
                    <p className="text-muted-foreground">
                      {profileData.phone}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">
                    {profileData.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Región pôsobenia</p>
                  <p className="text-muted-foreground">
                    {profileData.location}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isCurrentUser && userType === 'craftsman' && isCraftsmanProfile && (
          <CraftsmanAvailabilityPanel />
        )}
        
        {isCraftsmanProfile && userType === 'customer' && !isCurrentUser && (
          <Card className="border border-border/50 shadow-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="booking" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="booking" className="flex-1">Rezervácia termínu</TabsTrigger>
                  <TabsTrigger value="message" className="flex-1">Poslať správu</TabsTrigger>
                </TabsList>
                
                <TabsContent value="booking">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Rezervácia termínu</h4>
                    <p className="text-sm text-gray-500">
                      Vyberte si z dostupných dní v kalendári a rezervujte si termín u remeselníka.
                      Po odoslaní rezervácie budete presmerovaní do správ, kde môžete komunikovať priamo s remeselníkom.
                    </p>
                  </div>
                  
                  {!user && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex flex-col items-center">
                      <p className="text-sm text-amber-800 mb-3">Pre rezerváciu termínu sa musíte prihlásiť</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => navigate('/login')}>Prihlásiť sa</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate('/register')}>
                          Registrovať sa
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="message">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Poslať správu</h4>
                    <p className="text-sm text-gray-500">
                      Prejdite do správ, kde môžete remeselníkovi napísať a prediskutovať vašu požiadavku.
                    </p>
                  </div>
                  <Button onClick={handleStartChat} className="w-full">
                    Prejsť do správ
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
      
      {isCraftsmanProfile ? (
        <Card className="border border-border/50 shadow-sm h-fit">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {isCurrentUser ? "Váš kalendár dostupnosti" : "Rezervácia termínu"}
            </h3>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isLoadingDates ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Načítavam dostupné termíny...</span>
              </div>
            ) : (
              <div>
                <div className="max-h-[450px] overflow-auto">
                  <AvailabilityViewer />
                </div>
                
                {!isCurrentUser && userType === 'customer' && (
                  <ReservationSystem />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : !isCraftsmanProfile ? (
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">Poslať správu</h3>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Vaše meno
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Zadajte vaše meno"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Váš email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Zadajte váš email"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Správa
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Opíšte vašu požiadavku..."
                ></textarea>
              </div>
              <Button type="submit" className="w-full">
                Odoslať správu
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ContactTab;
