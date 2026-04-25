export function safeArray<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}
