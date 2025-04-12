
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon, Clock, FileText, Image, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookingRequestFormProps {
  onSubmit: (content: string, metadata: any) => void;
  onCancel: () => void;
}

const BookingRequestForm: React.FC<BookingRequestFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const availableTimeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error("Prosím, nahrajte obrázok v podporovanom formáte (JPEG, PNG, WEBP, GIF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.");
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File, bookingId: string): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `booking-${bookingId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `booking_images/${fileName}`;
      
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
  
  const handleSubmit = async () => {
    if (!date || !timeSlot) {
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    const bookingId = uuidv4();
    
    try {
      setIsUploading(true);
      
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, bookingId);
        if (!imageUrl) {
          toast.error("Nepodarilo sa nahrať obrázok. Skúste to prosím znova.");
          setIsUploading(false);
          return;
        }
      }
      
      // Create message content for chat display
      const content = `🗓️ **Požiadavka na termín**
Dátum: ${format(date, 'dd.MM.yyyy')}
Čas: ${timeSlot}
${amount ? `Odmena: ${amount} €` : ''}
${message ? `Správa: ${message}` : ''}
${imageUrl ? `[Priložený obrázok]` : ''}`;
      
      // Create metadata for structured data handling
      const metadata = {
        type: 'booking_request',
        status: 'pending',
        booking_id: bookingId,
        details: {
          date: formattedDate,
          time: timeSlot,
          message: message || null,
          amount: amount || null,
          image_url: imageUrl
        }
      };
      
      onSubmit(content, metadata);
    } catch (error) {
      console.error("Error in booking request submission:", error);
      toast.error("Nastala chyba pri odosielaní rezervácie");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium mb-4">Vytvorenie rezervácie termínu</h3>
      
      <div className="space-y-4">
        {/* Date picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vyberte dátum
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: sk }) : "Vyberte dátum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Time slot selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vyberte čas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {availableTimeSlots.map((slot) => (
              <Button
                key={slot}
                variant={timeSlot === slot ? "default" : "outline"}
                className="flex items-center justify-center"
                onClick={() => setTimeSlot(slot)}
              >
                <Clock className="h-4 w-4 mr-1" />
                {slot}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Amount/Price */}
        <div>
          <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Odmena (voliteľné)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="amount"
              type="text"
              placeholder="Odmena za vykonanú prácu..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {/* Image upload */}
        <div>
          <Label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Fotka (voliteľné)
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
        
        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Správa (voliteľné)
          </label>
          <div className="flex">
            <FileText className="h-4 w-4 mt-2 mr-2 text-gray-500" />
            <Textarea
              placeholder="Doplňte detaily o vašej požiadavke..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Zrušiť
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!date || !timeSlot || isUploading}
          >
            {isUploading ? "Odosielanie..." : "Odoslať rezerváciu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestForm;
