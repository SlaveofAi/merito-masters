
export interface MassMessage {
  id: string;
  admin_id: string;
  title: string;
  content: string;
  recipient_type: 'all' | 'craftsmen' | 'customers';
  call_to_action?: {
    text: string;
    url: string;
  };
  created_at: string;
  sent_at?: string;
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  status: 'draft' | 'sending' | 'sent' | 'failed';
}

export interface AnnouncementRecipient {
  id: string;
  announcement_id: string;
  user_id: string;
  delivered_at: string;
  read_at?: string;
  clicked_at?: string;
}

export interface MassMessageForm {
  title: string;
  content: string;
  recipient_type: 'all' | 'craftsmen' | 'customers';
  call_to_action?: {
    text: string;
    url: string;
  };
}
