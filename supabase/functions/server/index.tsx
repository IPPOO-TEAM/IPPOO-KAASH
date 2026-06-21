import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import type { Context, Next } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const BASE = "/make-server-6e59bc2b";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

app.use("*", logger(console.log));

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const corsOrigin = allowedOrigins.length === 0
  ? "*"
  : (origin: string) => (allowedOrigins.includes(origin) ? origin : null);

app.use("/*", cors({
  origin: corsOrigin,
  allowHeaders: ["Content-Type", "Authorization", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ---------- crypto helpers ----------
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function randomHex(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}
function hexFromBuffer(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const PBKDF2_ITERATIONS = 120_000;
const PBKDF2_KEYLEN_BITS = 256;
const PIN_HASH_VERSION = "pbkdf2-sha256-v1";

async function hashPin(pin: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    PBKDF2_KEYLEN_BITS,
  );
  return `${PIN_HASH_VERSION}$${PBKDF2_ITERATIONS}$${hexFromBuffer(bits)}`;
}

// Legacy fallback for accounts created before PBKDF2 rollout.
async function legacyHashPin(pin: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${pin}`);
}

async function verifyPin(pin: string, salt: string, stored: string): Promise<boolean> {
  if (stored.startsWith(`${PIN_HASH_VERSION}$`)) {
    const expected = await hashPin(pin, salt);
    return expected === stored;
  }
  // Legacy SHA-256(salt:pin). Constant-time-ish compare.
  const expected = await legacyHashPin(pin, salt);
  return expected === stored;
}

// ---------- session middleware ----------
type SessionRecord = { userId: string; phone: string; expiresAt: number };
async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return c.json({ error: "Token manquant" }, 401);
  const session = await kv.get(`session:${token}`) as SessionRecord | undefined;
  if (!session) return c.json({ error: "Session invalide" }, 401);
  if (session.expiresAt < Date.now()) {
    await kv.del(`session:${token}`);
    return c.json({ error: "Session expirée" }, 401);
  }
  c.set("session", session);
  c.set("token", token);
  await next();
}

// ---------- otp ----------
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_ATTEMPT_LIMIT = 5;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;

/**
 * Code passe-partout dev / QA — accepté à la vérification, peu importe le numéro.
 * À NE PAS désactiver tant que la livraison SMS prod n'est pas validée.
 * Pour le retirer en prod : définir l'env DISABLE_DEV_MASTER_CODE=1.
 */
const DEV_MASTER_CODE = "4242";

/**
 * Twilio — clés à fournir via les variables d'environnement de la fonction Supabase :
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER       (ex : +1xxxxxxxxxx)
 * Si l'une est manquante, le code n'est pas envoyé par SMS — il reste loggué + renvoyé en devCode.
 */
async function sendSmsViaTwilio(toPhoneE164: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_FROM_NUMBER");
  if (!sid || !token || !from) {
    return { ok: false, error: "Twilio non configuré (TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER manquants)" };
  }
  const body = new URLSearchParams({
    To: toPhoneE164,
    From: from,
    Body: `IPPOO CASH : votre code de vérification est ${code}. Valable 5 minutes. Ne le partagez avec personne.`,
  });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[Twilio] échec envoi SMS : ${res.status} ${text}`);
    return { ok: false, error: `Twilio ${res.status}` };
  }
  return { ok: true };
}

function toE164Bj(phone: string): string {
  // Bénin = +229 ; on accepte 8 ou 10 chiffres locaux.
  return `+229${phone}`;
}

app.post(`${BASE}/auth/otp/request`, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.phone || !/^\d{8,10}$/.test(body.phone)) return c.json({ error: "Téléphone invalide" }, 400);

  const existing = await kv.get(`otp:${body.phone}`) as { code: string; expiresAt: number; attempts: number; lastSentAt?: number } | undefined;
  if (existing?.lastSentAt && Date.now() - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    const retryIn = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000);
    return c.json({ error: `Patientez ${retryIn}s avant de renvoyer`, retryIn }, 429);
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));
  await kv.set(`otp:${body.phone}`, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, lastSentAt: Date.now() });
  console.log(`[OTP] phone=${body.phone} code=${code}`);

  const sms = await sendSmsViaTwilio(toE164Bj(body.phone), code);
  if (!sms.ok) console.warn(`[OTP] SMS non envoyé : ${sms.error}`);

  // En dev (ou si SMS non configuré), on renvoie le code au client pour ne pas bloquer la démo.
  const devMode = (Deno.env.get("DENO_DEPLOYMENT_ID") ?? "").length === 0 || !sms.ok;
  return c.json(devMode ? { ok: true, devCode: code, smsSent: sms.ok } : { ok: true, smsSent: true });
});

app.post(`${BASE}/auth/otp/verify`, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.phone || !body?.code) return c.json({ error: "Champs requis" }, 400);

  // Code passe-partout dev : accepté tant que DISABLE_DEV_MASTER_CODE n'est pas défini.
  const masterDisabled = Deno.env.get("DISABLE_DEV_MASTER_CODE") === "1";
  if (!masterDisabled && String(body.code) === DEV_MASTER_CODE) {
    await kv.del(`otp:${body.phone}`);
    return c.json({ ok: true, viaMasterCode: true });
  }

  const record = await kv.get(`otp:${body.phone}`) as { code: string; expiresAt: number; attempts: number } | undefined;
  if (!record) return c.json({ error: "Aucun code en cours" }, 400);
  if (record.expiresAt < Date.now()) { await kv.del(`otp:${body.phone}`); return c.json({ error: "Code expiré" }, 400); }
  if (record.attempts >= OTP_ATTEMPT_LIMIT) { await kv.del(`otp:${body.phone}`); return c.json({ error: "Trop d'essais" }, 429); }
  if (record.code !== String(body.code)) {
    await kv.set(`otp:${body.phone}`, { ...record, attempts: record.attempts + 1 });
    return c.json({ error: "Code incorrect" }, 400);
  }
  await kv.del(`otp:${body.phone}`);
  return c.json({ ok: true });
});

// ---------- health ----------
app.get(`${BASE}/health`, (c) => c.json({ status: "ok" }));

// ---------- auth ----------
app.post(`${BASE}/auth/signup`, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { fullName, phone, pin, accountType, email } = body;
  if (!fullName || !phone || !pin) return c.json({ error: "Champs requis manquants" }, 400);
  if (!/^\d{8,10}$/.test(phone)) return c.json({ error: "Téléphone invalide" }, 400);
  if (!/^\d{4,6}$/.test(pin)) return c.json({ error: "PIN invalide (4-6 chiffres)" }, 400);

  const existing = await kv.get(`user:${phone}`);
  if (existing) return c.json({ error: "Ce numéro est déjà inscrit" }, 409);

  const salt = randomHex(16);
  const pinHash = await hashPin(pin, salt);
  const userId = `usr_${randomHex(8)}`;
  const user = {
    id: userId,
    fullName,
    phone,
    email: email ?? null,
    accountType: accountType === "commercant" ? "commercant" : "particulier",
    salt,
    pinHash,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`user:${phone}`, user);
  await kv.set(`userById:${userId}`, { phone });

  const token = randomHex(24);
  await kv.set(`session:${token}`, { userId, phone, expiresAt: Date.now() + SESSION_TTL_MS });

  const { pinHash: _ph, salt: _s, ...safe } = user;
  return c.json({ token, user: safe });
});

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 5;

app.post(`${BASE}/auth/login`, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { phone, pin } = body;
  if (!phone || !pin) return c.json({ error: "Téléphone et PIN requis" }, 400);

  const rlKey = `ratelimit:login:${phone}`;
  const rl = await kv.get(rlKey) as { count: number; lockedUntil: number } | undefined;
  const now = Date.now();
  if (rl && rl.lockedUntil > now) {
    const mins = Math.ceil((rl.lockedUntil - now) / 60000);
    return c.json({ error: `Trop d'essais. Réessayez dans ${mins} min.` }, 429);
  }

  const user = await kv.get(`user:${phone}`);
  if (!user) return c.json({ error: "Identifiants invalides" }, 401);
  const valid = await verifyPin(pin, user.salt, user.pinHash);
  if (!valid) {
    const count = (rl?.count ?? 0) + 1;
    const lockedUntil = count >= LOGIN_MAX_FAILS ? now + LOGIN_WINDOW_MS : 0;
    await kv.set(rlKey, { count, lockedUntil });
    return c.json({ error: "Identifiants invalides" }, 401);
  }
  if (rl) await kv.del(rlKey);
  if (!String(user.pinHash).startsWith(`${PIN_HASH_VERSION}$`)) {
    const rehashed = await hashPin(pin, user.salt);
    await kv.set(`user:${phone}`, { ...user, pinHash: rehashed });
  }

  const token = randomHex(24);
  await kv.set(`session:${token}`, { userId: user.id, phone, expiresAt: Date.now() + SESSION_TTL_MS });

  const { pinHash: _ph, salt: _s, ...safe } = user;
  return c.json({ token, user: safe });
});

app.post(`${BASE}/auth/logout`, authMiddleware, async (c) => {
  const token = c.get("token") as string;
  await kv.del(`session:${token}`);
  return c.json({ ok: true });
});

app.post(`${BASE}/auth/verify-pin`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body?.pin) return c.json({ error: "PIN requis" }, 400);
  const user = await kv.get(`user:${session.phone}`);
  if (!user) return c.json({ error: "Utilisateur introuvable" }, 404);
  const valid = await verifyPin(String(body.pin), user.salt, user.pinHash);
  if (!valid) return c.json({ error: "PIN incorrect" }, 401);
  return c.json({ ok: true });
});

app.put(`${BASE}/auth/profile`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const user = await kv.get(`user:${session.phone}`);
  if (!user) return c.json({ error: "Utilisateur introuvable" }, 404);

  const next = { ...user };
  if (typeof body.fullName === "string" && body.fullName.trim()) next.fullName = body.fullName.trim().slice(0, 120);
  if (typeof body.email === "string") next.email = body.email.trim().slice(0, 160) || null;
  if (typeof body.city === "string") next.city = body.city.trim().slice(0, 80);
  if (typeof body.address === "string") next.address = body.address.trim().slice(0, 200);
  if (typeof body.bio === "string") next.bio = body.bio.trim().slice(0, 280);
  if (body.accountType === "particulier" || body.accountType === "commercant") next.accountType = body.accountType;
  if (typeof body.avatarDataUrl === "string" && body.avatarDataUrl.startsWith("data:image/") && body.avatarDataUrl.length < 1_500_000) {
    next.avatarDataUrl = body.avatarDataUrl;
  } else if (body.avatarDataUrl === null) {
    delete next.avatarDataUrl;
  }
  await kv.set(`user:${session.phone}`, next);
  const { pinHash: _ph, salt: _s, ...safe } = next;
  return c.json({ user: safe });
});

app.get(`${BASE}/auth/me`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const user = await kv.get(`user:${session.phone}`);
  if (!user) return c.json({ error: "Utilisateur introuvable" }, 404);
  const { pinHash: _ph, salt: _s, ...safe } = user;
  return c.json({ user: safe });
});

// ---------- transactions ----------
type TxInput = {
  type: "income" | "expense";
  amount: number;
  description: string;
  status?: "confirmed" | "pending" | "failed";
  category?: string;
};

const STARTING_BALANCE = 1845000;

function computeBalance(items: any[]): number {
  return items.reduce((sum, t) => {
    if (t.status === "failed") return sum;
    const amt = Number(t.amount) || 0;
    return t.type === "income" ? sum + amt : sum - amt;
  }, STARTING_BALANCE);
}

app.get(`${BASE}/transactions`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`tx:${session.userId}:`);
  items.sort((a: any, b: any) => (b.date ?? "").localeCompare(a.date ?? ""));
  return c.json({ transactions: items });
});

app.get(`${BASE}/wallet/balance`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`tx:${session.userId}:`);
  return c.json({ balance: computeBalance(items) });
});

app.post(`${BASE}/transactions`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null) as TxInput | null;
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  if (body.type !== "income" && body.type !== "expense") return c.json({ error: "Type invalide" }, 400);
  if (typeof body.amount !== "number" || body.amount <= 0) return c.json({ error: "Montant invalide" }, 400);
  if (!body.description || typeof body.description !== "string") return c.json({ error: "Description requise" }, 400);
  if (!Number.isFinite(body.amount)) return c.json({ error: "Montant invalide" }, 400);

  if (body.type === "expense") {
    const existing = await kv.getByPrefix(`tx:${session.userId}:`);
    const balance = computeBalance(existing);
    if (body.amount > balance) return c.json({ error: "Solde insuffisant" }, 400);
  }

  const id = `tx_${randomHex(8)}`;
  const tx = {
    id,
    userId: session.userId,
    type: body.type,
    amount: body.amount,
    description: body.description.slice(0, 140),
    status: body.status ?? "confirmed",
    category: body.category ?? "Autre",
    date: new Date().toISOString(),
  };
  await kv.set(`tx:${session.userId}:${id}`, tx);
  return c.json({ transaction: tx });
});

app.get(`${BASE}/transactions/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const id = c.req.param("id");
  const tx = await kv.get(`tx:${session.userId}:${id}`);
  if (!tx) return c.json({ error: "Transaction introuvable" }, 404);
  return c.json({ transaction: tx });
});

app.patch(`${BASE}/transactions/:id/status`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const status = body?.status;
  if (status !== "confirmed" && status !== "failed" && status !== "pending") {
    return c.json({ error: "Statut invalide" }, 400);
  }
  const tx = await kv.get(`tx:${session.userId}:${id}`);
  if (!tx) return c.json({ error: "Transaction introuvable" }, 404);
  if (tx.status === "confirmed" && status !== "confirmed") {
    return c.json({ error: "Transaction déjà confirmée" }, 400);
  }
  if (status === "confirmed" && tx.type === "expense") {
    const others = await kv.getByPrefix(`tx:${session.userId}:`);
    const projected = others.map((x: any) => x.id === id ? { ...tx, status: "confirmed" } : x);
    if (computeBalance(projected) < 0) return c.json({ error: "Solde insuffisant" }, 400);
  }
  const updated = { ...tx, status };
  await kv.set(`tx:${session.userId}:${id}`, updated);
  return c.json({ transaction: updated });
});

app.delete(`${BASE}/transactions/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const id = c.req.param("id");
  await kv.del(`tx:${session.userId}:${id}`);
  return c.json({ ok: true });
});

// ---------- payment requests (demandes de réception) ----------
type PaymentRequestStatus = "pending" | "confirmed" | "cancelled";

app.get(`${BASE}/payment-requests`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`preq:${session.userId}:`);
  items.sort((a: any, b: any) => (b.date ?? "").localeCompare(a.date ?? ""));
  return c.json({ requests: items });
});

app.post(`${BASE}/payment-requests`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { amount, object, payerName, reference } = body;
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) return c.json({ error: "Montant invalide" }, 400);
  if (!payerName || typeof payerName !== "string") return c.json({ error: "Payeur requis" }, 400);
  if (!object || typeof object !== "string") return c.json({ error: "Objet requis" }, 400);

  const id = `DEM-${randomHex(4).toUpperCase()}`;
  const req = {
    id,
    userId: session.userId,
    amount,
    object: object.slice(0, 80),
    description: object.slice(0, 80),
    payerName: payerName.slice(0, 100),
    reference: (reference ?? "").slice(0, 60) || id,
    status: "pending" as PaymentRequestStatus,
    date: new Date().toISOString(),
  };
  await kv.set(`preq:${session.userId}:${id}`, req);
  return c.json({ request: req });
});

app.post(`${BASE}/payment-requests/:id/cancel`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const id = c.req.param("id");
  const req = await kv.get(`preq:${session.userId}:${id}`);
  if (!req) return c.json({ error: "Demande introuvable" }, 404);
  const updated = { ...req, status: "cancelled" as PaymentRequestStatus };
  await kv.set(`preq:${session.userId}:${id}`, updated);
  return c.json({ request: updated });
});

app.post(`${BASE}/payment-requests/:id/relaunch`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const id = c.req.param("id");
  const req = await kv.get(`preq:${session.userId}:${id}`);
  if (!req) return c.json({ error: "Demande introuvable" }, 404);
  const updated = { ...req, lastRelaunchAt: new Date().toISOString() };
  await kv.set(`preq:${session.userId}:${id}`, updated);
  return c.json({ request: updated });
});

// ---------- vouchers ----------
app.get(`${BASE}/vouchers`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`voucher:${session.userId}:`);
  items.sort((a: any, b: any) => (b.createdDate ?? "").localeCompare(a.createdDate ?? ""));
  return c.json({ vouchers: items });
});

app.post(`${BASE}/vouchers`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { value, issuer, beneficiary, expiryDate } = body;
  if (typeof value !== "number" || value <= 0 || !Number.isFinite(value)) return c.json({ error: "Valeur invalide" }, 400);
  if (!issuer || !beneficiary || !expiryDate) return c.json({ error: "Champs requis" }, 400);
  const id = `BON-${randomHex(4).toUpperCase()}`;
  const voucher = {
    id,
    userId: session.userId,
    value,
    remainingValue: value,
    issuer: String(issuer).slice(0, 100),
    beneficiary: String(beneficiary).slice(0, 100),
    status: "active" as const,
    expiryDate: String(expiryDate).slice(0, 10),
    createdDate: new Date().toISOString().slice(0, 10),
    usageHistory: [] as { date: string; amount: number; reference: string }[],
  };
  await kv.set(`voucher:${session.userId}:${id}`, voucher);
  return c.json({ voucher });
});

app.delete(`${BASE}/vouchers/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  await kv.del(`voucher:${session.userId}:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ---------- credits ----------
app.get(`${BASE}/credits`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`credit:${session.userId}:`);
  items.sort((a: any, b: any) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return c.json({ credits: items });
});

app.get(`${BASE}/credits/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const credit = await kv.get(`credit:${session.userId}:${c.req.param("id")}`);
  if (!credit) return c.json({ error: "Crédit introuvable" }, 404);
  return c.json({ credit });
});

app.post(`${BASE}/credits`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { amount, motif, interestRate } = body;
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) return c.json({ error: "Montant invalide" }, 400);
  if (!motif) return c.json({ error: "Motif requis" }, 400);
  const id = `CRD-${randomHex(4).toUpperCase()}`;
  const credit = {
    id,
    userId: session.userId,
    amount,
    remainingAmount: amount,
    interestRate: typeof interestRate === "number" ? interestRate : 5,
    motif: String(motif).slice(0, 200),
    status: "pending" as const,
    startDate: "",
    endDate: "",
    installments: [] as { date: string; amount: number; status: string }[],
    createdAt: new Date().toISOString(),
  };
  await kv.set(`credit:${session.userId}:${id}`, credit);
  return c.json({ credit });
});

app.delete(`${BASE}/credits/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  await kv.del(`credit:${session.userId}:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ---------- investments ----------
app.get(`${BASE}/investments`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`investment:${session.userId}:`);
  items.sort((a: any, b: any) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  return c.json({ investments: items });
});

app.get(`${BASE}/investments/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const inv = await kv.get(`investment:${session.userId}:${c.req.param("id")}`);
  if (!inv) return c.json({ error: "Investissement introuvable" }, 404);
  return c.json({ investment: inv });
});

app.post(`${BASE}/investments`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { name, amount, type, endDate } = body;
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) return c.json({ error: "Montant invalide" }, 400);
  if (!name || !type) return c.json({ error: "Champs requis" }, 400);

  const existing = await kv.getByPrefix(`tx:${session.userId}:`);
  if (computeBalance(existing) < amount) return c.json({ error: "Solde insuffisant" }, 400);

  const id = `INV-${randomHex(4).toUpperCase()}`;
  const startDate = new Date().toISOString().slice(0, 10);
  const investment = {
    id,
    userId: session.userId,
    name: String(name).slice(0, 120),
    amount,
    returns: 0,
    status: "active" as const,
    startDate,
    endDate: endDate ? String(endDate).slice(0, 10) : "",
    type: String(type).slice(0, 60),
    performance: 0,
  };
  await kv.set(`investment:${session.userId}:${id}`, investment);

  const txId = `tx_${randomHex(8)}`;
  const tx = {
    id: txId,
    userId: session.userId,
    type: "expense" as const,
    amount,
    description: `Investissement ${investment.name}`,
    status: "confirmed" as const,
    category: "investissement",
    date: new Date().toISOString(),
  };
  await kv.set(`tx:${session.userId}:${txId}`, tx);
  return c.json({ investment, transaction: tx });
});

app.delete(`${BASE}/investments/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  await kv.del(`investment:${session.userId}:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ---------- products ----------
function productStatus(stock: number): "available" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 10) return "low_stock";
  return "available";
}

app.get(`${BASE}/products`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const items = await kv.getByPrefix(`product:${session.userId}:`);
  items.sort((a: any, b: any) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return c.json({ products: items });
});

app.get(`${BASE}/products/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const item = await kv.get(`product:${session.userId}:${c.req.param("id")}`);
  if (!item) return c.json({ error: "Produit introuvable" }, 404);
  return c.json({ product: item });
});

app.post(`${BASE}/products`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const { name, description, category, price, stock, origin } = body;
  if (!name || !category) return c.json({ error: "Champs requis" }, 400);
  if (typeof price !== "number" || price < 0 || !Number.isFinite(price)) return c.json({ error: "Prix invalide" }, 400);
  if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) return c.json({ error: "Stock invalide" }, 400);
  const id = `PRD-${randomHex(4).toUpperCase()}`;
  const product = {
    id,
    userId: session.userId,
    name: String(name).slice(0, 120),
    description: String(description ?? "").slice(0, 500),
    category: String(category).slice(0, 60),
    price,
    stock,
    status: productStatus(stock),
    origin: String(origin ?? "").slice(0, 60),
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`product:${session.userId}:${id}`, product);
  return c.json({ product });
});

app.put(`${BASE}/products/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  const id = c.req.param("id");
  const existing = await kv.get(`product:${session.userId}:${id}`);
  if (!existing) return c.json({ error: "Produit introuvable" }, 404);
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Corps invalide" }, 400);
  const next = { ...existing };
  if (typeof body.name === "string") next.name = body.name.slice(0, 120);
  if (typeof body.description === "string") next.description = body.description.slice(0, 500);
  if (typeof body.category === "string") next.category = body.category.slice(0, 60);
  if (typeof body.origin === "string") next.origin = body.origin.slice(0, 60);
  if (typeof body.price === "number" && body.price >= 0 && Number.isFinite(body.price)) next.price = body.price;
  if (typeof body.stock === "number" && body.stock >= 0 && Number.isInteger(body.stock)) {
    next.stock = body.stock;
    next.status = productStatus(body.stock);
  }
  await kv.set(`product:${session.userId}:${id}`, next);
  return c.json({ product: next });
});

app.delete(`${BASE}/products/:id`, authMiddleware, async (c) => {
  const session = c.get("session") as SessionRecord;
  await kv.del(`product:${session.userId}:${c.req.param("id")}`);
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
