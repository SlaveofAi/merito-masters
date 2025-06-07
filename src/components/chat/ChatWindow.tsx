
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, X, Image as ImageIcon, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { ChatContact, Message } from "@/types/chat";
import { toast } from "sonner";
import AdminAnnouncementMessage from "./AdminAnnouncementMessage";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import BookingRequestForm from "@/components/booking/BookingRequestForm";
import ImageModal from "@/components/ImageModal";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Euro } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { uploadChatImage } from "@/utils/chatImageUpload";

interface ChatWindowProps {
  contact: ChatContact | null;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onBack }) => {
  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isContactAdmin, setIsContactAdmin] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current user from localStorage
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const currentUserId = currentUser?.id || '';

  // Check if current user is admin
  const { isAdmin } = useAdminAuth();

  // Check if contact is admin
  useEffect(() => {
    const checkContactAdminStatus = async () => {
      if (!contact?.id && !contact?.contactId) {
        setIsContactAdmin(false);
        return;
      }

      const contactId = contact.contactId || contact.id;
      
      try {
        const { data, error } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('user_id', contactId)
          .eq('user_type', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking contact admin status:', error);
          setIsContactAdmin(false);
        } else {
          setIsContactAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking contact admin status:', error);
        setIsContactAdmin(false);
      }
    };

    checkContactAdminStatus();
  }, [contact]);

  const { data: messages = [], isLoading, error, refetch } = useChatMessages(contact, currentUser, () => {});
  
  // Fix the useChatActions hook call with proper arguments
  const { sendMessage } = useChatActions(contact, () => {}, refetch);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length !== files.length) {
        toast.error("Iba obrázky sú povolené");
      }
      
      setSelectedImages(prev => [...prev, ...imageFiles]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    // If contact is admin and current user is not admin, prevent sending
    if (isContactAdmin && !isAdmin) {
      toast.error("Only admins can write in this chat.");
      return;
    }

    const hasText = input.trim() !== "";
    const hasImages = selectedImages.length > 0;

    if (!hasText && !hasImages) {
      return;
    }

    setIsUploading(true);

    try {
      if (hasImages) {
        // Upload images first
        for (const imageFile of selectedImages) {
          const imageUrl = await uploadChatImage(imageFile, currentUserId);
          if (imageUrl) {
            // Send image as a message
            await sendMessage(`📷 Obrázok`, {
              type: 'image',
              image_url: imageUrl
            });
          }
        }
        setSelectedImages([]);
      }

      if (hasText) {
        await sendMessage(input);
        setInput("");
      }

      // Refetch messages after sending
      setTimeout(() => refetch(), 500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Nastala chyba pri odosielaní správy");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleBookingRequestSubmit = async (content: string, metadata: any) => {
    try {
      await sendMessage(content, metadata);
      setShowBookingForm(false);
      toast.success("Žiadosť o rezerváciu bola odoslaná!");
      setTimeout(() => refetch(), 500);
    } catch (error) {
      console.error("Error sending booking request:", error);
      toast.error("Nastala chyba pri odosielaní žiadosti o rezerváciu");
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
    const isBookingMessage = message.metadata?.type === 'booking_request';
    const isImageMessage = message.metadata?.type === 'image';

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        } rounded-2xl shadow-sm border overflow-hidden`}>
          
          {isBookingMessage && message.metadata?.details && (
            <div className="p-4 border-b bg-card rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-semibold text-foreground">Žiadosť o rezerváciu</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Čaká na odpoveď
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(message.metadata.details.date || '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {message.metadata.details.time}
                      {message.metadata.details.end_time && ` - ${message.metadata.details.end_time}`}
                    </span>
                  </div>
                </div>
                
                {message.metadata.details.amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <Euro className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">
                      {message.metadata.details.amount} €
                    </span>
                  </div>
                )}
                
                {message.metadata.details.image_url && (
                  <div className="relative">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>Priložený obrázok</span>
                    </div>
                    <div className="relative group">
                      <img 
                        src={message.metadata.details.image_url} 
                        alt="Booking image" 
                        className="w-full max-w-[200px] h-auto rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity border"
                        style={{ maxHeight: '120px' }}
                        onClick={() => setSelectedImage(message.metadata.details.image_url)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-2">
                            <ImageIcon className="h-4 w-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isImageMessage && message.metadata?.image_url ? (
            <div className="p-0">
              <img 
                src={message.metadata.image_url} 
                alt="Shared image" 
                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(message.metadata.image_url)}
              />
              {message.content && message.content !== '📷 Obrázok' && (
                <div className="p-4">
                  <p className="break-words leading-relaxed text-sm">
                    {message.content}
                  </p>
                </div>
              )}
            </div>
          ) : !isBookingMessage && (
            <div className="p-4">
              <p className="break-words leading-relaxed">
                {message.content}
              </p>
            </div>
          )}
          
          <div className="px-4 pb-2">
            <p className="text-xs opacity-70">
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <p>Vyberte konverzáciu na začatie chatu</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p>Načítavam správy...</p>
        </div>
      </div>
    );
  }

  // Determine if we should show booking options and user type
  // Hide them if current user is admin OR if contact is admin
  const shouldHideBookingAndUserType = isAdmin || isContactAdmin;

  // Show booking form if requested
  if (showBookingForm && !shouldHideBookingAndUserType) {
    const contactId = contact.contactId || contact.id;
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setShowBookingForm(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={contact.avatar_url} alt={contact.name} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="text-sm text-gray-500">Žiadosť o rezerváciu</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="flex-1 overflow-y-auto p-4">
          <BookingRequestForm
            onSubmit={handleBookingRequestSubmit}
            onCancel={() => setShowBookingForm(false)}
            craftsmanId={contactId}
          />
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
            {!shouldHideBookingAndUserType && (
              <p className="text-sm text-gray-500 capitalize">{contact.user_type}</p>
            )}
            {isContactAdmin && (
              <p className="text-sm text-blue-600 font-medium">Admin</p>
            )}
          </div>
        </div>

        {/* Only show Create Booking button if neither user is admin and contact is craftsman */}
        {!shouldHideBookingAndUserType && contact.user_type === 'craftsman' && (
          <div>
            <Button variant="outline" size="sm" onClick={() => setShowBookingForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Vytvoriť rezerváciu
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {isContactAdmin && !isAdmin ? (
          <div className="text-center text-gray-500 py-4">
            <p>Iba administrátori môžu písať v tomto chate.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selected ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeSelectedImage(index)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input Row */}
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Napíšte svoju správu..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isUploading}
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={isUploading || (!input.trim() && selectedImages.length === 0)}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          alt="Shared image"
        />
      )}
    </div>
  );
};

export default ChatWindow;
