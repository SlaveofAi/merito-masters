
export const formatCurrency = (value: number | string, locale = 'sk-SK', currency = 'EUR') => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0 €';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Neplatný dátum';
  }
  
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateWithLocale = (dateString: string, locale = 'sk-SK') => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Neplatný dátum';
  }
  
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
