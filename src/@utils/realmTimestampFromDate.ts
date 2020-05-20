export function realmTimestampFromDate(date: Date) {
  return `T${Math.floor(date.getTime() / 1000)}:000`
}
