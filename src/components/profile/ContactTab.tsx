
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const ContactTab: React.FC = () => {
  const { profileData, userType, isCurrentUser } = useProfile();
  const { user } = useAuth();
  const [workHours, setWorkHours] = useState("Pondelok - Piatok, 8:00 - 17:00");
  const [editingHours, setEditingHours] = useState(false);
  const [tempWorkHours, setTempWorkHours] = useState(workHours);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved available dates for any craftsman profile we're viewing
    if (profileData?.id && profileData.user_type === 'craftsman') {
      fetchAvailableDates();
    }
  }, [profileData?.id]);

  const fetchAvailableDates = async () => {
    try {
      const { data, error } = await supabase
        .from('craftsman_availability')
        .select('date')
        .eq('craftsman_id', profileData?.id);

      if (error) {
        console.error("Error fetching available dates:", error);
        return;
      }

      if (data && data.length > 0) {
        const parsedDates = data.map(item => new Date(item.date));
        setSelectedDates(parsedDates);
      }
    } catch (err) {
      console.error("Error processing available dates:", err);
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
  };

  const saveAvailableDates = async () => {
    if (!user?.id || !profileData?.id || userType !== 'craftsman') {
      toast.error("Nemôžem uložiť dostupnosť, chýba ID používateľa");
      return;
    }

    setSaving(true);
    
    try {
      // First delete all existing dates for this craftsman
      await supabase
        .from('craftsman_availability')
        .delete()
        .eq('craftsman_id', profileData.id);
      
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
            {isCraftsmanProfile && (
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
                  {profileData.location}
                </p>
              </div>
            </div>
          </div>
          
          {/* Show craftsman availability calendar */}
          {isCraftsmanProfile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Dostupnosť v kalendári</h4>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    Vy ako remeselník
                  </Badge>
                )}
              </div>
              
              {isCurrentUser ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Vyberte dni, kedy ste k dispozícii pre zákazníkov
                  </p>
                
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Vybrať dostupné dni</span>
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
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.map((date, i) => (
                          <div key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                            {date.toLocaleDateString('sk-SK')}
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
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Remeselník zatiaľ nezadal svoje dostupné dni.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
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
    </div>
  );
};

export default ContactTab;
