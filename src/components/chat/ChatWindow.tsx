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
  Image,
  FileText
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
import BookingRequestForm from "@/components/booking/BookingRequestForm";

interface ChatWindowProps {
  contact: ChatContact | null;
  messages: Message[];
  onSendMessage: (content: string, metadata?: any) => void;
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
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, showBookingForm]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      onSendMessage(messageText);
      setMessageText("");
    }
  };

  const handleSendBookingRequest = (content: string, metadata: any) => {
    onSendMessage(content, metadata);
    setShowBookingForm(false);
    toast.success("Požiadavka na rezerváciu odoslaná");
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
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', bookingId);
        
      if (error) throw error;

      const { data: booking, error: fetchError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('id', bookingId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const responseMessage = action === 'accept' 
        ? `✅ **Požiadavka termínu akceptovaná**\nDátum: ${booking.date}\nČas: ${booking.start_time}`
        : `❌ **Požiadavka termínu zamietnutá**\nDátum: ${booking.date}\nČas: ${booking.start_time}`;
        
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: booking.conversation_id,
          sender_id: user.id,
          receiver_id: booking.customer_id,
          content: responseMessage,
          metadata: {
            type: 'booking_response',
            status: action === 'accept' ? 'accepted' : 'rejected',
            details: {
              date: booking.date,
              time: booking.start_time
            }
          }
        });
        
      if (messageError) throw messageError;

      setProcessedBookings(prev => [...prev, bookingId]);
      
      toast.success(action === 'accept' 
        ? "Požiadavka bola úspešne akceptovaná" 
        : "Požiadavka bola zamietnutá"
      );
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error("Error handling booking action:", error);
      toast.error("Nastala chyba pri spracovaní požiadavky");
    }
  };
  
  const getContactName = () => {
    if (contactDetails?.name) return contactDetails.name;
    if (contact?.name) return contact.name;
    return "Neznámy užívateľ";
  };
  
  const getAvatarUrl = () => {
    return contactDetails?.profile_image_url || contact?.avatar_url || null;
  };
  
  const getProfileStatus = () => {
    if (contactDetails && (contactDetails.email || contactDetails.phone)) {
      return "Profil nájdený";
    }
    return "Základný profil";
  };
  
  const getProfileBadgeColor = () => {
    if (contactDetails && (contactDetails.email || contactDetails.phone)) {
      return "bg-green-50";
    }
    return "bg-yellow-50";
  };
  
  const isBookingRequest = (message: Message) => {
    if (message.metadata && message.metadata.type === 'booking_request') {
      return true;
    }
    
    return message.content.includes('🗓️ **Požiadavka na termín**') || 
           message.content.includes('Požiadavka na termín');
  };

  const isBookingResponse = (message: Message) => {
    if (message.metadata && message.metadata.type === 'booking_response') {
      return true;
    }
    
    return message.content.includes('✅ **Požiadavka termínu akceptovaná**') || 
           message.content.includes('❌ **Požiadavka termínu zamietnutá**');
  };
  
  const extractBookingDetails = (message: Message) => {
    if (message.metadata && message.metadata.details) {
      const details = message.metadata.details;
      return {
        date: details.date || null,
        time: details.time || null,
        message: details.message || null,
        amount: details.amount || null,
        photo: details.image_url || null,
        status: message.metadata.status || 'pending'
      };
    }
    
    const content = message.content;
    const lines = content.split('\n');
    const dateMatch = lines.length > 1 ? lines[1].match(/Dátum: (.+)/) : null;
    const timeMatch = lines.length > 2 ? lines[2].match(/Čas: (.+)/) : null;
    const messageMatch = content.match(/Správa: (.+)/);
    const amountMatch = content.match(/Suma: (.+)€/);
    const photoMatch = content.match(/Fotka: (.+)/);
    
    return {
      date: dateMatch ? dateMatch[1] : null,
      time: timeMatch ? timeMatch[1] : null,
      message: messageMatch ? messageMatch[1] : null,
      amount: amountMatch ? amountMatch[1] : null,
      photo: photoMatch ? photoMatch[1] : null,
      status: lines[0].includes('akceptovaná') ? 'accepted' : lines[0].includes('zamietnutá') ? 'rejected' : 'pending'
    };
  };
  
  const getBookingId = async (message: Message) => {
    try {
      if (message.metadata && message.metadata.booking_id) {
        return message.metadata.booking_id;
      }
      
      const bookingDetails = extractBookingDetails(message);
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
  
  const formatDateString = (dateStr: string | null) => {
    if (!dateStr) return "";
    
    try {
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
        return dateStr;
      }
      
      const date = new Date(dateStr);
      return date.toLocaleDateString('sk-SK');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };
  
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageDialog(true);
  };
  
  const renderBookingRequest = (message: Message) => {
    const bookingDetails = extractBookingDetails(message);
    const isOwnMessage = message.sender_id === user?.id;
    const isAccepted = bookingDetails.status === 'accepted';
    const isRejected = bookingDetails.status === 'rejected';
    const isPending = bookingDetails.status === 'pending';
    const formattedDate = formatDateString(bookingDetails.date);
    
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
            
            {bookingDetails.message && (
              <div className="flex space-x-2 items-start">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-sm">{bookingDetails.message}</span>
              </div>
            )}
            
            {bookingDetails.photo && (
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2 items-center">
                  <Image className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Priložená fotka</span>
                </div>
                <div className="mt-2">
                  <img 
                    src={bookingDetails.photo} 
                    alt="Booking photo" 
                    className="max-h-40 rounded-md cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => handleImageClick(bookingDetails.photo!)}
                  />
                </div>
              </div>
            )}
          </div>
          
          {isPending && userType === 'craftsman' && !isOwnMessage && !processedBookings.includes(message.id) && (
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
          
          {isPending && userType === 'craftsman' && !isOwnMessage && processedBookings.includes(message.id) && (
            <div className="p-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-500 text-center">Táto požiadavka už bola spracovaná</p>
            </div>
          )}
          
          <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 text-right">
            {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm')}
          </div>
        </div>
      </div>
    );
  };
  
  const renderBookingResponse = (message: Message) => {
    const bookingDetails = extractBookingDetails(message);
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
          {userType === 'customer' && contact.user_type === 'craftsman' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={() => setShowBookingForm(true)}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Rezervácia
            </Button>
          )}
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
        {showBookingForm ? (
          <BookingRequestForm 
            onSubmit={handleSendBookingRequest} 
            onCancel={() => setShowBookingForm(false)}
          />
        ) : (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Začnite konverzáciu odoslaním správy</p>
              </div>
            ) : (
              messages.map((message) => {
                console.log("Processing message:", message);
                
                if (isBookingRequest(message)) {
                  console.log("Found booking request message:", message);
                  return renderBookingRequest(message);
                } 
                
                if (isBookingResponse(message)) {
                  console.log("Found booking response message:", message);
                  return renderBookingResponse(message);
                }
                
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
        )}
      </div>
      
      {!showBookingForm && (
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
      )}

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

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Priložená fotka</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Booking photo" 
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatWindow;
