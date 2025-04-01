
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
  Trash2 
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact, Message } from "./Chat";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatWindowProps {
  contact: ChatContact | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onArchive: () => void;
  onDelete: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contact, 
  messages, 
  onSendMessage,
  onArchive,
  onDelete
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  
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
            <AvatarImage src={contact.avatar_url} alt={contact.name} />
            <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{contact.name}</h2>
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
          <Button variant="ghost" size="icon" title="Informácie">
            <Info className="h-5 w-5 text-gray-500" />
          </Button>

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
              const isOwnMessage = message.sender_id === user?.id;
              const messageDate = new Date(message.created_at);
              const formattedTime = format(messageDate, 'HH:mm');
              const formattedDate = format(messageDate, 'EEEE, d. MMMM', { locale: sk });
              
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
