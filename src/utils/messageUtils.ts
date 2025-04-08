
/**
 * Safely parses message metadata from either string or object format
 */
export function parseMessageMetadata(metadata: any): any {
  if (metadata === null || metadata === undefined) {
    return undefined;
  }
  
  try {
    return typeof metadata === 'string' 
      ? JSON.parse(metadata) 
      : metadata;
  } catch (e) {
    console.error("Error parsing message metadata:", e);
    return metadata; // Return as-is if parsing fails
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
    baseMessage.metadata = parseMessageMetadata(msg.metadata);
  }

  return baseMessage;
}
