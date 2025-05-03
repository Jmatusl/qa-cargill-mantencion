import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatTime24 = (date: Date | number | string): string => {
  const validDate = typeof date === 'string' ? new Date(date) : date;
  return format(validDate, 'HH:mm', { locale: es });
};
