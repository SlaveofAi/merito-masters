
import { ChatContact, Message, MessageMetadata } from "@/types/chat";

/**
 * Safely processes message metadata from either string or object format
 */
export function parseMessageMetadata(rawMetadata: any): MessageMetadata | undefined {
  if (rawMetadata === null || rawMetadata === undefined) {
    return undefined;
  }
  
  try {
    // If already an object, return as is
    if (typeof rawMetadata === 'object' && rawMetadata !== null) {
      return rawMetadata;
    }
    
    // If a string, try to parse it
    if (typeof rawMetadata === 'string') {
      return JSON.parse(rawMetadata);
    }
    
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

  // Process metadata if it exists
  if (msg.metadata !== null && msg.metadata !== undefined) {
    baseMessage.metadata = parseMessageMetadata(msg.metadata);
  }

  return baseMessage;
}
