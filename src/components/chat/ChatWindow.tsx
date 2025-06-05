
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { ChatContact, Message } from "@/types/chat";
import { toast } from "sonner";
import AdminAnnouncementMessage from "./AdminAnnouncementMessage";

interface ChatWindowProps {
  contact: ChatContact | null;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onBack }) => {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current user from localStorage
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const currentUserId = currentUser?.id || '';

  const { data: messages = [], isLoading, error, refetch } = useChatMessages(contact, currentUser, () => {});
  
  // Fix the useChatActions hook call with proper arguments
  const { sendMessage } = useChatActions(contact, () => {}, refetch);
  
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    message: '',
    amount: ''
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() !== "") {
      await sendMessage(input);
      setInput("");
      // Refetch messages after sending
      setTimeout(() => refetch(), 500);
    } else if (attachment) {
      // Handle attachment sending (implementation needed)
      toast.info("Sending attachments is not yet implemented.");
      setAttachment(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleBookingRequest = async () => {
    if (!bookingDetails.date || !bookingDetails.time) {
      toast.error("Please provide both date and time for the booking.");
      return;
    }

    try {
      const bookingMessage = `Booking Request:\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}${bookingDetails.amount ? `\nAmount: ${bookingDetails.amount}` : ''}${bookingDetails.message ? `\nMessage: ${bookingDetails.message}` : ''}`;
      
      await sendMessage(bookingMessage);
      toast.success("Booking request sent!");
      setShowBookingOptions(false);
      setBookingDetails({ date: '', time: '', message: '', amount: '' });
      setTimeout(() => refetch(), 500);
    } catch (err) {
      console.error("Error creating booking request:", err);
      toast.error("Failed to send booking request.");
    }
  };

  const renderMessage = (message: Message) => {
    // Check if this is an admin announcement
    if (message.metadata?.type === 'admin_announcement') {
      return (
        <div key={message.id} className="mb-4">
          <AdminAnnouncementMessage 
            message={message}
            onCTAClick={(url) => {
              // Track click if needed
              console.log('Admin announcement CTA clicked:', url);
            }}
          />
        </div>
      );
    }

    const isOwnMessage = message.sender_id === currentUserId;
    const isBookingMessage = message.metadata?.type === 'booking';

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          {isBookingMessage && message.metadata?.details && (
            <div className="mb-2 p-2 border rounded bg-white/10">
              <p className="text-xs font-semibold">Booking Request</p>
              <p className="text-xs">Date: {message.metadata.details.date}</p>
              <p className="text-xs">Time: {message.metadata.details.time}</p>
              {message.metadata.details.amount && (
                <p className="text-xs">Amount: {message.metadata.details.amount}</p>
              )}
            </div>
          )}
          <p className="break-words">{message.content}</p>
          <p className="text-xs mt-1 opacity-70">
            {new Date(message.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (!contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={contact.avatar_url} alt={contact.name} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{contact.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{contact.user_type}</p>
          </div>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={() => setShowBookingOptions(!showBookingOptions)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Booking
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Booking Options */}
      {showBookingOptions && (
        <div className="p-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Enter Booking Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              type="date"
              placeholder="Date"
              value={bookingDetails.date}
              onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
            />
            <Input
              type="time"
              placeholder="Time"
              value={bookingDetails.time}
              onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Amount (optional)"
              value={bookingDetails.amount}
              onChange={(e) => setBookingDetails({ ...bookingDetails, amount: e.target.value })}
            />
          </div>
          <Input
            type="text"
            placeholder="Additional Message"
            value={bookingDetails.message}
            onChange={(e) => setBookingDetails({ ...bookingDetails, message: e.target.value })}
            className="mb-4"
          />
          <Button onClick={handleBookingRequest} className="w-full">
            Send Booking Request
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <input
            type="file"
            id="attachment"
            className="hidden"
            onChange={handleAttachmentChange}
          />
          <label htmlFor="attachment">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </label>
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
