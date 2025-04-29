
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { CalendarIcon, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
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
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Enhanced craftsman detection - check both user_type field and trade_category existence
  const isCraftsmanProfile = profileData?.user_type === 'craftsman' || 
                             (profileData && 'trade_category' in profileData);
  const canEditCalendar = isCurrentUser && (isCraftsmanProfile || userType === 'craftsman');
  
  useEffect(() => {
    console.log("ProfileCalendar component rendered", {
      isCraftsmanProfile,
      hasUserType: !!profileData?.user_type,
      profileUserType: profileData?.user_type,
      hasTrade: profileData && 'trade_category' in profileData,
      isCurrentUser,
      userType,
      profileType: profileData?.user_type,
      userId: user?.id,
      profileId: profileData?.id,
      canEditCalendar
    });
  }, [profileData, isCurrentUser, userType, user, canEditCalendar, isCraftsmanProfile]);

  // Fetch available dates when component mounts
  useEffect(() => {
    if (profileData?.id) {
      console.log("Fetching available dates for:", profileData.id);
      fetchAvailableDates();
    } else {
      console.log("No profile ID available, skipping date fetch");
      setIsLoadingDates(false);
    }
  }, [profileData?.id]);

  // Update month when dates are loaded for customers
  useEffect(() => {
    if (!isCurrentUser && selectedDates.length > 0) {
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      setMonth(sortedDates[0]);
    }
  }, [selectedDates, isCurrentUser]);

  // Function to fetch available dates - accessible for both craftsman and customers
  const fetchAvailableDates = async () => {
    if (!profileData?.id) {
      setIsLoadingDates(false);
      return;
    }

    setError(null);
    setIsLoadingDates(true);
    
    try {
      console.log("Running fetchAvailableDates for:", profileData.id);
      
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('date, time_slots')
        .eq('craftsman_id', profileData.id);

      if (error) {
        console.error("Error fetching availability:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const parsedDates = data.map(item => new Date(item.date));
        console.log("Found available dates:", parsedDates);
        setSelectedDates(parsedDates);
        
        // Initialize time slots for the first date if we're looking at a specific date
        if (parsedDates.length > 0) {
          // Find time slots for the current date if it's one of the available dates
          const today = new Date();
          const todayString = today.toISOString().split('T')[0];
          const todayData = data.find(item => item.date === todayString);
          
          if (todayData && Array.isArray(todayData.time_slots)) {
            setAvailableTimeSlots(todayData.time_slots.map(slot => String(slot)));
          } else {
            // Set default time slots
            setAvailableTimeSlots(['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
          }
        }
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

  const saveAvailableDates = async () => {
    if (!user?.id || !profileData?.id) {
      toast.error("Nemôžem uložiť dostupnosť, chýba ID používateľa alebo nie ste prihlásený");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      console.log("Saving dates for craftsman:", profileData.id, selectedDates);
      
      // First delete all existing dates
      const { error: deleteError } = await supabase
        .from('craftsman_availability')
        .delete()
        .eq('craftsman_id', profileData.id);
        
      if (deleteError) throw deleteError;
      
      // Insert new dates if there are any
      if (selectedDates.length > 0) {
        const datesToInsert = selectedDates.map(date => ({
          craftsman_id: profileData.id,
          date: date.toISOString().split('T')[0],
          time_slots: ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
        }));
        
        const { error } = await supabase
          .from('craftsman_availability')
          .insert(datesToInsert);
          
        if (error) throw error;
      }
      
      setMotivationalMessage("Vaša dostupnosť bola úspešne aktualizovaná!");
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
    if (!date || !canEditCalendar) return;
    
    setSelectedDates(prev => {
      const dateExists = prev.some(d => d.toDateString() === date.toDateString());
      if (dateExists) {
        return prev.filter(d => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date];
      }
    });
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

  // Helper function to check if a date is in the selected dates array
  const isDateAvailable = (date: Date): boolean => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  if (isLoadingDates) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Načítavam kalendár dostupnosti...</p>
        </CardContent>
      </Card>
    );
  }

  console.log("Calendar rendering conditions:", {
    isCurrentUser,
    canEditCalendar,
    isCraftsmanProfile,
    selectedDates: selectedDates.length
  });

  // Special case for customers viewing a craftsman's profile
  // We want to show a simplified view with just available days
  if (!isCurrentUser && !canEditCalendar && isCraftsmanProfile) {
    console.log("Rendering customer view of craftsman calendar");
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
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
            
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={() => {}} // Customers can't select dates
              month={month}
              onMonthChange={setMonth}
              className="p-3 h-auto pointer-events-auto"
              modifiers={{
                available: selectedDates
              }}
              modifiersStyles={{
                available: { backgroundColor: '#e6f7e6', color: '#111827', fontWeight: 'bold' }
              }}
              disabled={(date) => {
                // A date is disabled if it's not in the selected dates (craftsman's available dates)
                return !isDateAvailable(date);
              }}
            />
            
            <div className="mt-3 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 mr-2 rounded"></div>
              <span className="text-xs text-gray-500">
                Remeselník je dostupný v označené dni
              </span>
            </div>

            {selectedDates.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  Remeselník momentálne nemá stanovené žiadne dostupné termíny.
                </p>
              </div>
            )}

            {selectedDates.length > 0 && (
              <div className="mt-4 flex justify-center">
                <div className="text-center">
                  <p className="font-medium text-sm mb-2">Dostupné dni ({selectedDates.length}):</p>
                  <div className="flex flex-wrap gap-2 justify-center">
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
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
        
        <div className="flex flex-col items-center">
          <div className="p-3 border-b w-full">
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
          
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={(dates) => {
              if (canEditCalendar && Array.isArray(dates)) {
                setSelectedDates(dates);
              }
            }}
            month={month}
            onMonthChange={setMonth}
            className="p-3 h-auto pointer-events-auto"
            disabled={!canEditCalendar}
          />
          
          <div className="mt-3 flex items-center justify-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 mr-2 rounded"></div>
            <span className="text-xs text-gray-500">
              {canEditCalendar 
                ? "Vaše vybrané dostupné dni" 
                : "Remeselník je dostupný v označené dni"}
            </span>
          </div>

          {selectedDates.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                {canEditCalendar 
                  ? "Zatiaľ ste nepridali žiadne dostupné termíny." 
                  : "Remeselník momentálne nemá stanovené žiadne dostupné termíny."}
              </p>
            </div>
          )}
        </div>
        
        {canEditCalendar && (
          <div className="mt-4">
            {selectedDates.length > 0 && (
              <div className="mb-4">
                <p className="font-medium text-sm mb-2 text-center">Vaše dostupné dni ({selectedDates.length}):</p>
                <div className="flex flex-wrap gap-2 justify-center">
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
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : "Uložiť dostupné dni"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCalendar;
