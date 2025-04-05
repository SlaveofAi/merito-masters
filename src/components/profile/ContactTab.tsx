
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

const ContactTab: React.FC = () => {
  const { profileData, isCurrentUser } = useProfile();
  const { userType } = useAuth();
  const [month, setMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Check if we're viewing a craftsman profile by using type guard
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

  const saveAvailableDates = async () => {
    if (!profileData?.id || userType !== 'craftsman') {
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

  // For craftsmen to edit their availability
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

  // For customers to view craftsman's availability (read-only)
  const AvailabilityViewer = () => (
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
          mode="default"
          month={month}
          onMonthChange={setMonth}
          modifiers={{
            available: (date) => availableDates.some(d => d.toDateString() === date.toDateString())
          }}
          modifiersStyles={{
            available: { backgroundColor: '#dcfce7' }
          }}
          className="p-3 pointer-events-auto w-full"
          showOutsideDays
          disabled={date => true} // Make all dates non-interactive
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
          <p className="text-sm text-gray-500">Remeselník nemá nastavené žiadne dostupné dni.</p>
        </div>
      )}
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
      
      {isCraftsmanProfile ? (
        <Card className="border border-border/50 h-full">
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
            ) : isCurrentUser && userType === 'craftsman' ? (
              <CraftsmanCalendarEditor />
            ) : (
              <AvailabilityViewer />
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
      ) : null}
    </div>
  );
};

export default ContactTab;
