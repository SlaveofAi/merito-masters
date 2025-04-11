
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
    },
    // Enhanced realtime configuration
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Connection check function
export const checkRealtimeConnection = async (): Promise<boolean> => {
  try {
    // Create a temporary channel to test connection
    const tempChannel = supabase.channel('connection-test');
    const status = await new Promise<string>((resolve) => {
      const subscription = tempChannel.subscribe((status) => {
        resolve(status);
        subscription.unsubscribe();
      });
    });
    
    await supabase.removeChannel(tempChannel);
    return status === 'SUBSCRIBED';
  } catch (e) {
    console.error('Realtime connection check failed:', e);
    return false;
  }
};
