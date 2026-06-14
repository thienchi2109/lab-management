/** Format a Date for `<input type="date">` using local clock time. */
export function getLocalDateInputValue(date: Date): string {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 10);
}
