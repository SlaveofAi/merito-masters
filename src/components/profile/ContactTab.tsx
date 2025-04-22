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
import { Image, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const ContactTab = () => {
  const { profileData, loading, isCurrentUser } = useProfile();
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [bookingDescription, setBookingDescription] = useState("");
  const [address, setAddress] = useState("");
  const [bookingPrice, setBookingPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("booking");

  // Check if the current user is a customer viewing a craftsman's profile
  const isCustomerViewingCraftsman = user && userType === 'customer' && 
    profileData && profileData.user_type === 'craftsman';

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
        const slots = data.time_slots;
        // Check if slots is an array before setting, and convert to string array
        if (Array.isArray(slots)) {
          const stringSlots = slots.map(slot => String(slot));
          setAvailableTimeSlots(stringSlots);
        } else {
          // If not an array, set default slots
          const defaultSlots = [];
          for (let i = 9; i <= 17; i++) {
            defaultSlots.push(`${i}:00`);
          }
          setAvailableTimeSlots(defaultSlots);
        }
      }
      
      // Reset selected time slot if it was previously set
      setSelectedTimeSlot("");
    } catch (error) {
      console.error("Error in fetch available time slots:", error);
      setAvailableTimeSlots([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error("Prosím, nahrajte obrázok v podporovanom formáte (JPEG, PNG, WEBP, GIF)");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.");
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `booking-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('booking_images')
        .upload(filePath, file, {
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading booking image:", uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('booking_images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading booking image:', error);
      toast.error("Nastala chyba pri nahrávaní obrázku");
      return null;
    } finally {
      setIsUploading(false);
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
      
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          toast.error("Nepodarilo sa nahrať obrázok. Skúste to prosím znova.");
          setIsSubmitting(false);
          return;
        }
      }
      
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
          date: formattedDate,
          start_time: selectedTimeSlot,
          end_time: (parseInt(selectedTimeSlot.split(':')[0]) + 1) + ":" + selectedTimeSlot.split(':')[1],
          message: bookingDescription,
          amount: bookingPrice ? bookingPrice : null,
          image_url: imageUrl
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
          receiver_id: profileData.id,
          content: `Rezervácia: ${formattedDate} ${selectedTimeSlot}`,
          metadata: { 
            type: 'booking_request',
            details: {
              date: formattedDate,
              time: selectedTimeSlot,
              message: bookingDescription,
              amount: bookingPrice || null,
              image_url: imageUrl
            }
          },
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

  // Don't show booking functionality if the current user is a craftsman or viewing their own profile
  if (userType === 'craftsman' || isCurrentUser) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto text-center">
        <h3 className="text-xl font-semibold mb-4">Kontakt</h3>
        {isCurrentUser && profileData.user_type === 'craftsman' ? (
          <p className="mb-6 text-gray-600">
            Nastavte svoju dostupnosť v sekcii "Kalendár dostupnosti" vyššie na tejto stránke.
          </p>
        ) : (
          <p className="mb-6 text-gray-600">
            Tu môžete vidieť dostupnosť remeselníka a kontaktovať ho prostredníctvom správy.
          </p>
        )}
      </div>
    );
  }

  // Get hourly rate from profileData if it's a craftsman
  const hourlyRate = profileData.user_type === 'craftsman' && 'hourly_rate' in profileData 
    ? (profileData as any).hourly_rate 
    : null;

  // Only show booking functionality for customers viewing a craftsman's profile
  if (!isCustomerViewingCraftsman) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto text-center">
        <h3 className="text-xl font-semibold mb-4">Kontaktujte nás</h3>
        <p className="mb-6 text-gray-600">
          Pre viac informácií nás prosím kontaktujte prostredníctvom správy.
        </p>
        <Button onClick={handleSendMessage}>
          Poslať správu
        </Button>
      </div>
    );
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
                  
                  <div>
                    <Label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Pridať fotografiu (voliteľné)
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="image-upload"
                          className="flex items-center justify-center gap-2 cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 border rounded-md text-sm font-medium"
                        >
                          <Image className="h-4 w-4" />
                          Nahrať obrázok
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        {imageFile && (
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {imageFile.name}
                          </span>
                        )}
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-2">
                          <div className="relative w-full max-w-xs">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-auto rounded-md object-cover"
                              style={{ maxHeight: '150px' }} 
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              &times;
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!selectedDate || !selectedTimeSlot || !bookingDescription || isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Odosielam...
                    </>
                  ) : (
                    "Odoslať požiadavku"
                  )}
                </Button>
                
                {hourlyRate && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Hodinová sadzba: {formatCurrency(hourlyRate || 0)}
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
