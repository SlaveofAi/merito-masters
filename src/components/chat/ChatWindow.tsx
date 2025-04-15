
import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "@/types/chat";
import { 
  User, 
  Phone, 
  Mail, 
  Star, 
  CalendarDays, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ChatWindowProps = {
  contact: ChatContact | null;
  messages: Message[];
  onSendMessage: (content: string, metadata?: any) => void;
  onArchive: () => void;
  onDelete: () => void;
  contactDetails: any;
  customerReviews: any[];
  onAcceptBooking?: (bookingId: string) => void;
  onRejectBooking?: (bookingId: string) => void;
  onCompleteBooking?: (bookingId: string) => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  onSendMessage,
  onArchive,
  onDelete,
  contactDetails,
  customerReviews,
  onAcceptBooking,
  onRejectBooking,
  onCompleteBooking
}) => {
  const { user, userType } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const navigate = useNavigate();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const showBookingDetails = (metadata: any) => {
    const details = metadata.details || {};
    const bookingId = metadata.booking_id;
    const status = metadata.status || 'pending';
    
    const isCraftsman = userType?.toLowerCase() === 'craftsman';
    const canAcceptOrReject = isCraftsman && status === 'pending' && onAcceptBooking && onRejectBooking;
    const canComplete = isCraftsman && status === 'accepted' && onCompleteBooking;
    
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 my-2">
        <div className="font-medium text-blue-900 mb-3">Požiadavka na rezerváciu</div>
        
        {/* Status badge */}
        <div className="mb-2">
          <span className="text-sm font-medium mr-2">Stav:</span>
          {status === 'pending' && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Čaká na schválenie
            </Badge>
          )}
          {status === 'accepted' && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Akceptovaná
            </Badge>
          )}
          {status === 'rejected' && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              Zamietnutá
            </Badge>
          )}
          {status === 'completed' && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              Dokončená
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {details.date && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Dátum: {details.date}</span>
            </div>
          )}
          
          {details.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Čas: {details.time}</span>
            </div>
          )}
          
          {details.amount && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Suma: {details.amount} €</span>
            </div>
          )}
        </div>
        
        {details.message && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Správa:</span>
            </div>
            <p className="text-sm pl-6 text-gray-700">{details.message}</p>
          </div>
        )}
        
        {details.image_url && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Obrázok:</span>
            </div>
            <div className="pl-6">
              <img 
                src={details.image_url} 
                alt="Booking image" 
                className="max-h-40 rounded-md border border-gray-200"
              />
            </div>
          </div>
        )}
        
        {/* Action buttons for craftsman */}
        {canAcceptOrReject && (
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => onAcceptBooking(bookingId)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Prijať
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-500 border-red-300 hover:bg-red-50"
              onClick={() => onRejectBooking(bookingId)}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Odmietnuť
            </Button>
          </div>
        )}
        
        {/* Complete button for accepted bookings */}
        {canComplete && (
          <div className="mt-3">
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => onCompleteBooking(bookingId)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Označiť ako dokončené
            </Button>
          </div>
        )}
        
        {/* Button to view in Orders section for accepted bookings */}
        {(status === 'accepted' || status === 'completed') && (
          <div className="mt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/orders')}
            >
              Zobraziť v Zákazkách
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  if (!contact) {
    return <div className="p-4">Vyberte kontakt pre zobrazenie konverzácie.</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={contactDetails?.profile_image_url} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{contact.name}</div>
            <div className="text-sm text-gray-500">
              {contactDetails?.location || "Neznáma lokácia"}
            </div>
          </div>
        </div>
        
        {/* Contact Info Button */}
        <Button variant="ghost" size="icon" onClick={() => setShowContactInfo(!showContactInfo)}>
          <User className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onArchive}>
            Archivovať
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Zmazať
          </Button>
        </div>
      </div>
      
      {/* Contact Info */}
      {showContactInfo && (
        <div className="p-4 border-b">
          <div className="font-semibold mb-2">Informácie o kontakte</div>
          <Separator className="mb-2" />
          
          {contactDetails?.phone && (
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>{contactDetails.phone}</div>
            </div>
          )}
          
          {contactDetails?.email && (
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>{contactDetails.email}</div>
            </div>
          )}
          
          {contactDetails?.location && (
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <div>{contactDetails.location}</div>
            </div>
          )}
          
          {/* Customer Reviews */}
          {customerReviews && customerReviews.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="font-semibold mb-2">Hodnotenia zákazníkov</div>
              {customerReviews.map((review) => (
                <div key={review.id} className="mb-3 p-3 rounded-md bg-gray-50">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{review.rating}</span>
                    <span className="text-gray-500">- {review.customer_name}</span>
                  </div>
                  {review.comment && <p className="text-sm mt-1">{review.comment}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex flex-col ${message.sender_id === user?.id ? "items-end" : "items-start"}`}
          >
            <div
              className={`rounded-xl px-3 py-2 text-sm ${message.sender_id === user?.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
                }`}
            >
              {message.metadata?.type === 'booking_request' ? (
                showBookingDetails(message.metadata)
              ) : (
                message.content
              )}
              <div className="text-xs mt-1">
                {format(new Date(message.created_at), "HH:mm")}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Napíšte správu..."
            className="w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
          />
          <Button type="submit" className="absolute right-2 bottom-2">
            Odoslať
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
