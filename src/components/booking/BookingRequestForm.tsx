
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

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
  
  const availableTimeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];
  
  const handleSubmit = () => {
    if (!date || !timeSlot) {
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    const bookingId = uuidv4();
    
    // Create message content for chat display
    const content = `🗓️ **Požiadavka na termín**
Dátum: ${format(date, 'dd.MM.yyyy')}
Čas: ${timeSlot}
${message ? `Správa: ${message}` : ''}`;
    
    // Create metadata for structured data handling
    const metadata = {
      type: 'booking_request',
      status: 'pending',
      booking_id: bookingId,
      details: {
        date: formattedDate,
        time: timeSlot,
        message: message || null
      }
    };
    
    onSubmit(content, metadata);
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
            disabled={!date || !timeSlot}
          >
            Odoslať rezerváciu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestForm;
