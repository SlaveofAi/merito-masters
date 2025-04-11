
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
    // Basic configuration for better reliability
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) => {
        // Add retry logic for fetch operations
        return fetch(url, options).catch(err => {
          console.error('Fetch error in Supabase client:', err);
          return fetch(url, options);
        });
      },
      headers: {
        'X-Client-Info': 'lovable-app',
      }
    }
  }
);

// Simple connection check function
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (e) {
    console.error('Connection check failed:', e);
    return false;
  }
};

// Check Supabase Realtime connection
export const checkRealtimeConnection = async (retries = 1): Promise<boolean> => {
  try {
    // Create a temporary channel for testing realtime connection
    const testChannelName = `test-connection-${Date.now()}`;
    const channel = supabase.channel(testChannelName);
    
    // Subscribe to the channel and return a promise
    const connectionPromise = new Promise<boolean>((resolve) => {
      // Set a timeout in case subscription hangs
      const timeout = setTimeout(() => {
        console.log('Realtime connection check timed out');
        resolve(false);
      }, 3000);
      
      channel
        .on('system', { event: 'connected' }, () => {
          clearTimeout(timeout);
          console.log('Realtime connection established');
          resolve(true);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Already handled by the 'connected' event
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            clearTimeout(timeout);
            console.log(`Realtime subscription failed with status: ${status}`);
            resolve(false);
          }
        });
    });
    
    // Wait for the connection result
    const isConnected = await connectionPromise;
    
    // Clean up the test channel
    supabase.removeChannel(channel);
    
    // If connection failed and we have retries left, try again
    if (!isConnected && retries > 0) {
      console.log(`Retrying realtime connection check (${retries} attempts left)`);
      return checkRealtimeConnection(retries - 1);
    }
    
    return isConnected;
  } catch (e) {
    console.error('Realtime connection check error:', e);
    return false;
  }
};
