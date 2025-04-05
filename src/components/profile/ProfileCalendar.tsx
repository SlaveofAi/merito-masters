
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const ProfileCalendar: React.FC = () => {
  const { user, userType } = useAuth();
  const { profileData, isCurrentUser } = useProfile();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [saving, setSaving] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');

  // Check if we're viewing a craftsman profile
  const isCraftsmanProfile = profileData?.user_type === 'craftsman';

  useEffect(() => {
    if (profileData?.id && isCraftsmanProfile) {
      fetchAvailableDates();
    } else {
      setIsLoadingDates(false);
    }
  }, [profileData?.id, isCraftsmanProfile]);

  // Set the month to the first available month for customers
  useEffect(() => {
    if (!isCurrentUser && selectedDates.length > 0) {
      // Sort dates and get the earliest one
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const earliestDate = sortedDates[0];
      // Set the month to the earliest available date
      setMonth(earliestDate);
    }
  }, [selectedDates, isCurrentUser]);

  const fetchAvailableDates = async () => {
    if (!profileData?.id) {
      setIsLoadingDates(false);
      return;
    }

    setError(null);
    setIsLoadingDates(true);
    
    try {
      console.log("Running fetchAvailableDates for:", profileData?.id);
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('date')
        .eq('craftsman_id', profileData?.id);

      if (error) {
        console.error("Error fetching available dates:", error);
        setError("Nepodarilo sa načítať dostupné dni. Skúste obnoviť stránku.");
        setIsLoadingDates(false);
        return;
      }

      if (data && data.length > 0) {
        // Parse the dates from string to Date objects
        const parsedDates = data.map(item => new Date(item.date));
        console.log("Found available dates:", parsedDates);
        setSelectedDates(parsedDates);
      } else {
        console.log("No available dates found");
        setSelectedDates([]);
      }
    } catch (err: any) {
      console.error("Error processing available dates:", err);
      setError(`Chyba: ${err.message}`);
    } finally {
      setIsLoadingDates(false);
    }
  };

  // Get motivational phrases for craftsman
  const getMotivationalPhrase = () => {
    const phrases = [
      "Výborne! Vaša dostupnosť je nastavená, zákazníci vás môžu kontaktovať!",
      "Super! Vaše termíny sú pripravené na rezervácie!",
      "Skvelá práca! Teraz ste viditeľný pre potenciálnych zákazníkov!",
      "Fantastické! Váš kalendár je pripravený prijímať rezervácie!",
      "Perfektné! Ste na ceste k novým zákazkám!"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const saveAvailableDates = async () => {
    if (!user?.id || !profileData?.id || userType !== 'craftsman') {
      toast.error("Nemôžem uložiť dostupnosť, chýba ID používateľa");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      console.log("Saving dates for craftsman:", profileData.id, selectedDates);
      
      // First delete all existing dates for this craftsman
      const { error: deleteError } = await supabase
        .from('craftsman_availability')
        .delete()
        .eq('craftsman_id', profileData.id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Then insert the new dates
      if (selectedDates.length > 0) {
        const datesToInsert = selectedDates.map(date => ({
          craftsman_id: profileData.id,
          date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          time_slots: []
        }));
        
        const { error } = await supabase
          .from('craftsman_availability')
          .insert(datesToInsert);
          
        if (error) throw error;
      }
      
      // Set a new motivational message after successful save
      setMotivationalMessage(getMotivationalPhrase());
      toast.success("Dostupné dni boli úspešne uložené");
    } catch (error: any) {
      console.error("Error saving available dates:", error);
      setError(`Chyba pri ukladaní: ${error.message}`);
      toast.error("Chyba pri ukladaní dostupných dní");
    } finally {
      setSaving(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !isCurrentUser) return;
    
    // If the date is already selected, remove it
    if (selectedDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      // Otherwise add it to the selected dates
      setSelectedDates(prev => [...prev, date]);
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

  if (!isCraftsmanProfile) {
    return null;
  }

  // Define the calendar component based on user type
  const CraftsmanCalendar = () => (
    <Calendar
      mode="multiple"
      selected={selectedDates}
      onSelect={(dates) => {
        if (Array.isArray(dates)) {
          setSelectedDates(dates);
        }
      }}
      className="p-3 pointer-events-auto h-auto"
    />
  );

  const CustomerCalendar = () => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      disabled={(date) => !selectedDates.some(d => d.toDateString() === date.toDateString())}
      modifiers={{
        available: (date) => selectedDates.some(d => d.toDateString() === date.toDateString())
      }}
      modifiersStyles={{
        available: { backgroundColor: '#dcfce7', color: '#111827', fontWeight: 700, border: '1px solid #86efac' }
      }}
      className="p-3 pointer-events-auto h-auto"
    />
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          <span>Kalendár dostupnosti</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoadingDates ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Načítavam kalendár dostupnosti...</p>
          </div>
        ) : selectedDates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {isCurrentUser 
                ? "Zatiaľ ste nepridali žiadne dostupné termíny. Pridajte termíny nižšie." 
                : "Remeselník momentálne nemá stanovené žiadne dostupné termíny."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium capitalize">
                  {month.toLocaleString('sk-SK', { month: 'long', year: 'numeric' })}
                </div>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isCurrentUser ? <CraftsmanCalendar /> : <CustomerCalendar />}
            
            <div className="mt-3 flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 mr-2 rounded"></div>
              <span className="text-xs text-gray-500">
                {isCurrentUser 
                  ? "Vaše vybrané dostupné dni" 
                  : "Remeselník je dostupný v označené dni"}
              </span>
            </div>
          </div>
        )}
        
        {isCurrentUser && (
          <div className="mt-4">
            {selectedDates.length > 0 && (
              <div className="mb-4">
                <p className="font-medium text-sm mb-2">Vaše dostupné dni ({selectedDates.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDates
                    .sort((a, b) => a.getTime() - b.getTime())
                    .slice(0, 5)
                    .map((date, i) => (
                      <div key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {date.toLocaleDateString('sk-SK')}
                      </div>
                    ))}
                  {selectedDates.length > 5 && (
                    <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                      +{selectedDates.length - 5} ďalších
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {motivationalMessage && (
              <div className="text-center p-3 mb-4 bg-primary/5 rounded-lg">
                <p className="font-medium text-gray-700">{motivationalMessage}</p>
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
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCalendar;
