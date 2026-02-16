import { format } from "date-fns";

/**
 * Format a date as "16th Feb 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "do MMM yyyy");
}
