/** First letter of each word capital, rest lowercase — for names, titles, company, section */
export function toTitleCase(s: string): string {
  if (!s || typeof s !== "string") return s;
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
