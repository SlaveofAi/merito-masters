
/**
 * Format a date string to a more readable format
 * @param dateString The date string to format
 * @returns Formatted date string (e.g., "March 2024")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Return month and year (e.g., "March 2024")
    // Using en-US locale to ensure wide compatibility
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
