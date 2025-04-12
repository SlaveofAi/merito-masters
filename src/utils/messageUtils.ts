
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
      console.log("Metadata is already an object:", rawMetadata);
      return rawMetadata;
    }
    
    // If a string, try to parse it
    if (typeof rawMetadata === 'string') {
      console.log("Parsing metadata from string:", rawMetadata);
      const parsed = JSON.parse(rawMetadata);
      console.log("Parsed metadata:", parsed);
      return parsed;
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

  console.log("Processing message data:", msg);

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
    try {
      baseMessage.metadata = parseMessageMetadata(msg.metadata);
      console.log("Processed message metadata:", baseMessage.metadata);
    } catch (error) {
      console.error("Error processing message metadata:", error);
    }
  }

  return baseMessage;
}
