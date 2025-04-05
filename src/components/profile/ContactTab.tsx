import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { format, isToday, getDay, addDays, subDays, setHours, setMinutes } from "date-fns";
import { sk } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CraftsmanProfile } from "@/types/profile";

const timeSlots = [
  "8:00", "9:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const ContactTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { user, userType } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  
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
        
        if (parsedDates.length > 0) {
          const sortedDates = [...parsedDates].sort((a, b) => a.getTime() - b.getTime());
          const closestFutureDate = sortedDates.find(date => date >= new Date()) || sortedDates[0];
          setSelectedDate(closestFutureDate);
          setMonth(new Date(closestFutureDate));
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

  const handleBookAppointment = async () => {
    if (!user || !profileData || !selectedDate || !selectedTimeSlot) {
      toast.error("Vyberte dátum a čas pre objednávku");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const [hours] = selectedTimeSlot.split(':').map(Number);
      const endHour = hours + 1;
      const endTime = `${endHour}:00`;

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const customerName = user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymous';

      const { data: existingConversation, error: convFindError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('craftsman_id', profileData.id)
        .eq('customer_id', user.id)
        .maybeSingle();
      
      let conversationId;
      
      if (convFindError || !existingConversation) {
        const { data: newConversation, error: convCreateError } = await supabase
          .from('chat_conversations')
          .insert({
            craftsman_id: profileData.id,
            customer_id: user.id
          })
          .select('id')
          .single();
          
        if (convCreateError || !newConversation) {
          throw new Error("Failed to create conversation");
        }
        
        conversationId = newConversation.id;
      } else {
        conversationId = existingConversation.id;
      }

      const { error } = await supabase
        .from('booking_requests')
        .insert({
          craftsman_id: profileData.id,
          customer_id: user.id,
          date: formattedDate,
          start_time: selectedTimeSlot,
          end_time: endTime,
          customer_name: customerName,
          message: bookingMessage,
          conversation_id: conversationId
        });
        
      if (error) throw error;
      
      toast.success("Vaša požiadavka bola odoslaná. Čakajte na potvrdenie od remeselníka.");
      setSelectedTimeSlot(null);
      setBookingMessage("");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error("Nepodarilo sa vytvoriť objednávku. Skúste znova neskôr.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAvailableDates = async () => {
    if (!user?.id || !profileData?.id || userType !== 'craftsman') {
      toast.error("Nemôžem uložiť dostupnosť, chýba ID používateľa");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      console.log("Saving dates for craftsman:", profileData.id, availableDates);
      
      const { error: deleteError } = await supabase
        .from('craftsman_availability')
        .delete()
        .eq('craftsman_id', profileData.id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      if (availableDates.length > 0) {
        const datesToInsert = availableDates.map(date => ({
          craftsman_id: profileData.id,
          date: date.toISOString().split('T')[0],
          time_slots: []
        }));
        
        const { error } = await supabase
          .from('craftsman_availability')
          .insert(datesToInsert);
          
        if (error) throw error;
      }
      
      toast.success("Dostupné dni boli úspešne uložené");
    } catch (error: any) {
      console.error("Error saving available dates:", error);
      setError(`Chyba pri ukladaní: ${error.message}`);
      toast.error("Chyba pri ukladaní dostupných dní");
    } finally {
      setSaving(false);
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

  const goToNextDay = () => {
    if (!selectedDate) return;
    const nextDay = addDays(selectedDate, 1);
    setSelectedDate(nextDay);
  };

  const goToPreviousDay = () => {
    if (!selectedDate) return;
    const prevDay = subDays(selectedDate, 1);
    setSelectedDate(prevDay);
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      availableDate => availableDate.toDateString() === date.toDateString()
    );
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return false;
    }
    
    return isDateAvailable(date);
  };
  
  const getDayName = (date: Date) => {
    return format(date, 'EEEE', { locale: sk });
  };

  const handleDateToggle = (date: Date) => {
    if (!isCurrentUser || userType !== 'craftsman') return;
    
    const dateString = date.toDateString();
    
    if (availableDates.some(d => d.toDateString() === dateString)) {
      setAvailableDates(prev => prev.filter(d => d.toDateString() !== dateString));
    } else {
      setAvailableDates(prev => [...prev, date]);
    }
  };

  const isDateSelected = (date: Date): boolean => {
    return availableDates.some(d => d.toDateString() === date.toDateString());
  };

  const CraftsmanCalendarEditor = () => (
    <div className="w-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {format(month, 'LLLL yyyy', { locale: sk })}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <CalendarUI
          mode="multiple"
          selected={availableDates}
          onSelect={(dates) => {
            if (Array.isArray(dates)) {
              setAvailableDates(dates);
            }
          }}
          month={month}
          onMonthChange={setMonth}
          className="p-3 pointer-events-auto w-full"
          showOutsideDays
        />
      </div>
      
      <div className="mt-4">
        {availableDates.length > 0 && (
          <div className="mb-4">
            <p className="font-medium text-sm mb-2">Vaše dostupné dni ({availableDates.length}):</p>
            <div className="flex flex-wrap gap-2">
              {availableDates
                .sort((a, b) => a.getTime() - b.getTime())
                .slice(0, 5)
                .map((date, i) => (
                  <div key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {format(date, 'dd.MM.yyyy')}
                  </div>
                ))}
              {availableDates.length > 5 && (
                <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                  +{availableDates.length - 5} ďalších
                </div>
              )}
            </div>
          </div>
        )}
        
        <Button
          onClick={saveAvailableDates}
          className="w-full"
          disabled={saving}
        >
          {saving ? "Ukladám..." : "Uložiť dostupné dni"}
        </Button>
      </div>
    </div>
  );

  const CustomerAvailabilityView = () => (
    <div className="w-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {format(month, 'LLLL yyyy', { locale: sk })}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <CalendarUI
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => !isDateAvailable(date)}
          modifiers={{
            available: (date) => isDateAvailable(date),
          }}
          modifiersStyles={{
            available: { backgroundColor: '#dcfce7' }
          }}
          className="p-3 pointer-events-auto w-full"
          showOutsideDays
        />
      </div>
      
      <div className="mt-4">
        {availableDates.length > 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <p className="text-sm">Toto sú dostupné dni remeselníka.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pre rezervovanie termínu sa prosím prihláste ako zákazník.
            </p>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <p className="text-sm">Remeselník nemá nastavené žiadne dostupné dni.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (!profileData) return null;

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
      
      {isCraftsmanProfile && userType === 'customer' && !isCurrentUser ? (
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Rezervovať termín
            </h3>
            
            {isLoadingDates ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Načítavam dostupné termíny...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : availableDates.length === 0 ? (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Remeselník momentálne nemá stanovené žiadne dostupné termíny.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "dd. MM. yyyy")
                        ) : (
                          "Vybrať dátum"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b">
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="text-sm font-medium">
                            {format(month, 'LLLL yyyy', { locale: sk })}
                          </div>
                          <Button variant="outline" size="sm" onClick={goToNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <CalendarUI
                          mode="single"
                          selected={selectedDate}
                          onSelect={date => date && setSelectedDate(date)}
                          month={month}
                          onMonthChange={setMonth}
                          disabled={(date) => !isDateSelectable(date)}
                          modifiers={{
                            available: (date) => isDateAvailable(date),
                          }}
                          modifiersStyles={{
                            available: { backgroundColor: '#dcfce7' }
                          }}
                          className="p-3 pointer-events-auto"
                          showOutsideDays
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={goToPreviousDay}
                      disabled={!selectedDate || !isDateSelectable(subDays(selectedDate, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={goToNextDay}
                      disabled={!selectedDate || !isDateSelectable(addDays(selectedDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {selectedDate && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">
                        {getDayName(selectedDate)} - {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}
                        {isToday(selectedDate) && (
                          <Badge variant="outline" className="ml-2 text-xs">Dnes</Badge>
                        )}
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            className={selectedTimeSlot === slot ? "bg-primary" : ""}
                            onClick={() => setSelectedTimeSlot(slot)}
                            size="sm"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {selectedTimeSlot && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium mb-2">
                            Správa (voliteľná)
                          </label>
                          <textarea
                            id="message"
                            className="w-full p-2 border rounded-md h-24 focus:ring-primary focus:border-primary"
                            placeholder="Doplňujúce informácie pre remeselníka..."
                            value={bookingMessage}
                            onChange={(e) => setBookingMessage(e.target.value)}
                          ></textarea>
                        </div>
                        
                        <Button 
                          onClick={handleBookAppointment} 
                          className="w-full" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Odosielam...
                            </>
                          ) : (
                            "Rezervovať termín"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : !isCraftsmanProfile ? (
        <Card className="border border-border/50">
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
      ) : (
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Váš kalendár dostupnosti
              </div>
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
              <CraftsmanCalendarEditor />
            )}
          </CardContent>
        </Card>
      )}

      {isCraftsmanProfile && userType !== 'customer' && !isCurrentUser && (
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Kalendár dostupnosti
            </h3>
            
            {isLoadingDates ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Načítavam dostupné termíny...</span>
              </div>
            ) : (
              <CustomerAvailabilityView />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactTab;
