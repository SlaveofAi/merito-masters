
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { BookingRequest } from "./BookingsList";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface BookingCardProps {
  booking: BookingRequest;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  
  // Format the date and time strings
  const formattedDate = formatDate(booking.date);
  const timeRange = `${booking.start_time} - ${booking.end_time}`;
  
  // Decide which name to display based on user type
  const isCustomer = userType?.toLowerCase() === 'customer';
  const displayName = isCustomer ? booking.craftsman_name : booking.customer_name;
  
  // Get avatar initials or image
  const getAvatarFallback = () => {
    const name = displayName || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Avatar image based on user type
  const avatarImage = isCustomer ? booking.craftsman_image : '';
  
  // Handle card click to navigate to the conversation
  const handleCardClick = () => {
    navigate('/messages', { 
      state: { 
        from: 'booking',
        conversationId: booking.conversation_id,
        bookingId: booking.id
      } 
    });
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={avatarImage || ''} alt={displayName || ''} />
            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{displayName || 'Neznáme meno'}</CardTitle>
            {isCustomer && booking.craftsman_trade && (
              <p className="text-sm text-muted-foreground">{booking.craftsman_trade}</p>
            )}
          </div>
        </div>
        <Badge variant={booking.status === 'approved' ? 'default' : 'outline'}>
          {booking.status === 'approved' ? 'Schválená' : 
           booking.status === 'pending' ? 'Čaká na schválenie' : 
           booking.status === 'rejected' ? 'Zamietnutá' : 
           booking.status === 'completed' ? 'Dokončená' : 
           booking.status === 'accepted' ? 'Schválená' : booking.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formattedDate}, {timeRange}</span>
          </div>
          {booking.message && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {booking.message}
            </p>
          )}
          {booking.amount && (
            <p className="text-sm font-medium">
              Cena: {booking.amount} €
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          handleCardClick();
        }}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Zobraziť konverzáciu
        </Button>
      </CardFooter>
    </Card>
  );
};
