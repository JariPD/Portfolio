const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Formats a project's year/month fields as "Month YYYY", "YYYY", or "" */
export function formatProjectDate(year: number | null, month: number | null): string {
  if (!year) return "";
  if (!month) return String(year);
  return `${MONTHS[month - 1]} ${year}`;
}

