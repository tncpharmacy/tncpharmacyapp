export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
};
