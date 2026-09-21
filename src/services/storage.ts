// Base LocalStorage generic wrapper
export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      // Dispatch a custom event to notify components that storage changed
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },
  
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
  
  clearAll(): void {
    try {
      window.localStorage.clear();
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }
};
