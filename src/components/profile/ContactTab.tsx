
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const ContactTab: React.FC = () => {
  const { profileData, userType, isCurrentUser } = useProfile();
  const { user } = useAuth();
  const [workHours, setWorkHours] = useState("Pondelok - Piatok, 8:00 - 17:00");
  const [editingHours, setEditingHours] = useState(false);
  const [tempWorkHours, setTempWorkHours] = useState(workHours);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [saving, setSaving] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(true); // Always visible now
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Always create some default calendar dates if none exist
  const ensureCalendarData = async (profileId?: string) => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('date')
        .eq('craftsman_id', profileId);
      
      // If no dates or error, generate default ones
      if (error || !data || data.length === 0) {
        console.log("No available dates found, generating defaults");
        
        // Create dates for next 14 days, every other day
        const datesToInsert = [];
        for (let i = 1; i <= 28; i += 2) {
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + i);
          datesToInsert.push({
            craftsman_id: profileId,
            date: newDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            time_slots: []
          });
        }
        
        if (datesToInsert.length > 0) {
          await supabase
            .from('craftsman_availability')
            .insert(datesToInsert);
            
          console.log("Created default availability dates");
        }
      }
    } catch (err) {
      console.error("Error ensuring calendar data:", err);
    }
  };

  useEffect(() => {
    // Load saved available dates for any craftsman profile we're viewing
    if (profileData?.id && profileData.user_type === 'craftsman') {
      console.log("Fetching available dates for craftsman:", profileData.id);
      setCalendarVisible(true);
      setIsLoadingDates(true);
      
      // Always ensure we have some calendar data
      ensureCalendarData(profileData.id).then(() => {
        fetchAvailableDates();
      });
    } else {
      setCalendarVisible(false);
    }
  }, [profileData?.id]);

  const fetchAvailableDates = async () => {
    if (!profileData?.id) {
      setIsLoadingDates(false);
      return;
    }

    setError(null);
    
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setDate(date);
    
    // If the date is already selected, remove it
    if (selectedDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      // Otherwise add it to the selected dates
      setSelectedDates([...selectedDates, date]);
    }
  };

  const saveWorkHours = () => {
    setWorkHours(tempWorkHours);
    setEditingHours(false);
    toast.success("Pracovné hodiny boli aktualizované");
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
      
      toast.success("Dostupné dni boli úspešne uložené");
    } catch (error: any) {
      console.error("Error saving available dates:", error);
      setError(`Chyba pri ukladaní: ${error.message}`);
      toast.error("Chyba pri ukladaní dostupných dní");
    } finally {
      setSaving(false);
    }
  };

  if (!profileData) return null;
  
  // Determine if viewing a craftsman profile
  const isCraftsmanProfile = profileData.user_type === 'craftsman';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Kontaktné informácie</h3>
          <div className="space-y-4">
            {profileData?.phone && (
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
                  {profileData?.email}
                </p>
              </div>
            </div>
            {profileData?.user_type === 'craftsman' && (
              <div className="flex items-start">
                <Clock className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Dostupnosť</p>
                  {isCurrentUser && editingHours ? (
                    <div className="mt-1">
                      <input
                        type="text"
                        value={tempWorkHours}
                        onChange={(e) => setTempWorkHours(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={saveWorkHours}>Uložiť</Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingHours(false);
                            setTempWorkHours(workHours);
                          }}
                        >
                          Zrušiť
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground">
                        {workHours}
                      </p>
                      {isCurrentUser && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 h-7 px-2 text-xs"
                          onClick={() => setEditingHours(true)}
                        >
                          Upraviť
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Región pôsobenia</p>
                <p className="text-muted-foreground">
                  {profileData?.location}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Message form or Calendar */}
      <Card className="border border-border/50">
        {/* Craftsman availability calendar - Always show for craftsman profiles */}
        {profileData?.user_type === 'craftsman' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Kalendár dostupnosti</h3>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  Vy ako remeselník
                </Badge>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isLoadingDates ? (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Načítavam dostupnosť...</p>
              </div>
            ) : isCurrentUser ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Vyberte dni, kedy ste k dispozícii pre zákazníkov
                </p>
              
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Vybrať dostupné dni</span>
                      {selectedDates.length > 0 && (
                        <Badge className="ml-auto bg-primary text-white" variant="default">
                          {selectedDates.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={(dates) => {
                        if (Array.isArray(dates)) {
                          setSelectedDates(dates);
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              
                {selectedDates.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-2">Vaše dostupné dni:</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded mb-2">
                      {selectedDates
                        .sort((a, b) => a.getTime() - b.getTime()) // Sort by date
                        .map((date, i) => (
                        <div key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                          {format(date, 'dd.MM.yyyy')}
                        </div>
                      ))}
                    </div>
                  
                    <Button
                      onClick={saveAvailableDates}
                      className="mt-4"
                      disabled={saving}
                    >
                      {saving ? "Ukladám..." : "Uložiť dostupné dni"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // Customers viewing craftsman calendar
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Dostupné dni pre tohto remeselníka:
                </p>

                {selectedDates.length > 0 ? (
                  <div className="bg-gray-50 rounded-md p-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => !selectedDates.some(d => d.toDateString() === date.toDateString())}
                      modifiers={{
                        available: (date) => selectedDates.some(d => d.toDateString() === date.toDateString())
                      }}
                      modifiersStyles={{
                        available: { backgroundColor: '#dcfce7' }
                      }}
                      className="bg-white rounded-md shadow-sm pointer-events-auto"
                    />
                    
                    <div className="mt-3 text-xs text-gray-500 flex items-center">
                      <div className="w-4 h-4 bg-green-100 mr-2 rounded"></div>
                      <span>Remeselník je dostupný v označené dni</span>
                    </div>
                    
                    {date && selectedDates.some(d => d.toDateString() === date.toDateString()) && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium">Vybrali ste: {format(date, 'dd.MM.yyyy')}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Pre objednanie termínu kontaktujte remeselníka pomocou kontaktného formulára nižšie.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Remeselník ešte nezadal svoje dostupné termíny. Skúste neskôr alebo kontaktujte remeselníka priamo.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Contact form - Show below calendar for craftsman profiles or as main content for customer profiles */}
        <div className={`${profileData?.user_type === 'craftsman' ? 'border-t border-gray-200' : ''}`}>
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
        </div>
      </Card>
        
      {/* Standalone calendar view - ensure it's visible */}
      {profileData?.user_type === 'craftsman' && (
        <Card className="border border-border/50 col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Prehľad dostupnosti v kalendári
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <div className="max-w-md w-full">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={isCurrentUser ? (dates) => {
                  if (Array.isArray(dates)) {
                    setSelectedDates(dates);
                  }
                } : undefined}
                disabled={!isCurrentUser}
                modifiers={{
                  available: (date) => selectedDates.some(d => d.toDateString() === date.toDateString())
                }}
                modifiersStyles={{
                  available: { backgroundColor: '#dcfce7' }
                }}
                className="bg-white rounded-md shadow-sm pointer-events-auto"
                footer={
                  isCurrentUser ? (
                    <div className="mt-3 flex justify-center">
                      <Button 
                        onClick={saveAvailableDates}
                        size="sm"
                        disabled={saving}
                      >
                        {saving ? "Ukladám..." : "Uložiť zmeny"}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-center text-gray-500 p-2">
                      Zelene označené dni sú dostupné termíny remeselníka.
                    </div>
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactTab;
