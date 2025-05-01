
import React, { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { ChatContact } from "@/types/chat";

interface ChatListProps {
  contacts: ChatContact[];
  selectedContactId: string | undefined;
  onSelectContact: (contact: ChatContact) => void;
  loading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ contacts, selectedContactId, onSelectContact, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [forceRender, setForceRender] = useState<number>(0);
  
  // Force re-render periodically to ensure UI is updated
  useEffect(() => {
    const intervalId = setInterval(() => {
      setForceRender(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Use useMemo for filtered contacts to prevent unnecessary re-renders
  const filteredContacts = useMemo(() => {
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log("Filtered contacts in ChatList:", filtered.map(c => 
      `${c.name} (${c.id}): ${c.unread_count || 0} unread, selected: ${c.id === selectedContactId}`));
    
    return filtered;
  }, [contacts, searchTerm, selectedContactId, forceRender]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Konverzácie</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Vyhľadať kontakt..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <p>Žiadne výsledky pre "{searchTerm}"</p>
            ) : (
              <p>Žiadne konverzácie</p>
            )}
          </div>
        ) : (
          <ul>
            {filteredContacts.map((contact) => {
              const isSelected = contact.id === selectedContactId;
              const timeAgo = contact.last_message_time 
                ? formatDistanceToNow(new Date(contact.last_message_time), { addSuffix: true, locale: sk }) 
                : '';
              
              // CRITICAL FIX: More robust unread badge display logic
              const unreadCount = Number(contact.unread_count); 
              const hasUnread = !isNaN(unreadCount) && unreadCount > 0;
              
              // IMPORTANT: Only show badge if contact is NOT selected AND has positive unread count
              const showBadge = !isSelected && hasUnread;
              
              // Log detailed information for debugging
              console.log(
                `Contact ${contact.name} (${contact.id}): ` +
                `Raw unread count: ${contact.unread_count}, ` + 
                `Parsed unread count: ${unreadCount}, ` +
                `Has unread: ${hasUnread}, ` +
                `Selected: ${isSelected}, ` +
                `Show badge: ${showBadge}, ` +
                `Selection match: ${contact.id === selectedContactId}`
              );
                
              return (
                <li 
                  key={contact.id}
                  className={`
                    py-3 px-4 border-b cursor-pointer hover:bg-gray-50 transition-colors
                    ${isSelected ? 'bg-gray-50' : ''}
                  `}
                  onClick={() => onSelectContact(contact)}
                  data-selected={isSelected ? "true" : "false"}
                  data-unread-count={unreadCount}
                  data-show-badge={showBadge ? "true" : "false"}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar_url} alt={contact.name} />
                      <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{contact.name}</p>
                        <span className="text-xs text-gray-500">{timeAgo}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-500 truncate pr-2">
                          {contact.last_message}
                        </p>
                        {showBadge && (
                          <Badge 
                            variant="default" 
                            className="rounded-full px-2 py-0.5 text-xs"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
