
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
        metadata.details = JSON.parse(metadata.details);
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

  // Add metadata only if it exists and handle type conversion
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
