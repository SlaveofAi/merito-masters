
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TimeSlot } from '@/types/booking';
import { Plus, Minus, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format, parse } from 'date-fns';
import { sk } from 'date-fns/locale';

interface TimeSlotsEditorProps {
  timeSlots: TimeSlot[];
  onChange: (timeSlots: TimeSlot[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TimeSlotsEditor: React.FC<TimeSlotsEditorProps> = ({
  timeSlots,
  onChange,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [duration, setDuration] = useState<number>(1); // Duration in hours
  
  const handleAddTimeSlot = () => {
    let defaultStartTime = "09:00";
    
    // If there are existing slots, set start time after the last one
    if (timeSlots.length > 0) {
      const lastSlot = timeSlots[timeSlots.length - 1];
      const lastEndTime = parse(lastSlot.end_time, 'HH:mm', new Date());
      defaultStartTime = format(lastEndTime, 'HH:mm');
    }
    
    // Calculate end time based on duration
    const startDate = parse(defaultStartTime, 'HH:mm', new Date());
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    const endTime = format(endDate, 'HH:mm');
    
    const newTimeSlot: TimeSlot = {
      start_time: defaultStartTime,
      end_time: endTime,
      is_available: true
    };
    
    onChange([...timeSlots, newTimeSlot]);
  };
  
  const handleRemoveTimeSlot = (index: number) => {
    const updatedSlots = [...timeSlots];
    updatedSlots.splice(index, 1);
    onChange(updatedSlots);
  };
  
  const handleTimeChange = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    onChange(updatedSlots);
  };
  
  const formatTimeDisplay = (timeString: string) => {
    try {
      const date = parse(timeString, 'HH:mm', new Date());
      return format(date, 'HH:mm');
    } catch (error) {
      return timeString;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Dostupné časové bloky</div>
        <div className="flex items-center gap-2">
          <div className="text-sm">Trvanie:</div>
          <div className="flex rounded-md border">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={() => setDuration(Math.max(1, duration - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex items-center px-2">
              <span>{duration} h</span>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={() => setDuration(Math.min(8, duration + 1))}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddTimeSlot}
          >
            <Plus className="h-4 w-4 mr-1" /> Pridať blok
          </Button>
        </div>
      </div>
      
      {timeSlots.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Žiadne časové bloky</p>
          <p className="text-xs text-gray-400 mt-1">
            Pridajte časové bloky pre túto dostupnosť
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto p-1">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                  className="rounded-md border border-gray-300 p-1 w-24"
                />
                <span>-</span>
                <input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                  className="rounded-md border border-gray-300 p-1 w-24"
                />
                <span className="text-sm text-gray-500">
                  {formatTimeDisplay(slot.start_time)} - {formatTimeDisplay(slot.end_time)}
                </span>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveTimeSlot(index)}
                className="text-gray-500 hover:text-red-500"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <Separator />
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Zrušiť
        </Button>
        <Button 
          type="button" 
          onClick={onSave}
          disabled={timeSlots.length === 0 || isLoading}
          className="min-w-[80px]"
        >
          {isLoading ? "Ukladá sa..." : "Uložiť"}
        </Button>
      </div>
    </div>
  );
};

export default TimeSlotsEditor;
