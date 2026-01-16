// Shared utility functions for the flights application

/**
 * Formats a date string from YYMMDD format to a readable format
 * @param date - Date string in YYMMDD format
 * @returns Formatted date string
 */
export function formatDate(date: string): string {
  if (!/^\d{6}$/.test(date)) return date;
  const year = "20" + date.slice(0, 2);
  const month = date.slice(2, 4);
  const day = date.slice(4, 6);
  const d = new Date(`${year}-${month}-${day}`);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculates the minimum price from a list of partners
 * @param partners - Array of partner objects with price property
 * @returns Minimum price
 */
export function getMinPrice(partners: { price: number }[]): number {
  return Math.min(...partners.map((p) => p.price));
}

/**
 * Formats stops information for display
 * @param stops - Number of stops
 * @returns Formatted stops string
 */
export function formatStops(stops: number): string {
  return stops === 0 ? "Direct" : `${stops} stop${stops !== 1 ? "s" : ""}`;
}
