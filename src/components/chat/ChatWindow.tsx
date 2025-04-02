import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Info, 
  Phone, 
  Video, 
  MoreVertical, 
  Archive, 
  Trash2,
  Mail,
  MapPin,
  Star,
  User,
  CalendarCheck,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";
import { BookingRequest } from "@/types/booking";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatWindowProps {
  contact: ChatContact | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  contactDetails?: any;
  customerReviews?: any[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contact, 
  messages, 
  onSendMessage,
  onArchive,
  onDelete,
  contactDetails,
  customerReviews = []
}) => {
  const { user, userType } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [showBookingsDialog, setShowBookingsDialog] = useState(false);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (contact?.conversation_id && user) {
      fetchBookingRequests();
    }
  }, [contact, user]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const fetchBookingRequests = async () => {
    if (!contact?.id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('conversation_id', contact.conversation_id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching booking requests:", error);
        return;
      }
      
      if (data) {
        setBookingRequests(data as BookingRequest[]);
      }
    } catch (err) {
      console.error("Error in fetchBookingRequests:", err);
    }
  };
  
  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      onSendMessage(messageText);
      setMessageText("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const handleArchive = () => {
    onArchive();
    setShowArchiveDialog(false);
  };
  
  // Handle booking confirmation or rejection
  const handleBookingResponse = async (bookingId: string, isConfirmed: boolean) => {
    if (!user) return;
    
    try {
      // Update booking status
      const status = isConfirmed ? 'confirmed' : 'declined';
      
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', bookingId);
        
      if (updateError) {
        console.error("Error updating booking status:", updateError);
        toast.error(`Nastala chyba pri ${isConfirmed ? 'potvrdení' : 'zamietnutí'} rezervácie`);
        return;
      }
      
      // Find the booking to get details for the message
      const booking = bookingRequests.find(b => b.id === bookingId);
      
      if (booking && contact?.conversation_id) {
        // Send message about the confirmation/rejection
        const statusMessage = isConfirmed 
          ? `Rezervácia potvrdená: ${format(new Date(booking.date), 'EEEE, d. MMMM yyyy', { locale: sk })}, ${booking.start_time} - ${booking.end_time}`
          : `Rezervácia zamietnutá: ${format(new Date(booking.date), 'EEEE, d. MMMM yyyy', { locale: sk })}, ${booking.start_time} - ${booking.end_time}`;
        
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: contact.conversation_id,
            sender_id: user.id,
            receiver_id: contact.id,
            content: statusMessage,
            read: false
          });
          
        if (messageError) {
          console.error("Error sending booking response message:", messageError);
        }
      }
      
      // Refresh booking requests
      fetchBookingRequests();
      
      toast.success(isConfirmed ? "Rezervácia bola potvrdená" : "Rezervácia bola zamietnutá");
      
    } catch (err) {
      console.error("Error in handleBookingResponse:", err);
      toast.error("Nastala chyba pri spracovaní rezervácie");
    }
  };
  
  // Helper function to get display name with fallback
  const getContactName = () => {
    if (contactDetails?.name) return contactDetails.name;
    if (contact?.name) return contact.name;
    return "Neznámy užívateľ";
  };
  
  // Helper function to get avatar URL with fallback
  const getAvatarUrl = () => {
    return contactDetails?.profile_image_url || contact?.avatar_url || null;
  };
  
  // Helper function to get profile status
  const getProfileStatus = () => {
    if (contactDetails && (contactDetails.email || contactDetails.phone)) {
      return "Profil nájdený";
    }
    return "Základný profil";
  };
  
  // Helper function to get profile badge color
  const getProfileBadgeColor = () => {
    if (contactDetails && (contactDetails.email || contactDetails.phone)) {
      return "bg-green-50";
    }
    return "bg-yellow-50";
  };
  
  // Helper function to render a booking message
  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender_id === user?.id;
    const messageDate = new Date(message.created_at);
    const formattedTime = format(messageDate, 'HH:mm');
    const formattedDate = format(messageDate, 'EEEE, d. MMMM', { locale: sk });
    
    // Check if this is a booking request/confirmation/rejection message
    const isBookingRequest = message.content.includes('Žiadosť o rezerváciu:');
    const isBookingConfirmed = message.content.includes('Rezervácia potvrdená:');
    const isBookingRejected = message.content.includes('Rezervácia zamietnutá:');
    
    // If this is a booking-related message, render it with special styles
    if (isBookingRequest || isBookingConfirmed || isBookingRejected) {
      let icon = <CalendarCheck className="h-5 w-5" />;
      let bgColor = "bg-blue-50 text-blue-800";
      let iconColor = "text-blue-500";
      
      if (isBookingConfirmed) {
        icon = <Check className="h-5 w-5" />;
        bgColor = "bg-green-50 text-green-800";
        iconColor = "text-green-500";
      } else if (isBookingRejected) {
        icon = <X className="h-5 w-5" />;
        bgColor = "bg-red-50 text-red-800";
        iconColor = "text-red-500";
      }
      
      return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] ${bgColor} rounded-lg px-4 py-3 shadow-sm`}>
            <div className="flex items-start">
              <div className={`mr-2 ${iconColor}`}>{icon}</div>
              <div>
                <p className="font-medium text-sm">{message.content}</p>
                <div className="text-xs mt-2 text-right opacity-70">
                  {formattedTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Regular message rendering
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[75%] ${isOwnMessage ? 'bg-primary text-white' : 'bg-white'} rounded-lg px-4 py-2 shadow-sm`}>
          <p>{message.content}</p>
          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'} text-right`}>
            {formattedTime}
          </div>
        </div>
      </div>
    );
  };
  
  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center text-gray-500">
          <p>Vyberte konverzáciu zo zoznamu</p>
        </div>
      </div>
    );
  }
  
  // Count pending booking requests for this conversation
  const pendingBookings = bookingRequests.filter(b => b.status === 'pending').length;
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={getAvatarUrl()} alt={getContactName()} />
            <AvatarFallback>{getContactName().substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{getContactName()}</h2>
            <p className="text-xs text-gray-500">
              {contact.user_type === 'craftsman' ? 'Remeselník' : 'Zákazník'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {pendingBookings > 0 && userType === 'craftsman' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => setShowBookingsDialog(true)}
            >
              <CalendarCheck className="h-4 w-4 text-primary" />
              <span>Rezervácie ({pendingBookings})</span>
            </Button>
          )}
          
          <Dialog open={showBookingsDialog} onOpenChange={setShowBookingsDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rezervácie</DialogTitle>
                <DialogDescription>
                  Spravovať rezervácie od zákazníka {getContactName()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
                {bookingRequests.length > 0 ? (
                  bookingRequests.map((booking) => (
                    <Card key={booking.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {format(new Date(booking.date), 'EEEE, d. MMMM yyyy', { locale: sk })}
                          </h4>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'declined' ? 'destructive' :
                            'outline'
                          }>
                            {booking.status === 'confirmed' ? 'Potvrdené' :
                             booking.status === 'declined' ? 'Zamietnuté' :
                             'Čaká na potvrdenie'}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">Čas: {booking.start_time} - {booking.end_time}</p>
                        {booking.message && (
                          <p className="text-sm italic mb-3 text-gray-600">"{booking.message}"</p>
                        )}
                        
                        {booking.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => handleBookingResponse(booking.id, true)}
                              className="w-full"
                            >
                              <Check className="mr-1 h-4 w-4" /> Potvrdiť
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleBookingResponse(booking.id, false)}
                              className="w-full"
                            >
                              <X className="mr-1 h-4 w-4" /> Zamietnuť
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>Žiadne rezervácie</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="icon" title="Videohovor">
            <Video className="h-5 w-5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" title="Telefonický hovor">
            <Phone className="h-5 w-5 text-gray-500" />
          </Button>
          <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Informácie o užívateľovi">
                <Info className="h-5 w-5 text-gray-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Profil užívateľa</DialogTitle>
                <DialogDescription>
                  Informácie o užívateľovi {getContactName()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={contactDetails?.profile_image_url || contact.avatar_url} alt={getContactName()} />
                    <AvatarFallback>{getContactName().substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{getContactName()}</h3>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mt-1">
                        {contact.user_type === 'craftsman' ? 'Remeselník' : 'Zákazník'}
                      </Badge>
                      <Badge variant="outline" className={`ml-2 mt-1 ${getProfileBadgeColor()}`}>
                        {getProfileStatus()}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {contactDetails ? (
                  <div className="space-y-2">
                    {contactDetails.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{contactDetails.email}</span>
                      </div>
                    )}
                    
                    {contactDetails.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{contactDetails.phone}</span>
                      </div>
                    )}
                    
                    {contactDetails.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{contactDetails.location}</span>
                      </div>
                    )}
                    
                    {contact.user_type === 'craftsman' && contactDetails.trade_category && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Kategória: </span>
                        <span>{contactDetails.trade_category}</span>
                      </div>
                    )}
                    
                    {contact.user_type === 'craftsman' && contactDetails.years_experience && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Roky skúseností: </span>
                        <span>{contactDetails.years_experience}</span>
                      </div>
                    )}
                    
                    {contact.user_type === 'craftsman' && contactDetails.description && (
                      <div className="mt-2">
                        <span className="font-medium">Popis: </span>
                        <p className="mt-1 text-sm">{contactDetails.description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Rozšírený profil užívateľa nie je k dispozícii</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Užívateľ si ešte nevytvoril kompletný profil v systéme
                    </p>
                  </div>
                )}
                
                {contact.user_type === 'customer' && customerReviews && customerReviews.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Hodnotenia od zákazníka</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerReviews.map((review) => (
                          <Card key={review.id} className="p-2">
                            <CardContent className="p-2">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium">Hodnotenie remeselníka</span>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating 
                                          ? "text-yellow-500 fill-current" 
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm mt-1">{review.comment}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(review.created_at).toLocaleDateString("sk-SK")}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                <Archive className="h-4 w-4 mr-2" />
                Archivovať konverzáciu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Zmazať konverzáciu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Začnite konverzáciu odoslaním správy</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {renderMessage(message)}
              </div>
            ))
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Napíšte správu..."
            className="resize-none min-h-[60px]"
            rows={2}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim()} 
            className="self-end"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zmazať konverzáciu</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete zmazať túto konverzáciu? Táto akcia sa nedá vrátiť späť.
              Konverzácia bude zmazaná iba pre vás, pre druhú stranu bude stále viditeľná.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Zmazať
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivovať konverzáciu</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete archivovať túto konverzáciu? 
              Archivovaná konverzácia bude presunutá do archívu a nebude sa zobrazovať v hlavnom zozname.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archivovať
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatWindow;
