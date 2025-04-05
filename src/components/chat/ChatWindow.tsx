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
  Check,
  X,
  Calendar,
  Clock,
  Euro,
  Image
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";
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
  const [processedBookings, setProcessedBookings] = useState<string[]>([]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
  
  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    if (!user) {
      toast.error("Pre túto akciu musíte byť prihlásený");
      return;
    }
    
    if (processedBookings.includes(bookingId)) {
      toast.info("Táto požiadavka už bola spracovaná");
      return;
    }
    
    try {
      // Update the booking status
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', bookingId);
        
      if (error) throw error;

      // Get the booking details to create a response message
      const { data: booking, error: fetchError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('id', bookingId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Create a response message
      const responseMessage = action === 'accept' 
        ? `✅ **Požiadavka termínu akceptovaná**\nDátum: ${booking.date}\nČas: ${booking.start_time}`
        : `❌ **Požiadavka termínu zamietnutá**\nDátum: ${booking.date}\nČas: ${booking.start_time}`;
        
      // Send the message to chat
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: booking.conversation_id,
          sender_id: user.id,
          receiver_id: booking.customer_id,
          content: responseMessage
        });
        
      if (messageError) throw messageError;

      // Add to processed bookings
      setProcessedBookings(prev => [...prev, bookingId]);
      
      toast.success(action === 'accept' 
        ? "Požiadavka bola úspešne akceptovaná" 
        : "Požiadavka bola zamietnutá"
      );
      
      // Refresh the messages
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error("Error handling booking action:", error);
      toast.error("Nastala chyba pri spracovaní požiadavky");
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
  
  // Helper function to check if a message is a booking request
  const isBookingRequest = (content: string) => {
    return content.includes('🗓️ **Požiadavka na termín**');
  };

  // Helper function to check if a message is a booking response
  const isBookingResponse = (content: string) => {
    return content.includes('✅ **Požiadavka termínu akceptovaná**') || 
           content.includes('❌ **Požiadavka termínu zamietnutá**');
  };

  // Helper function to extract booking ID from a booking request message
  const extractBookingDetails = (content: string) => {
    const lines = content.split('\n');
    const dateMatch = lines.length > 1 ? lines[1].match(/Dátum: (.+)/) : null;
    const timeMatch = lines.length > 2 ? lines[2].match(/Čas: (.+)/) : null;
    const messageMatch = content.match(/Správa: (.+)/);
    const amountMatch = content.match(/Suma: (.+)€/);
    const photoMatch = content.match(/Fotky: (.+)/);
    
    return {
      date: dateMatch ? dateMatch[1] : null,
      time: timeMatch ? timeMatch[1] : null,
      message: messageMatch ? messageMatch[1] : null,
      amount: amountMatch ? amountMatch[1] : null,
      photos: photoMatch ? photoMatch[1] : null,
      status: lines[0].includes('akceptovaná') ? 'accepted' : lines[0].includes('zamietnutá') ? 'rejected' : 'pending'
    };
  };
  
  // Get booking ID for a particular booking request
  const getBookingId = async (message: Message) => {
    try {
      const bookingDetails = extractBookingDetails(message.content);
      if (!bookingDetails.date) return null;
      
      const { data, error } = await supabase
        .from('booking_requests')
        .select('id')
        .eq('conversation_id', message.conversation_id)
        .eq('date', bookingDetails.date)
        .maybeSingle();
        
      if (error || !data) {
        console.error("Error fetching booking ID:", error);
        return null;
      }
      
      return data.id;
    } catch (err) {
      console.error("Error in getBookingId:", err);
      return null;
    }
  };
  
  // Format date to be consistent (DD.MM.YYYY format)
  const formatDateString = (dateStr: string | null) => {
    if (!dateStr) return "";
    
    try {
      // Check if it's already in the format DD.MM.YYYY
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Parse date to get consistent format
      const date = new Date(dateStr);
      return date.toLocaleDateString('sk-SK'); // Format as DD.MM.YYYY
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr; // Return the original string if there's an error
    }
  };
  
  // Render a booking request message
  const renderBookingRequest = (message: Message) => {
    const bookingDetails = extractBookingDetails(message.content);
    const isOwnMessage = message.sender_id === user?.id;
    const isAccepted = bookingDetails.status === 'accepted';
    const isRejected = bookingDetails.status === 'rejected';
    const isPending = bookingDetails.status === 'pending';
    const formattedDate = formatDateString(bookingDetails.date);
    
    // Check if this booking ID has been processed
    const isProcessed = async () => {
      const bookingId = await getBookingId(message);
      return bookingId ? processedBookings.includes(bookingId) : false;
    };
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`} key={message.id}>
        <div className={`max-w-[85%] bg-white border rounded-lg shadow-sm overflow-hidden`}>
          <div className="bg-gray-50 p-3 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-primary mr-2" />
                <h4 className="font-medium text-sm">Požiadavka na termín</h4>
              </div>
              {(isAccepted || isRejected) && (
                <Badge variant={isAccepted ? "outline" : "destructive"} className={isAccepted ? "bg-green-50" : ""}>
                  {isAccepted ? "Akceptované" : "Zamietnuté"}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex space-x-2 items-center">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            
            {bookingDetails.time && (
              <div className="flex space-x-2 items-center">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{bookingDetails.time}</span>
              </div>
            )}
            
            {bookingDetails.amount && (
              <div className="flex space-x-2 items-center">
                <Euro className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{bookingDetails.amount}€</span>
              </div>
            )}
            
            {bookingDetails.photos && (
              <div className="flex space-x-2 items-center">
                <Image className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{bookingDetails.photos}</span>
              </div>
            )}
            
            {bookingDetails.message && (
              <div className="mt-2 border-t pt-2">
                <p className="text-sm">{bookingDetails.message}</p>
              </div>
            )}
          </div>
          
          {isPending && userType === 'craftsman' && !isOwnMessage && (
            <div className="p-3 bg-gray-50 border-t flex justify-end space-x-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={async () => {
                  const bookingId = await getBookingId(message);
                  if (bookingId) handleBookingAction(bookingId, 'reject');
                }}
                disabled={processedBookings.includes(message.id)}
              >
                <X className="h-4 w-4 mr-1" /> Zamietnuť
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={async () => {
                  const bookingId = await getBookingId(message);
                  if (bookingId) handleBookingAction(bookingId, 'accept');
                }}
                disabled={processedBookings.includes(message.id)}
              >
                <Check className="h-4 w-4 mr-1" /> Akceptovať
              </Button>
            </div>
          )}
          
          <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 text-right">
            {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm')}
          </div>
        </div>
      </div>
    );
  };
  
  // Render a booking response message
  const renderBookingResponse = (message: Message) => {
    const bookingDetails = extractBookingDetails(message.content);
    const isOwnMessage = message.sender_id === user?.id;
    const isAccepted = bookingDetails.status === 'accepted';
    const formattedDate = formatDateString(bookingDetails.date);
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`} key={message.id}>
        <div className={`max-w-[85%] ${isAccepted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg shadow-sm overflow-hidden`}>
          <div className={`${isAccepted ? 'bg-green-100' : 'bg-red-100'} p-3 border-b`}>
            <div className="flex items-center">
              {isAccepted ? (
                <Check className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <X className="h-4 w-4 text-red-600 mr-2" />
              )}
              <h4 className="font-medium text-sm">
                {isAccepted ? "Požiadavka akceptovaná" : "Požiadavka zamietnutá"}
              </h4>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex space-x-2 items-center">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            
            {bookingDetails.time && (
              <div className="flex space-x-2 items-center">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{bookingDetails.time}</span>
              </div>
            )}
          </div>
          
          <div className="p-2 bg-white/50 border-t text-xs text-gray-500 text-right">
            {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm')}
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
            messages.map((message) => {
              // Check if this is a booking request message
              if (isBookingRequest(message.content)) {
                return renderBookingRequest(message);
              } 
              
              // Check if this is a booking response message
              if (isBookingResponse(message.content)) {
                return renderBookingResponse(message);
              }
              
              // Regular message
              const isOwnMessage = message.sender_id === user?.id;
              const messageDate = new Date(message.created_at);
              const formattedTime = format(messageDate, 'HH:mm');
              
              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isOwnMessage ? 'bg-primary text-white' : 'bg-white'} rounded-lg px-4 py-2 shadow-sm`}>
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'} text-right`}>
                      {formattedTime}
                    </div>
                  </div>
                </div>
              );
            })
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
