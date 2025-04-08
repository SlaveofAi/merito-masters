
import { ChatContact, Message, MessageMetadata } from "@/types/chat";

/**
 * Safely parses message metadata from either string or object format
 */
export function parseMessageMetadata(metadata: any): MessageMetadata | undefined {
  if (metadata === null || metadata === undefined) {
    return undefined;
  }
  
  try {
    // If metadata is a string, parse it
    if (typeof metadata === 'string') {
      return JSON.parse(metadata);
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
      return metadata;
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
  // Create a base message with the required fields
  const baseMessage: Message = {
    id: msg.id,
    sender_id: msg.sender_id,
    receiver_id: msg.receiver_id,
    conversation_id: msg.conversation_id,
    content: msg.content,
    created_at: msg.created_at,
    read: msg.receiver_id === userId ? true : msg.read,
  };

  // Try to detect if this is a booking message based on the content (for backward compatibility)
  if (msg.content && (
    msg.content.includes('🗓️ **Požiadavka na termín**') || 
    msg.content.includes('✅ **Požiadavka termínu akceptovaná**') ||
    msg.content.includes('❌ **Požiadavka termínu zamietnutá**')
  )) {
    // Extract booking info from the content
    let type = 'booking_request';
    if (msg.content.includes('akceptovaná')) {
      type = 'booking_response';
    } else if (msg.content.includes('zamietnutá')) {
      type = 'booking_response';
    }

    const lines = msg.content.split('\n');
    const dateMatch = lines.length > 1 ? lines[1].match(/Dátum: (.+)/) : null;
    const timeMatch = lines.length > 2 ? lines[2].match(/Čas: (.+)/) : null;
    
    if (dateMatch || timeMatch) {
      baseMessage.metadata = {
        type: type,
        status: msg.content.includes('akceptovaná') ? 'accepted' : 
               msg.content.includes('zamietnutá') ? 'rejected' : 'pending',
        details: {
          date: dateMatch ? dateMatch[1] : null,
          time: timeMatch ? timeMatch[1] : null
        }
      };
    }
  }
  
  // Add metadata only if it exists and handle type conversion
  // This will override the content-based metadata if both exist
  if (msg.metadata !== null && msg.metadata !== undefined) {
    try {
      baseMessage.metadata = parseMessageMetadata(msg.metadata);
      console.log("Processed message metadata:", baseMessage.metadata);
    } catch (e) {
      console.error("Error processing message metadata:", e);
    }
  }

  return baseMessage;
}
