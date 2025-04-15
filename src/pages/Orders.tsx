
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarClock, User, MessageSquare, DollarSign, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { user, userType } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const isCustomer = userType?.toLowerCase() === 'customer';
      const isCraftsman = userType?.toLowerCase() === 'craftsman';
      
      if (!isCustomer && !isCraftsman) {
        console.error("Unknown user type:", userType);
        setLoading(false);
        return;
      }

      const fieldToUse = isCustomer ? 'customer_id' : 'craftsman_id';
      
      // Get accepted booking requests
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          id,
          customer_id,
          craftsman_id,
          customer_name,
          date,
          start_time,
          end_time,
          amount,
          message,
          status,
          image_url,
          conversation_id
        `)
        .eq(fieldToUse, user.id)
        .eq('status', 'accepted');
      
      if (error) {
        throw error;
      }

      // Get conversation details and counterparty information
      if (data && data.length > 0) {
        // Create an array of promises for parallel execution
        const enrichedDataPromises = data.map(async (order) => {
          // Get contact details based on user type
          const contactId = isCustomer ? order.craftsman_id : order.customer_id;
          const { data: contactData, error: contactError } = await supabase
            .from(isCustomer ? 'craftsman_profiles' : 'customer_profiles')
            .select('name, profile_image_url, phone, email, location')
            .eq('id', contactId)
            .single();

          if (contactError) {
            console.error("Error fetching contact details:", contactError);
            return { ...order, contactDetails: null };
          }

          return { ...order, contactDetails: contactData };
        });

        // Wait for all queries to complete
        const enrichedData = await Promise.all(enrichedDataPromises);
        setOrders(enrichedData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Nastala chyba pri načítaní zákaziek");
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = (conversationId: string, contactId: string) => {
    navigate(`/messages?conversation=${conversationId}&contact=${contactId}`);
  };

  // Function to determine badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">Akceptovaná</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Dokončená</Badge>;
      default:
        return <Badge>Akceptovaná</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Zákazky</h1>
          <p>Pre zobrazenie zákaziek sa musíte prihlásiť.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Zákazky</h1>
          <Button onClick={fetchOrders} variant="outline" disabled={loading}>
            Obnoviť
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 border rounded-lg">
            <p className="text-lg text-muted-foreground">Nemáte žiadne akceptované zákazky</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Zoznam vašich aktuálnych zákaziek</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{userType === 'craftsman' ? 'Zákazník' : 'Remeselník'}</TableHead>
                  <TableHead>Dátum</TableHead>
                  <TableHead>Čas</TableHead>
                  <TableHead>Suma</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead className="text-right">Akcie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {userType === 'craftsman' 
                          ? order.customer_name 
                          : order.contactDetails?.name || 'Neznámy remeselník'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {formatDate(order.date)}
                      </div>
                    </TableCell>
                    <TableCell>{order.start_time} - {order.end_time}</TableCell>
                    <TableCell>
                      {order.amount ? (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {order.amount} €
                        </div>
                      ) : (
                        'Nedohodnuté'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewConversation(order.conversation_id, 
                          userType === 'craftsman' ? order.customer_id : order.craftsman_id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Správy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
