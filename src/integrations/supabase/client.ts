
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ivssecjzxhabahdapfko.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2c3NlY2p6eGhhYmFoZGFwZmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTk4OTEsImV4cCI6MjA1ODY3NTg5MX0.FCZlLf3VU9nFE-4tnNNJewUQFhX0F_OV8F1XQm-VLmI";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
);

// Type-safe helper functions for chat tables
export const chatTables = {
  conversations: () => supabase.from('chat_conversations'),
  messages: () => supabase.from('chat_messages')
};
