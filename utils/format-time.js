/* eslint-disable no-restricted-globals */
import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  // Validate the date input
  if (!date) {
    console.error('fDate: Invalid date input:', date);
    return 'Invalid Date';
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    console.error('fDate: Unable to parse date:', date);
    return 'Invalid Date';
  }

  return format(parsedDate, fm);
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  // Check if date is a valid Date object
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date:', date);
    return 'Invalid date'; // Return a fallback string for invalid dates
  }

  return formatDistanceToNow(date, { addSuffix: true });
}
