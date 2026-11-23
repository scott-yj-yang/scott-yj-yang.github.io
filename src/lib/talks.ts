/**
 * "Aug 2026". Content dates are date-only, so they parse as UTC midnight:
 * format in UTC too, or a build west of Greenwich shows the month before.
 */
export function monthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** What to call the link to a post about a talk. */
export function postLabel(url: string): string {
  return /linkedin\.com|lnkd\.in/.test(url) ? "LinkedIn post" : "Post";
}
