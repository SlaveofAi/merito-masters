import { ChatContact, Message, MessageMetadata } from "@/types/chat";

/**
 * Safely parses message metadata from either string or object format
 */
export function parseMessageMetadata(metadata: any): MessageMetadata | undefined {
  if (metadata === null || metadata === undefined) {
    return undefined;
  }
  
  try {
    // Log the incoming metadata for debugging
    console.log("Raw metadata to parse:", metadata);
    
    // If metadata is a string, parse it
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch (e) {
        console.error("Failed to parse metadata string:", e);
        return undefined;
      }
    }
    
    // If it's already an object and has the expected properties, return as is
    if (typeof metadata === 'object') {
      // Convert any nested objects that might be strings
      if (metadata.details && typeof metadata.details === 'string') {
        try {
          metadata.details = JSON.parse(metadata.details);
        } catch (e) {
          // If parsing fails, keep it as is - it might be a simple string
          console.log("Failed to parse metadata.details, but continuing", metadata.details);
        }
      }
      return metadata as MessageMetadata;
    }
    
    // Return undefined on inconsistent data
    console.error("Unrecognized metadata format:", metadata);
    return undefined;
  } catch (e) {
    console.error("Error parsing message metadata:", e);
    // Return undefined on parse error instead of returning malformed data
    return undefined;
  }
}

/**
 * Processes raw message data into standardized Message format
 */
export function processMessageData(msg: any, userId: string): Message {
  // Safety check for null/undefined
  if (!msg || typeof msg !== 'object') {
    console.error("Invalid message data:", msg);
    // Return a minimal valid message object to prevent runtime errors
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

  // Create a base message with the required fields, using optional chaining
  const baseMessage: Message = {
    id: msg.id || 'missing-id-' + Date.now(),
    sender_id: msg.sender_id || '',
    receiver_id: msg.receiver_id || '',
    conversation_id: msg.conversation_id || '',
    content: msg.content || '',
    created_at: msg.created_at || new Date().toISOString(),
    read: msg.receiver_id === userId ? true : !!msg.read,
  };

  // Add metadata handling with better debug output
  if (msg.metadata !== null && msg.metadata !== undefined) {
    try {
      console.log(`Message ${msg.id} has raw metadata:`, msg.metadata);
      baseMessage.metadata = parseMessageMetadata(msg.metadata);
      console.log(`Message ${msg.id} processed metadata:`, baseMessage.metadata);
    } catch (e) {
      console.error(`Error processing metadata for message ${msg.id}:`, e);
      // Don't add metadata if parsing failed
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
