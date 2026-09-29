/**
 * Safari & ITP Safe LocalStorage Wrapper
 * 
 * In Safari Private Browsing mode and when Intelligent Tracking Prevention (ITP)
 * restricts storage access, raw window.localStorage calls can throw DOMException: QuotaExceededError
 * or SecurityError. This module wraps all operations in resilient try-catch blocks.
 */

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  getJSON<T>(key: string, fallback: T): T {
    const item = safeLocalStorage.getItem(key);
    if (!item) return fallback;
    try {
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): boolean {
    try {
      return safeLocalStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};

export default safeLocalStorage;
