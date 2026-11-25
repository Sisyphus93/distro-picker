/**
 * Renders an ISO date (YYYY-MM-DD) for people, falling back to the raw value
 * when it is not a valid date. Used for "Last reviewed" so the catalog and
 * the detail view agree on how the date reads.
 */
export function formatReviewedDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
