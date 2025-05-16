
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'message' | 'booking_request' | 'booking_update' | 'topped_status';
  read: boolean;
  created_at: string;
  metadata?: {
    conversation_id?: string;
    contact_id?: string;
    booking_id?: string;
    status?: string;
    topped_until?: string;
  };
}
