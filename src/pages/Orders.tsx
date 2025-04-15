
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, MessageCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Orders = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const userIdField = userType === 'craftsman' ? 'craftsman_id' : 'customer_id';
        
        const { data, error } = await supabase
          .from('booking_requests')
          .select(`
            *,
            craftsman_profiles!inner(name, profile_image_url, trade_category, location),
            customer_profiles!inner(name, profile_image_url)
          `)
          .eq(userIdField, user.id)
          .in('status', ['accepted', 'completed'])
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        console.log("Fetched bookings:", data);
        setBookings(data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Nastala chyba pri načítaní zákaziek");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, userType]);

  const handleMarkCompleted = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: 'completed' })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'completed' } : booking
        )
      );
      
      toast.success("Zákazka označená ako dokončená");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Nastala chyba pri aktualizácii zákazky");
    }
  };

  const handleOpenChat = (booking: any) => {
    navigate('/messages', { 
      state: { 
        from: 'orders',
        conversationId: booking.conversation_id 
      } 
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy', { locale: sk });
    } catch (e) {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <h2 className="text-xl font-medium mb-4">Pre zobrazenie zákaziek sa musíte prihlásiť</h2>
              <Button onClick={() => navigate('/login')}>Prihlásiť sa</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Moje zákazky</h1>
        
        <Tabs defaultValue="accepted">
          <TabsList className="mb-6">
            <TabsTrigger value="accepted">Aktuálne zákazky</TabsTrigger>
            <TabsTrigger value="completed">Dokončené zákazky</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accepted">
            {loading ? (
              <div className="text-center py-8">Načítavam zákazky...</div>
            ) : bookings.filter(b => b.status === 'accepted').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <h2 className="text-xl font-medium mb-2">Nemáte žiadne aktuálne zákazky</h2>
                  <p className="text-gray-500 mb-4">
                    Aktuálne zákazky sa zobrazia, keď {userType === 'craftsman' ? 'akceptujete požiadavky od zákazníkov' : 'remeselník akceptuje vašu požiadavku'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {bookings
                  .filter(booking => booking.status === 'accepted')
                  .map(booking => (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {userType === 'customer' 
                              ? `Zákazka - ${booking.craftsman_profiles?.trade_category || 'Remeselník'}`
                              : `Zákazka - ${booking.customer_profiles?.name || 'Zákazník'}`
                            }
                          </CardTitle>
                          <Badge>{booking.status === 'accepted' ? 'Akceptovaná' : 'Dokončená'}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Dátum: {formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>Čas: {booking.start_time}</span>
                          </div>
                          {userType === 'customer' ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Remeselník: {booking.craftsman_profiles?.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Zákazník: {booking.customer_profiles?.name}</span>
                            </div>
                          )}
                          {booking.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Miesto: {booking.location}</span>
                            </div>
                          )}
                          {booking.amount && (
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-gray-500" />
                              <span>Suma: {booking.amount}€</span>
                            </div>
                          )}
                          {booking.message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                              <p className="font-medium mb-1">Správa:</p>
                              <p>{booking.message}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenChat(booking)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Správy
                          </Button>
                          
                          {userType === 'craftsman' && booking.status === 'accepted' && (
                            <Button 
                              size="sm"
                              onClick={() => handleMarkCompleted(booking.id)}
                            >
                              Označiť ako dokončené
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {loading ? (
              <div className="text-center py-8">Načítavam zákazky...</div>
            ) : bookings.filter(b => b.status === 'completed').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <h2 className="text-xl font-medium mb-2">Nemáte žiadne dokončené zákazky</h2>
                  <p className="text-gray-500 mb-4">
                    Tu sa zobrazia zákazky, ktoré boli označené ako dokončené
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {bookings
                  .filter(booking => booking.status === 'completed')
                  .map(booking => (
                    <Card key={booking.id} className="overflow-hidden border-green-100">
                      <CardHeader className="bg-green-50 pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {userType === 'customer' 
                              ? `Zákazka - ${booking.craftsman_profiles?.trade_category || 'Remeselník'}`
                              : `Zákazka - ${booking.customer_profiles?.name || 'Zákazník'}`
                            }
                          </CardTitle>
                          <Badge variant="outline" className="bg-green-100">Dokončená</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Dátum: {formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>Čas: {booking.start_time}</span>
                          </div>
                          {userType === 'customer' ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Remeselník: {booking.craftsman_profiles?.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Zákazník: {booking.customer_profiles?.name}</span>
                            </div>
                          )}
                          {booking.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Miesto: {booking.location}</span>
                            </div>
                          )}
                          {booking.amount && (
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-gray-500" />
                              <span>Suma: {booking.amount}€</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenChat(booking)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Správy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Orders;
