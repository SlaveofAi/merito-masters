
// Types for chat functionality
export interface ChatContact {
  id: string;
  contactId?: string;  // For distinguishing between UI id and actual contact id
  name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  user_type: string;
  conversation_id?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  read: boolean;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  type?: string;
  booking_id?: string;
  status?: string;
  details?: {
    date?: string;
    time?: string;
    message?: string;
    amount?: string;
    image_url?: string;
  };
}

// Interface for chat_conversations table
export interface ChatConversation {
  id: string;
  customer_id: string;
  craftsman_id: string;
  created_at: string;
  updated_at: string;
  is_archived_by_customer: boolean;
  is_archived_by_craftsman: boolean;
  is_deleted_by_customer: boolean;
  is_deleted_by_craftsman: boolean;
}

// Interface for chat_messages table
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  metadata?: MessageMetadata;
}

// Type for the function that handles clicking on a contact's name
export type ChatContactClickHandler = {
  onContactNameClick?: (contactId: string) => void;
};
