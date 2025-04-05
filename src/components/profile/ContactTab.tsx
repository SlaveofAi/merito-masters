import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, MapPin, Calendar, BellRing, CheckCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TimeSlot, BookingRequest, CraftsmanAvailability } from "@/types/booking";

const ContactTab: React.FC = () => {
  const { profileData, userType, isCurrentUser } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [workHours, setWorkHours] = useState("Pondelok - Piatok, 8:00 - 17:00");
  const [editingHours, setEditingHours] = useState(false);
  const [tempWorkHours, setTempWorkHours] = useState(workHours);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profileData && profileData.id && userType === 'craftsman' && !isCurrentUser) {
      loadCraftsmanAvailability(profileData.id);
    }
  }, [profileData, userType, isCurrentUser]);

  const loadCraftsmanAvailability = async (craftsmanId: string) => {
    try {
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('*')
        .eq('craftsman_id', craftsmanId);
        
      if (error) {
        console.error("Error loading craftsman availability:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const dates = data.map(item => new Date(item.date as string));
        setAvailableDates(dates);
      }
    } catch (err) {
      console.error("Error in loadCraftsmanAvailability:", err);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !profileData) return;
    
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('*')
        .eq('craftsman_id', profileData.id)
        .eq('date', dateStr)
        .maybeSingle();
        
      if (error) {
        console.error("Error loading time slots:", error);
        setTimeSlots([]);
        return;
      }
      
      if (data && data.time_slots) {
        setTimeSlots((data.time_slots as unknown as TimeSlot[]).filter(slot => slot.is_available));
      } else {
        setTimeSlots([]);
      }
    } catch (err) {
      console.error("Error in handleDateSelect:", err);
      setTimeSlots([]);
    }
  };

  const saveWorkHours = () => {
    setWorkHours(tempWorkHours);
    setEditingHours(false);
  };
  
  const handleBookingRequest = async () => {
    if (!user || !profileData || !selectedDate || !selectedTimeSlot) {
      toast.error("Vyplňte všetky potrebné údaje pre rezerváciu");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: existingConv, error: convError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', user.id)
        .eq('craftsman_id', profileData.id)
        .maybeSingle();
        
      let conversationId = existingConv?.id;
      
      if (!conversationId) {
        const { data: newConv, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            customer_id: user.id,
            craftsman_id: profileData.id
          })
          .select();
          
        if (createError || !newConv || newConv.length === 0) {
          console.error("Error creating conversation:", createError);
          toast.error("Nastala chyba pri vytváraní konverzácie");
          setIsLoading(false);
          return;
        }
        
        conversationId = newConv[0].id;
      }
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const bookingRequest = {
        craftsman_id: profileData.id,
        customer_id: user.id,
        customer_name: user.user_metadata?.name || "Zákazník",
        date: dateStr,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
        status: 'pending',
        message: bookingMessage || "Žiadosť o rezerváciu termínu",
        conversation_id: conversationId
      };
      
      const { data: booking, error: bookingError } = await supabase
        .from('booking_requests')
        .insert(bookingRequest);
        
      if (bookingError) {
        console.error("Error creating booking request:", bookingError);
        toast.error("Nastala chyba pri vytváraní rezervácie");
        setIsLoading(false);
        return;
      }
      
      const bookingMsg = `Žiadosť o rezerváciu: ${format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: sk })}, ${selectedTimeSlot.start_time} - ${selectedTimeSlot.end_time}`;
      
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: profileData.id,
          content: bookingMsg,
          read: false
        });
        
      if (messageError) {
        console.error("Error sending booking message:", messageError);
      }
      
      toast.success("Rezervácia bola úspešne odoslaná");
      
      navigate("/messages");
      
    } catch (err) {
      console.error("Error in handleBookingRequest:", err);
      toast.error("Nastala chyba pri vytváraní rezervácie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAvailability = async (date: Date | undefined) => {
    if (!date || !user || userType !== 'craftsman') return;
    
    setIsLoading(true);
    
    const dateExists = availableDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );
    
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      if (dateExists) {
        const newDates = availableDates.filter(d => 
          !(d.getDate() === date.getDate() && 
            d.getMonth() === date.getMonth() && 
            d.getFullYear() === date.getFullYear())
        );
        
        const { error } = await supabase
          .from('craftsman_availability')
          .delete()
          .eq('craftsman_id', user.id)
          .eq('date', dateStr);
          
        if (error) {
          console.error("Error removing availability:", error);
          toast.error("Nastala chyba pri odstraňovaní dostupnosti");
        } else {
          setAvailableDates(newDates);
          toast.success("Dostupnosť bola odstránená");
        }
      } else {
        const defaultTimeSlots: TimeSlot[] = [];
        for (let hour = 9; hour < 17; hour++) {
          defaultTimeSlots.push({
            start_time: `${hour.toString().padStart(2, '0')}:00`,
            end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
            is_available: true
          });
        }
        
        const { data: existingData, error: checkError } = await supabase
          .from('craftsman_availability')
          .select('*')
          .eq('craftsman_id', user.id)
          .eq('date', dateStr)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking existing availability:", checkError);
          toast.error("Nastala chyba pri kontrole dostupnosti");
          setIsLoading(false);
          return;
        }
        
        let result;
        
        if (existingData) {
          result = await supabase
            .from('craftsman_availability')
            .update({ time_slots: defaultTimeSlots })
            .eq('id', existingData.id);
        } else {
          result = await supabase
            .from('craftsman_availability')
            .insert({
              craftsman_id: user.id,
              date: dateStr,
              time_slots: defaultTimeSlots
            });
        }
        
        if (result.error) {
          console.error("Error setting availability:", result.error);
          toast.error("Nastala chyba pri nastavovaní dostupnosti");
        } else {
          setAvailableDates([...availableDates, date]);
          toast.success("Dostupnosť bola nastavená");
        }
      }
    } catch (err) {
      console.error("Error in handleSetAvailability:", err);
      toast.error("Nastala chyba pri úprave dostupnosti");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message || !profileData) {
      toast.error("Vyplňte všetky polia");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (user) {
        const { data: existingConv, error: convError } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('customer_id', user.id)
          .eq('craftsman_id', profileData.id)
          .maybeSingle();
          
        let conversationId = existingConv?.id;
        
        if (!conversationId) {
          const { data: newConv, error: createError } = await supabase
            .from('chat_conversations')
            .insert({
              customer_id: user.id,
              craftsman_id: profileData.id
            })
            .select();
            
          if (createError || !newConv || newConv.length === 0) {
            console.error("Error creating conversation:", createError);
            toast.error("Nastala chyba pri vytváraní konverzácie");
            setIsLoading(false);
            return;
          }
          
          conversationId = newConv[0].id;
        }
        
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            receiver_id: profileData.id,
            content: message,
            read: false
          });
          
        if (messageError) {
          console.error("Error sending message:", messageError);
          toast.error("Nastala chyba pri odosielaní správy");
          setIsLoading(false);
          return;
        }
        
        toast.success("Správa bola úspešne odoslaná");
        
        navigate("/messages");
      } else {
        toast.success("Správa bola úspešne odoslaná");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      console.error("Error in handleContactSubmit:", err);
      toast.error("Nastala chyba pri odosielaní správy");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) return null;

  const renderCalendar = () => {
    if (userType === 'craftsman' && !isCurrentUser) {
      return (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Rezervovať termín</h4>
          <div className="mb-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={date => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (date < today) return true;
                
                return !availableDates.some(d => 
                  d.getDate() === date.getDate() && 
                  d.getMonth() === date.getMonth() && 
                  d.getFullYear() === date.getFullYear()
                );
              }}
              className="p-3 pointer-events-auto border rounded-md"
            />
          </div>
          
          {selectedDate && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Dostupné časy:</h4>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {timeSlots.map((slot, index) => (
                    <Button 
                      key={index}
                      variant={selectedTimeSlot === slot ? "default" : "outline"}
                      className="justify-center"
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      {slot.start_time} - {slot.end_time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Žiadne dostupné časy pre vybraný dátum.</p>
              )}
              
              {selectedTimeSlot && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Správa (voliteľné)
                    </label>
                    <textarea
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={2}
                      placeholder="Napíšte požiadavky alebo otázky k rezervácii..."
                    ></textarea>
                  </div>
                  
                  <Button 
                    onClick={handleBookingRequest}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Odosielanie..." : "Odoslať žiadosť o rezerváciu"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    if (userType === 'craftsman' && isCurrentUser) {
      return (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium mb-3">Dostupnosť v kalendári</h4>
          <p className="text-sm text-gray-500 mb-4">
            Vyberte dni, kedy ste k dispozícii pre zákazníkov
          </p>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Vybrať dostupné dni</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={undefined}
                onSelect={handleSetAvailability}
                modifiers={{
                  selected: availableDates
                }}
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground"
                }}
                disabled={date => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {availableDates.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-sm mb-2">Vaše dostupné dni:</p>
              <div className="flex flex-wrap gap-2">
                {availableDates.map((date, i) => (
                  <div key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {format(date, 'dd.MM.yyyy')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Kontaktné informácie</h3>
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
            {userType === 'craftsman' && (
              <div className="flex items-start">
                <Clock className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Dostupnosť</p>
                  {isCurrentUser && editingHours ? (
                    <div className="mt-1">
                      <input
                        type="text"
                        value={tempWorkHours}
                        onChange={(e) => setTempWorkHours(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={saveWorkHours}>Uložiť</Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingHours(false);
                            setTempWorkHours(workHours);
                          }}
                        >
                          Zrušiť
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground">
                        {workHours}
                      </p>
                      {isCurrentUser && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 h-7 px-2 text-xs"
                          onClick={() => setEditingHours(true)}
                        >
                          Upraviť
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
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
          
          {renderCalendar()}
        </CardContent>
      </Card>
      
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Poslať správu</h3>
          <form className="space-y-4" onSubmit={handleContactSubmit}>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Opíšte vašu požiadavku..."
              ></textarea>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Odosielanie..." : "Odoslať správu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactTab;
