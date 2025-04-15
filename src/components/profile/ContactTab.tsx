
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";

const ContactTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { userType, user } = useAuth();
  const [month, setMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasShownFirstAvailableMonth, setHasShownFirstAvailableMonth] = useState(false);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day

  const isCraftsmanProfile = profileData && 'trade_category' in profileData;
  const availableTimeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

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
          // Filter to get only future dates
          const futureDates = parsedDates.filter(date => {
            const dateNormalized = new Date(date);
            dateNormalized.setHours(0, 0, 0, 0);
            return dateNormalized >= today;
          });
          
          if (futureDates.length > 0) {
            const sortedDates = [...futureDates].sort((a, b) => a.getTime() - b.getTime());
            if (sortedDates.length > 0) {
              const firstDate = new Date(sortedDates[0]);
              setMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
              setHasShownFirstAvailableMonth(true);
            }
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
    if (availableDates.some(d => d.toDateString() === date.toDateString()) && date >= today) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when a new date is selected
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

  const handleSendBookingRequest = async () => {
    if (!user) {
      toast.error("Pre odoslanie rezervácie sa musíte prihlásiť");
      navigate('/login', { state: { from: 'profile' } });
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !profileData?.id) {
      toast.error("Vyberte dátum a čas rezervácie");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a conversation if it doesn't exist
      const customerId = user.id;
      const craftsmanId = profileData.id;
      
      let conversationId;
      
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('craftsman_id', craftsmanId)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error checking for conversation:", fetchError);
        toast.error("Nastala chyba pri kontrole konverzácie");
        setIsSubmitting(false);
        return;
      }
      
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            customer_id: customerId,
            craftsman_id: craftsmanId
          })
          .select();
          
        if (createError) {
          console.error("Error creating conversation:", createError);
          toast.error("Nepodarilo sa vytvoriť konverzáciu");
          setIsSubmitting(false);
          return;
        }
        
        conversationId = newConversation?.[0]?.id;
      }
      
      if (!conversationId) {
        toast.error("Chyba pri vytváraní konverzácie");
        setIsSubmitting(false);
        return;
      }
      
      // Create the booking request
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const bookingId = uuidv4();
      
      // Create message with booking metadata
      const messageMetadata = {
        type: 'booking_request',
        booking_id: bookingId,
        status: 'pending',
        details: {
          date: formattedDate,
          time: selectedTimeSlot,
          message: message || null,
          amount: amount || null
        }
      };
      
      const messageContent = `🗓️ **Požiadavka na termín**
Dátum: ${format(selectedDate, 'dd.MM.yyyy')}
Čas: ${selectedTimeSlot}
${amount ? `Odmena: ${amount} €` : ''}
${message ? `Správa: ${message}` : ''}`;
      
      // Send the message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: customerId,
          receiver_id: craftsmanId,
          content: messageContent,
          metadata: messageMetadata
        });
        
      if (messageError) {
        console.error("Error sending message:", messageError);
        toast.error("Nastala chyba pri odosielaní správy");
        setIsSubmitting(false);
        return;
      }
      
      // Create the booking request entry
      const { error: bookingError } = await supabase
        .from('booking_requests')
        .insert({
          id: bookingId,
          conversation_id: conversationId,
          craftsman_id: craftsmanId,
          customer_id: customerId,
          customer_name: user.user_metadata?.name || "Zákazník",
          date: formattedDate,
          start_time: selectedTimeSlot,
          end_time: (parseInt(selectedTimeSlot.split(':')[0]) + 1) + ":" + selectedTimeSlot.split(':')[1],
          message: message || null,
          amount: amount || null
        });
        
      if (bookingError) {
        console.error("Error creating booking request:", bookingError);
        toast.error("Nastala chyba pri vytváraní rezervácie");
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Rezervácia bola úspešne odoslaná");
      // Navigate to messages
      navigate('/messages', { 
        state: { 
          from: 'booking',
          conversationId,
          contactId: craftsmanId 
        } 
      });
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast.error("Nastala chyba pri odosielaní rezervácie");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CraftsmanAvailabilityPanel = () => {
    const upcomingDates = availableDates
      .filter(date => {
        const dateNormalized = new Date(date);
        dateNormalized.setHours(0, 0, 0, 0);
        return dateNormalized >= today;
      })
      .sort((a, b) => a.getTime() - b.getTime());
    
    const pastDates = availableDates
      .filter(date => {
        const dateNormalized = new Date(date);
        dateNormalized.setHours(0, 0, 0, 0);
        return dateNormalized < today;
      })
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent past dates first
    
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
                {upcomingDates.length} budúcich dní
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
                
                {pastDates.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Dni v minulosti:</p>
                    <div className="flex flex-wrap gap-2">
                      {pastDates.slice(0, 3).map((date, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-100 text-gray-500">
                          {format(date, 'dd.MM.yyyy')}
                        </Badge>
                      ))}
                      {pastDates.length > 3 && (
                        <Badge variant="outline" className="text-gray-500">
                          +{pastDates.length - 3} ďalších
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
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
            available: (date) => {
              // Only mark future dates as available
              const isPastDate = date < today;
              return !isPastDate && availableDates.some(d => d.toDateString() === date.toDateString());
            },
            unavailable: (date) => {
              // Mark past dates that were available as unavailable
              const isPastDate = date < today;
              return isPastDate && availableDates.some(d => d.toDateString() === date.toDateString());
            }
          }}
          modifiersStyles={{
            available: { backgroundColor: '#dcfce7', color: '#111827', fontWeight: 700 },
            unavailable: { backgroundColor: '#f3f4f6', color: '#9ca3af', textDecoration: 'line-through' }
          }}
          className="p-3 pointer-events-auto w-full"
          showOutsideDays
          disabled={(date) => {
            // Disable dates that are:
            // 1. In the past (before today)
            // 2. Not in the craftsman's available dates
            return date < today || !availableDates.some(d => d.toDateString() === date.toDateString());
          }}
        />
      </div>
      
      <div className="mt-4 flex flex-col gap-1">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 mr-2 rounded"></div>
          <span className="text-sm text-gray-600">
            Remeselník je dostupný v označené dni
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-accent border border-accent/30 ring-2 ring-primary/30 mr-2 rounded"></div>
          <span className="text-sm text-gray-600">Dnešný deň</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 text-gray-400 mr-2 rounded"></div>
          <span className="text-sm text-gray-600">Minulé dni</span>
        </div>
      </div>
      
      {availableDates.length === 0 && (
        <div className="mt-4 text-center p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Remeselník momentálne nemá nastavené žiadne dostupné dni.</p>
        </div>
      )}
    </div>
  );

  const BookingRequestForm = () => {
    // Only show if there's a selected date
    if (!selectedDate) return null;
    
    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium mb-4">Rezervácia termínu</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="time-slot" className="block text-sm font-medium mb-2">
              Vyberte čas
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {availableTimeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedTimeSlot === slot ? "default" : "outline"}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className="text-sm"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium mb-2">
              Odmena (voliteľné)
            </Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Napr. 50 €"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="block text-sm font-medium mb-2">
              Správa (voliteľné)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Opíšte vašu požiadavku..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleSendBookingRequest}
            disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Odosielam...
              </>
            ) : (
              'Odoslať rezerváciu'
            )}
          </Button>
        </div>
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
              <h4 className="text-lg font-medium mb-3">Kontaktovať remeselníka</h4>
              <p className="text-sm text-gray-500 mb-4">
                Pre ďalšiu konzultáciu môžete remeselníka kontaktovať aj priamo cez správy.
              </p>
              <Button onClick={handleStartChat} className="w-full">
                Prejsť do správ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {isCraftsmanProfile ? (
        <Card className="border border-border/50 shadow-sm h-fit">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {isCurrentUser ? "Váš kalendár dostupnosti" : "Rezervovať termín"}
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
              <>
                <div className="max-h-[450px] overflow-auto">
                  <AvailabilityViewer />
                </div>
                
                {!isCurrentUser && userType === 'customer' && (
                  <BookingRequestForm />
                )}
              </>
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
