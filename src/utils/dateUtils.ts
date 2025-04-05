
/**
 * Format a date string to a more readable format
 * @param dateString The date string to format
 * @returns Formatted date string (e.g., "March 2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Return month and year (e.g., "March 2024")
  return date.toLocaleDateString('sk-SK', { 
    month: 'long', 
    year: 'numeric'
  });
};
