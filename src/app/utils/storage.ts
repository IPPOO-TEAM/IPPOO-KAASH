function makeStore(getStore: () => Storage) {
  return {
    get<T>(key: string): T | null {
      try {
        const raw = getStore().getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw) as T;
      } catch (err) {
        console.warn(`[storage] read failed for "${key}":`, err);
        return null;
      }
    },
    set<T>(key: string, value: T): boolean {
      try {
        getStore().setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn(`[storage] write failed for "${key}":`, err);
        return false;
      }
    },
    remove(key: string): void {
      try { getStore().removeItem(key); } catch { /* ignore */ }
    },
  };
}

export const sessionStore = makeStore(() => sessionStorage);

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[storage] read failed for "${key}":`, err);
      return null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[storage] write failed for "${key}":`, err);
      return false;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
