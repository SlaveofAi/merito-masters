
import { ChatContact, Message, MessageMetadata } from "@/types/chat";

/**
 * Safely parses message metadata from either string or object format
 */
export function parseMessageMetadata(metadata: any): MessageMetadata | undefined {
  if (metadata === null || metadata === undefined) {
    return undefined;
  }
  
  try {
    console.log("Raw metadata to parse:", typeof metadata, metadata);
    
    // If metadata is a string, parse it
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch (e) {
        console.error("Failed to parse metadata string:", e);
        return undefined;
      }
    }
    
    // If it's already an object, validate it's not empty and return as is
    if (typeof metadata === 'object') {
      // Check if the object has any properties
      if (metadata && Object.keys(metadata).length > 0) {
        // Make a deep copy to avoid reference issues
        return JSON.parse(JSON.stringify(metadata));
      } else {
        console.warn("Empty metadata object received");
        return undefined;
      }
    }
    
    console.error("Unrecognized metadata format:", typeof metadata, metadata);
    return undefined;
  } catch (e) {
    console.error("Error parsing message metadata:", e);
    return undefined;
  }
}

/**
 * Processes raw message data into standardized Message format
 */
export function processMessageData(msg: any, userId: string): Message {
  console.log("Processing message data:", msg);
  
  if (!msg || typeof msg !== 'object') {
    console.error("Invalid message data:", msg);
    return {
      id: 'invalid-message-' + Date.now(),
      sender_id: '',
      receiver_id: '',
      conversation_id: '',
      content: 'Error: Invalid message data',
      created_at: new Date().toISOString(),
      read: true
    };
  }

  // Create a base message with the required fields
  const baseMessage: Message = {
    id: msg.id || 'missing-id-' + Date.now(),
    sender_id: msg.sender_id || '',
    receiver_id: msg.receiver_id || '',
    conversation_id: msg.conversation_id || '',
    content: msg.content || '',
    created_at: msg.created_at || new Date().toISOString(),
    read: msg.receiver_id === userId ? true : !!msg.read,
  };

  // Handle metadata
  console.log(`Processing message ${msg.id} metadata:`, msg.metadata);
  
  if (msg.metadata !== null && msg.metadata !== undefined) {
    try {
      baseMessage.metadata = parseMessageMetadata(msg.metadata);
      console.log(`Processed metadata for message ${msg.id}:`, baseMessage.metadata);
      
      // Additional check to ensure booking_id exists for booking requests
      if (baseMessage.metadata?.type === 'booking_request' && !baseMessage.metadata.booking_id) {
        console.warn("Booking request without booking_id, generating one");
        baseMessage.metadata.booking_id = `auto-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      }
    } catch (err) {
      console.error(`Error parsing metadata for message ${msg.id}:`, err);
    }
  } else {
    // Try to detect if this is a booking message based on the content (for backward compatibility)
    if (msg.content && (
      msg.content.includes('🗓️ **Požiadavka na termín**') || 
      msg.content.includes('✅ **Požiadavka termínu akceptovaná**') ||
      msg.content.includes('❌ **Požiadavka termínu zamietnutá**')
    )) {
      // Extract booking info from the content
      let type = 'booking_request';
      let status = 'pending';
      
      if (msg.content.includes('akceptovaná')) {
        type = 'booking_response';
        status = 'accepted';
      } else if (msg.content.includes('zamietnutá')) {
        type = 'booking_response';
        status = 'rejected';
      }

      const lines = msg.content.split('\n');
      const dateMatch = lines.length > 1 ? lines[1].match(/Dátum: (.+)/) : null;
      const timeMatch = lines.length > 2 ? lines[2].match(/Čas: (.+)/) : null;
      
      if (dateMatch || timeMatch) {
        baseMessage.metadata = {
          type: type,
          status: status,
          booking_id: `legacy-${msg.id}`,
          details: {
            date: dateMatch ? dateMatch[1] : null,
            time: timeMatch ? timeMatch[1] : null
          }
        };
        console.log(`Created metadata from content for message ${msg.id}:`, baseMessage.metadata);
      }
    }
  }

  return baseMessage;
}
