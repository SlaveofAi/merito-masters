
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MessageSquare, Euro } from "lucide-react";
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
  
  // Determine whether current user is a customer or craftsman
  const isCustomer = userType?.toLowerCase() === 'customer';
  
  // Fixed: If craftsman is viewing → show customer details
  // If customer is viewing → show craftsman details
  const displayName = isCustomer 
    ? booking.craftsman_name 
    : booking.customer_name;
    
  const profileImage = isCustomer 
    ? booking.craftsman_image 
    : booking.customer_image;
  
  // Get avatar initials
  const getAvatarFallback = () => {
    const name = displayName || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
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

  // Get Slovak status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Čaká na schválenie';
      case 'approved':
      case 'accepted':
        return 'Schválená';
      case 'declined':
      case 'rejected':
        return 'Zamietnutá';
      case 'completed':
        return 'Dokončená';
      default:
        return status;
    }
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
      case 'accepted':
      case 'completed':
        return 'default';
      case 'declined':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/60" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarImage src={profileImage || ''} alt={displayName || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getAvatarFallback()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {displayName || 'Neznáme meno'}
              </h3>
              {isCustomer && booking.craftsman_trade && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {booking.craftsman_trade}
                </p>
              )}
            </div>
          </div>
          <Badge variant={getBadgeVariant(booking.status)} className="shrink-0 text-xs">
            {getStatusLabel(booking.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-1.5 h-4 w-4" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1.5 h-4 w-4" />
            <span>{timeRange}</span>
          </div>
        </div>
        
        {booking.amount && (
          <div className="flex items-center text-sm">
            <Euro className="mr-1.5 h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-700">{booking.amount} €</span>
          </div>
        )}
        
        {booking.message && (
          <div className="bg-muted/30 rounded-md p-3 border-l-2 border-l-muted">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {booking.message}
            </p>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-primary hover:text-primary-foreground transition-colors" 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Zobraziť konverzáciu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
