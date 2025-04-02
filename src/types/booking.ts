
export type CraftsmanAvailability = {
  id: string;
  craftsman_id: string;
  date: string;
  time_slots: TimeSlot[];
  created_at: string;
  updated_at: string;
};

export type TimeSlot = {
  start_time: string; // Format: "HH:MM"
  end_time: string; // Format: "HH:MM"
  is_available: boolean;
};

export type BookingRequest = {
  id: string;
  craftsman_id: string;
  customer_id: string;
  customer_name: string;
  date: string; // ISO date string
  start_time: string; // Format: "HH:MM"
  end_time: string; // Format: "HH:MM"
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  message: string | null;
  created_at: string;
  updated_at: string;
  conversation_id: string;
};
