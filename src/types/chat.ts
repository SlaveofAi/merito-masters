
export interface ChatContact {
  id: string;
  contactId?: string;
  name: string;
  avatar_url?: string;
  conversation_id?: string;
  user_type?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface MessageMetadata {
  type?: 'booking_request' | 'admin_announcement';
  status?: string;
  booking_id?: string;
  details?: {
    date?: string;
    time?: string;
    end_time?: string; // Add this property
    message?: string;
    amount?: string;
    image_url?: string;
  };
  announcement_id?: string;
  call_to_action?: {
    text: string;
    url: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  metadata?: MessageMetadata;
  created_at: string;
  read: boolean;
}
