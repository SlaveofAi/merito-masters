
// This file re-exports the useChatMessages hook as useMessages for backward compatibility
import { useChatMessages } from './useChatMessages';

// Export the useChatMessages hook with the name useMessages
export const useMessages = useChatMessages;

// Also export the original hook name for completeness
export { useChatMessages };
