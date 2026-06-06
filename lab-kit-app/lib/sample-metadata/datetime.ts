/** Format a Date for `<input type="datetime-local">` using local clock time. */
export function getLocalDateTimeInputValue(date: Date): string {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 16);
}
