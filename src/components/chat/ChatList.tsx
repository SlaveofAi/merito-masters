
import React, { useState } from "react";
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
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
              
              // Only show badge when there are unread messages AND the contact is not currently selected
              // AND the unread count is greater than 0
              const showBadge = !isSelected && contact.unread_count && contact.unread_count > 0;
                
              return (
                <li 
                  key={contact.id}
                  className={`
                    py-3 px-4 border-b cursor-pointer hover:bg-gray-50 transition-colors
                    ${isSelected ? 'bg-gray-50' : ''}
                  `}
                  onClick={() => onSelectContact(contact)}
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
                        {/* Only render the badge when showBadge is true */}
                        {showBadge && (
                          <Badge 
                            variant="default" 
                            className="rounded-full px-2 py-0.5 text-xs bg-primary text-white"
                          >
                            {contact.unread_count}
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
