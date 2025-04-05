
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const ProfileCalendar: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available dates immediately when component mounts
  useEffect(() => {
    if (profileData?.id) {
      fetchAvailableDates();
      
      // Always ensure we have some default dates for demo purposes
      if (profileData.id === '66666666-6666-6666-6666-666666666666') {
        ensureDefaultAvailabilityDates(profileData.id);
      }
    }
  }, [profileData?.id]);

  // Create default availability dates for demo purposes
  const ensureDefaultAvailabilityDates = async (profileId: string) => {
    try {
      const { count, error } = await supabase
        .from('craftsman_availability')
        .select('*', { count: 'exact', head: true })
        .eq('craftsman_id', profileId);
        
      if (error) throw error;
      
      // If no dates exist, create default ones
      if (count === 0 || count === null) {
        console.log("Creating default availability dates for demo profile");
        
        // Generate 15 random dates in the next 30 days
        const datesToInsert = [];
        const now = new Date();
        const existingDates = new Set();
        
        // Create some consecutive days for a realistic pattern
        // Next Monday to Wednesday
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
        for (let i = 0; i < 3; i++) {
          const dateStr = new Date(nextMonday);
          dateStr.setDate(nextMonday.getDate() + i);
          datesToInsert.push({
            craftsman_id: profileId,
            date: dateStr.toISOString().split('T')[0]
          });
          existingDates.add(dateStr.toISOString().split('T')[0]);
        }
        
        // Add some random dates
        for (let i = 0; i < 12; i++) {
          const daysToAdd = Math.floor(Math.random() * 30) + 1;
          const randomDate = new Date(now);
          randomDate.setDate(now.getDate() + daysToAdd);
          const dateStr = randomDate.toISOString().split('T')[0];
          
          // Avoid duplicates
          if (!existingDates.has(dateStr)) {
            datesToInsert.push({
              craftsman_id: profileId,
              date: dateStr
            });
            existingDates.add(dateStr);
          }
        }
        
        if (datesToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('craftsman_availability')
            .insert(datesToInsert);
            
          if (insertError) {
            console.error("Error creating default availability dates:", insertError);
          } else {
            console.log(`Created ${datesToInsert.length} default availability dates`);
          }
        }
      }
    } catch (err) {
      console.error("Error in ensureDefaultAvailabilityDates:", err);
    }
  };

  // Fetch available dates from the database
  const fetchAvailableDates = async () => {
    if (!profileData?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching available dates for craftsman:", profileData.id);
      
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('date')
        .eq('craftsman_id', profileData.id);
        
      if (error) {
        console.error("Error fetching available dates:", error);
        setError("Chyba pri načítaní dostupných dní");
        return;
      }
      
      if (data && data.length > 0) {
        // Parse dates and set state
        const availableDates = data.map(item => new Date(item.date));
        setSelectedDates(availableDates);
        console.log(`Found ${availableDates.length} available dates`);
      } else {
        console.log("No available dates found");
        setSelectedDates([]);
      }
    } catch (err) {
      console.error("Error in fetchAvailableDates:", err);
      setError(`Neočakávaná chyba: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Save available dates to the database
  const saveAvailableDates = async () => {
    if (!user?.id || !profileData?.id) {
      toast.error("Nemôžem uložiť dostupnosť, chýba ID používateľa");
      return;
    }
    
    setSaving(true);
    
    try {
      console.log("Saving available dates:", selectedDates.length);
      
      // First delete existing dates
      const { error: deleteError } = await supabase
        .from('craftsman_availability')
        .delete()
        .eq('craftsman_id', profileData.id);
        
      if (deleteError) throw deleteError;
      
      // Then insert new dates
      if (selectedDates.length > 0) {
        const datesToInsert = selectedDates.map(date => ({
          craftsman_id: profileData.id,
          date: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
        }));
        
        const { error } = await supabase
          .from('craftsman_availability')
          .insert(datesToInsert);
          
        if (error) throw error;
      }
      
      toast.success("Dostupné dni boli úspešne uložené");
    } catch (error: any) {
      console.error("Error saving available dates:", error);
      toast.error(`Chyba pri ukladaní dostupných dní: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="bg-white rounded-md shadow-sm pointer-events-auto w-full max-w-md">
          <Calendar
            mode={isCurrentUser ? "multiple" : "single"}
            selected={isCurrentUser ? selectedDates : undefined}
            onSelect={isCurrentUser ? (dates) => {
              if (Array.isArray(dates)) {
                setSelectedDates(dates);
              }
            } : undefined}
            className="p-3 pointer-events-auto"
            disabled={(date) => {
              if (isCurrentUser) return false;
              return !selectedDates.some(d => d.toDateString() === date.toDateString());
            }}
            modifiers={{
              available: (date) => selectedDates.some(d => d.toDateString() === date.toDateString())
            }}
            modifiersStyles={{
              available: { backgroundColor: '#dcfce7' }
            }}
            footer={
              <div className="mt-3 text-center text-sm text-gray-500">
                {isCurrentUser ? (
                  <div>Vyberte dni, kedy ste dostupný</div>
                ) : (
                  <div>Zelené dni označujú dostupnosť remeselníka</div>
                )}
              </div>
            }
          />
        </div>
        
        {/* Information about selected dates */}
        {selectedDates.length > 0 && (
          <div className="mt-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Dostupné dni: {selectedDates.length}</h4>
              {isCurrentUser && (
                <Button size="sm" variant="outline" onClick={() => setSelectedDates([])}>
                  Vyčistiť
                </Button>
              )}
            </div>
            
            {/* Show upcoming available days */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .slice(0, 5)
                .map((date, i) => (
                  <Badge key={i} variant="outline" className="bg-green-50">
                    {format(date, 'EEE d.M.', { locale: sk })}
                  </Badge>
                ))}
              {selectedDates.length > 5 && (
                <Badge variant="outline">
                  +{selectedDates.length - 5} ďalších dní
                </Badge>
              )}
            </div>
            
            {/* Save button for craftsmen */}
            {isCurrentUser && (
              <Button 
                className="mt-4 w-full"
                onClick={saveAvailableDates}
                disabled={saving}
              >
                {saving ? "Ukladám..." : "Uložiť dostupnosť"}
              </Button>
            )}
          </div>
        )}
        
        {/* No dates message */}
        {selectedDates.length === 0 && (
          <div className="mt-4 text-center w-full max-w-md">
            {isCurrentUser ? (
              <div>
                <p className="text-gray-500 mb-3">Nemáte nastavené žiadne dostupné dni.</p>
                <Button 
                  onClick={() => {
                    // Add next 7 days as available
                    const next7Days = Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i + 1);
                      return date;
                    });
                    setSelectedDates(next7Days);
                  }}
                >
                  Nastaviť najbližších 7 dní
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">
                Remeselník momentálne nemá nastavené žiadne dostupné dni.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCalendar;
