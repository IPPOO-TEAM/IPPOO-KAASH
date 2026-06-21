import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { storage } from "../utils/storage";
import { api, setAuthToken, setOnUnauthorized, type ApiUser } from "../api/client";
import { toast } from "sonner";

export interface User {
  id?: string;
  fullName: string;
  phone: string;
  accountType: "particulier" | "commercant";
  createdAt: string;
  email?: string | null;
  city?: string;
  address?: string;
  bio?: string;
  avatarDataUrl?: string;
}

interface StoredProfile {
  user: User;
  expiresAt: number;
}
interface StoredToken {
  token: string;
  expiresAt: number;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loginWithCredentials: (phone: string, pin: string) => Promise<void>;
  registerWithCredentials: (input: { fullName: string; phone: string; pin: string; accountType: "particulier" | "commercant"; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PROFILE_KEY = "ippoo_cash_profile";
const TOKEN_KEY = "ippoo_cash_token";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function fromApi(u: ApiUser): User {
  return {
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    email: u.email,
    accountType: u.accountType,
    createdAt: u.createdAt,
    city: u.city,
    address: u.address,
    bio: u.bio,
    avatarDataUrl: u.avatarDataUrl,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const tok = storage.get<StoredToken>(TOKEN_KEY);
    const profile = storage.get<StoredProfile>(PROFILE_KEY);
    const now = Date.now();
    const tokenValid = tok && tok.expiresAt > now && tok.token;
    const profileValid = profile && profile.expiresAt > now && profile.user;
    if (tokenValid && profileValid) {
      setAuthToken(tok.token);
      setUser(profile.user);
    } else {
      storage.remove(TOKEN_KEY);
      storage.remove(PROFILE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setOnUnauthorized(() => {
      setAuthToken(null);
      setUser(null);
      storage.remove(TOKEN_KEY);
      storage.remove(PROFILE_KEY);
      if (user) toast.error("Session expirée. Veuillez vous reconnecter.");
    });
    return () => setOnUnauthorized(null);
  }, [hydrated, user]);

  const persist = (token: string, u: User) => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    setAuthToken(token);
    setUser(u);
    storage.set<StoredToken>(TOKEN_KEY, { token, expiresAt });
    storage.set<StoredProfile>(PROFILE_KEY, { user: u, expiresAt });
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loginWithCredentials: async (phone, _pin) => {
      const next: User = {
        id: `local-${phone}`,
        fullName: "Utilisateur",
        phone,
        accountType: "particulier",
        createdAt: new Date().toISOString(),
        email: null,
      };
      persist(`local-${phone}-${Date.now()}`, next);
    },
    registerWithCredentials: async (input) => {
      const next: User = {
        id: `local-${input.phone}`,
        fullName: input.fullName,
        phone: input.phone,
        accountType: input.accountType,
        createdAt: new Date().toISOString(),
        email: input.email ?? null,
      };
      persist(`local-${input.phone}-${Date.now()}`, next);
    },
    logout: async () => {
      setAuthToken(null);
      setUser(null);
      storage.remove(TOKEN_KEY);
      storage.remove(PROFILE_KEY);
    },
    updateUser: async (patch) => {
      const next: User = { ...(user ?? { fullName: "", phone: "", accountType: "particulier", createdAt: new Date().toISOString() }), ...patch };
      setUser(next);
      const existing = storage.get<StoredProfile>(PROFILE_KEY);
      const expiresAt = existing?.expiresAt ?? Date.now() + SESSION_DURATION_MS;
      storage.set<StoredProfile>(PROFILE_KEY, { user: next, expiresAt });
    },
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-[#14B85A]/20 border-t-[#14B85A] rounded-full animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const fallbackAuth: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  loginWithCredentials: async () => { throw new Error("AuthProvider non monté"); },
  registerWithCredentials: async () => { throw new Error("AuthProvider non monté"); },
  logout: async () => { /* noop */ },
  updateUser: () => { /* noop */ },
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? fallbackAuth;
}
