import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6e59bc2b`;

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

// Offline mode: return empty/safe payloads instead of hitting the edge function.
// Toggle to false once the backend is reachable again.
const OFFLINE = true;

function offlineResponse(path: string, method: string): any {
  if (path === "/wallet/balance") return { balance: 0 };
  if (path === "/transactions" && method === "GET") return { transactions: [] };
  if (path === "/payment-requests" && method === "GET") return { requests: [] };
  if (path === "/vouchers" && method === "GET") return { vouchers: [] };
  if (path === "/credits" && method === "GET") return { credits: [] };
  if (path === "/investments" && method === "GET") return { investments: [] };
  if (path === "/products" && method === "GET") return { products: [] };
  if (path === "/health") return { status: "offline" };
  if (path === "/auth/otp/request") {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    return { ok: true, devCode: code };
  }
  if (path === "/auth/otp/verify") return { ok: true };
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") return { ok: true };
  return {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  if (OFFLINE) return offlineResponse(path, method) as T;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("apikey", publicAnonKey);
  headers.set("Authorization", `Bearer ${authToken ?? publicAnonKey}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  let payload: any = null;
  try { payload = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401 && authToken && path !== "/auth/login" && path !== "/auth/signup") {
      onUnauthorized?.();
    }
    const message = payload?.error || `Erreur ${res.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export interface ApiUser {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  accountType: "particulier" | "commercant";
  createdAt: string;
  city?: string;
  address?: string;
  bio?: string;
  avatarDataUrl?: string;
}

export interface ApiTransaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  status: "confirmed" | "pending" | "failed";
  category: string;
  date: string;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  requestOtp: (phone: string) =>
    request<{ ok: true; devCode?: string }>("/auth/otp/request", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, code: string) =>
    request<{ ok: true }>("/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) }),

  signup: (body: { fullName: string; phone: string; pin: string; accountType: "particulier" | "commercant"; email?: string }) =>
    request<{ token: string; user: ApiUser }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { phone: string; pin: string }) =>
    request<{ token: string; user: ApiUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  verifyPin: (pin: string) => request<{ ok: true }>("/auth/verify-pin", { method: "POST", body: JSON.stringify({ pin }) }),
  me: () => request<{ user: ApiUser }>("/auth/me"),
  updateProfile: (patch: Partial<Omit<ApiUser, "id" | "phone" | "createdAt">> & { avatarDataUrl?: string | null }) =>
    request<{ user: ApiUser }>("/auth/profile", { method: "PUT", body: JSON.stringify(patch) }),

  getBalance: () => request<{ balance: number }>("/wallet/balance"),
  listTransactions: () => request<{ transactions: ApiTransaction[] }>("/transactions"),
  createTransaction: (body: { type: "income" | "expense"; amount: number; description: string; category?: string; status?: "confirmed" | "pending" | "failed" }) =>
    request<{ transaction: ApiTransaction }>("/transactions", { method: "POST", body: JSON.stringify(body) }),
  getTransaction: (id: string) => request<{ transaction: ApiTransaction }>(`/transactions/${id}`),
  deleteTransaction: (id: string) => request<{ ok: true }>(`/transactions/${id}`, { method: "DELETE" }),
  setTransactionStatus: (id: string, status: "confirmed" | "failed" | "pending") =>
    request<{ transaction: ApiTransaction }>(`/transactions/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  listPaymentRequests: () => request<{ requests: ApiPaymentRequest[] }>("/payment-requests"),
  createPaymentRequest: (body: { amount: number; object: string; payerName: string; reference?: string }) =>
    request<{ request: ApiPaymentRequest }>("/payment-requests", { method: "POST", body: JSON.stringify(body) }),
  cancelPaymentRequest: (id: string) =>
    request<{ request: ApiPaymentRequest }>(`/payment-requests/${id}/cancel`, { method: "POST" }),
  relaunchPaymentRequest: (id: string) =>
    request<{ request: ApiPaymentRequest }>(`/payment-requests/${id}/relaunch`, { method: "POST" }),

  listVouchers: () => request<{ vouchers: ApiVoucher[] }>("/vouchers"),
  createVoucher: (body: { value: number; issuer: string; beneficiary: string; expiryDate: string }) =>
    request<{ voucher: ApiVoucher }>("/vouchers", { method: "POST", body: JSON.stringify(body) }),
  deleteVoucher: (id: string) => request<{ ok: true }>(`/vouchers/${id}`, { method: "DELETE" }),

  listCredits: () => request<{ credits: ApiCredit[] }>("/credits"),
  getCredit: (id: string) => request<{ credit: ApiCredit }>(`/credits/${id}`),
  createCredit: (body: { amount: number; motif: string; interestRate?: number }) =>
    request<{ credit: ApiCredit }>("/credits", { method: "POST", body: JSON.stringify(body) }),
  deleteCredit: (id: string) => request<{ ok: true }>(`/credits/${id}`, { method: "DELETE" }),

  listProducts: () => request<{ products: ApiProduct[] }>("/products"),
  getProduct: (id: string) => request<{ product: ApiProduct }>(`/products/${id}`),
  createProduct: (body: { name: string; description?: string; category: string; price: number; stock: number; origin?: string }) =>
    request<{ product: ApiProduct }>("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, body: Partial<{ name: string; description: string; category: string; price: number; stock: number; origin: string }>) =>
    request<{ product: ApiProduct }>(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<{ ok: true }>(`/products/${id}`, { method: "DELETE" }),

  listInvestments: () => request<{ investments: ApiInvestment[] }>("/investments"),
  getInvestment: (id: string) => request<{ investment: ApiInvestment }>(`/investments/${id}`),
  createInvestment: (body: { name: string; amount: number; type: string; endDate?: string }) =>
    request<{ investment: ApiInvestment; transaction: ApiTransaction }>("/investments", { method: "POST", body: JSON.stringify(body) }),
  deleteInvestment: (id: string) => request<{ ok: true }>(`/investments/${id}`, { method: "DELETE" }),
};

export interface ApiVoucher {
  id: string;
  userId: string;
  value: number;
  remainingValue: number;
  issuer: string;
  beneficiary: string;
  status: "active" | "used" | "expired" | "cancelled";
  expiryDate: string;
  createdDate: string;
  usageHistory: { date: string; amount: number; reference: string }[];
}

export interface ApiCredit {
  id: string;
  userId: string;
  amount: number;
  remainingAmount: number;
  interestRate: number;
  motif: string;
  status: "active" | "pending" | "completed" | "rejected";
  startDate: string;
  endDate: string;
  installments: { date: string; amount: number; status: string }[];
}

export interface ApiProduct {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock";
  origin: string;
  rating: number;
  reviews: number;
  createdAt: string;
}

export interface ApiInvestment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  returns: number;
  status: "active" | "completed" | "pending";
  startDate: string;
  endDate: string;
  type: string;
  performance: number;
}

export interface ApiPaymentRequest {
  id: string;
  userId: string;
  amount: number;
  object: string;
  description: string;
  payerName: string;
  reference: string;
  status: "pending" | "confirmed" | "cancelled";
  date: string;
  lastRelaunchAt?: string;
}
