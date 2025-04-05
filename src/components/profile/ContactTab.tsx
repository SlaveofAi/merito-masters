
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight, Upload, Euro, Clock } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ContactTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { userType, user } = useAuth();
  const [month, setMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasShownFirstAvailableMonth, setHasShownFirstAvailableMonth] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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
        
        // Set the calendar to show the first available month
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

  const BookingRequestForm = () => {
    const form = useForm({
      defaultValues: {
        date: "",
        time: "09:00",
        message: "",
        amount: ""
      }
    });

    useEffect(() => {
      if (selectedDate) {
        form.setValue('date', format(selectedDate, 'yyyy-MM-dd'));
      }
    }, [selectedDate, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedImage(file);
        
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleImageRemove = () => {
      setSelectedImage(null);
      setImagePreview(null);
    };

    const onSubmit = async (values: any) => {
      if (!profileData?.id || !user) {
        toast.error("Nemôžete poslať požiadavku, nie ste prihlásený");
        return;
      }
      
      try {
        let conversationId: string | null = null;
        
        // Check for existing conversation
        const { data: existingConversation, error: convFetchError } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('customer_id', user.id)
          .eq('craftsman_id', profileData.id)
          .maybeSingle();
        
        if (convFetchError) {
          console.error("Error checking for existing conversation:", convFetchError);
        }
        
        if (existingConversation) {
          conversationId = existingConversation.id;
          console.log("Found existing conversation:", conversationId);
        } else {
          // Create new conversation
          const { data: newConversation, error: createConvError } = await supabase
            .from('chat_conversations')
            .insert({
              customer_id: user.id,
              craftsman_id: profileData.id
            })
            .select();
          
          if (createConvError) {
            throw createConvError;
          }
          
          conversationId = newConversation?.[0]?.id || null;
          console.log("Created new conversation:", conversationId);
        }
        
        if (!conversationId) {
          throw new Error("Nepodarilo sa vytvoriť konverzáciu");
        }
        
        // Create booking request with conversation_id
        const bookingData = {
          conversation_id: conversationId,
          craftsman_id: profileData.id,
          customer_id: user.id,
          customer_name: user.user_metadata?.name || "Zákazník",
          date: values.date,
          start_time: values.time,
          end_time: "18:00",
          message: values.message,
          status: "pending"
        };
        
        const { data, error } = await supabase
          .from('booking_requests')
          .insert(bookingData)
          .select();
          
        if (error) throw error;
        
        // Create a structured booking request message for chat
        const bookingMessage = `🗓️ **Požiadavka na termín**
Dátum: ${values.date}
Čas: ${values.time}
${values.message ? `Správa: ${values.message}` : ''}
${values.amount ? `Suma: ${values.amount}€` : ''}`;

        // Send message to chat
        const { data: messageData, error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            receiver_id: profileData.id,
            content: bookingMessage,
            metadata: {
              type: 'booking_request',
              booking_id: data?.[0]?.id,
              status: 'pending',
              details: {
                date: values.date,
                time: values.time,
                message: values.message,
                amount: values.amount
              }
            }
          });
        
        if (messageError) {
          console.error("Error sending chat message:", messageError);
        }
        
        toast.success("Vaša požiadavka bola odoslaná remeselníkovi");
        form.reset();
        setSelectedDate(null);
        setSelectedImage(null);
        setImagePreview(null);
      } catch (error: any) {
        console.error("Error sending booking request:", error);
        toast.error("Nastala chyba pri odosielaní požiadavky");
      }
    };

    // Generate time options (hourly slots from 8:00 to 18:00)
    const timeOptions = Array.from({ length: 11 }, (_, i) => {
      const hour = i + 8;
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    const formattedAvailableDates = availableDates
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd.MM.yyyy');
        return { value: formattedDate, label: displayDate };
      });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vyberte dátum</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vyberte dostupný deň" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    {formattedAvailableDates.length > 0 ? (
                      formattedAvailableDates.map(date => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Žiadne dostupné dni
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vyberte čas</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vyberte čas" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Správa pre remeselníka</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Opíšte vašu požiadavku alebo projekt..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Navrhovaná cena (EUR)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pr-8"
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Euro className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Priložiť fotku (voliteľné)</FormLabel>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center w-32 h-10 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="text-sm">Nahrať</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-10 w-auto rounded-md" 
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Odoslať požiadavku
          </Button>
        </form>
      </Form>
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
              <h4 className="text-lg font-medium mb-3">Rezervovať termín</h4>
              <BookingRequestForm />
            </CardContent>
          </Card>
        )}
      </div>
      
      {isCraftsmanProfile ? (
        <Card className="border border-border/50 shadow-sm h-fit">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {isCurrentUser ? "Váš kalendár dostupnosti" : "Kalendár dostupnosti"}
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
              <div className="max-h-[450px] overflow-auto">
                <AvailabilityViewer />
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
