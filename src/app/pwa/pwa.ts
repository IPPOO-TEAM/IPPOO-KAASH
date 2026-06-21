const BRAND = "#14B85A";
const APP_NAME = "IPPOO-CASH";
const APP_SHORT = "IPPOO";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

function emit() {
  listeners.forEach(fn => fn(!!deferredPrompt));
}

export function onInstallAvailability(cb: (canInstall: boolean) => void) {
  listeners.add(cb);
  cb(!!deferredPrompt);
  return () => { listeners.delete(cb); };
}

export function canInstall(): boolean {
  return !!deferredPrompt;
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  const evt = deferredPrompt;
  deferredPrompt = null;
  emit();
  await evt.prompt();
  const choice = await evt.userChoice;
  return choice.outcome;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches
    || (navigator as any).standalone === true;
}

function ensureMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensureLink(rel: string, href: string, attrs: Record<string, string> = {}) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function buildIconDataUrl(): string {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${BRAND}"/>
  <text x="256" y="320" text-anchor="middle" font-family="Poppins, system-ui, sans-serif" font-weight="700" font-size="220" fill="#000">I</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildManifestUrl(): string {
  const icon = buildIconDataUrl();
  const manifest = {
    name: APP_NAME,
    short_name: APP_SHORT,
    description: "Portefeuille mobile IPPOO-CASH",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFC",
    theme_color: BRAND,
    icons: [
      { src: icon, sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
      { src: icon, sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" },
    ],
  };
  const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
  return URL.createObjectURL(blob);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const swSource = `
    const CACHE = 'ippoo-cash-v1';
    self.addEventListener('install', (e) => { self.skipWaiting(); });
    self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
    self.addEventListener('fetch', (event) => {
      const req = event.request;
      if (req.method !== 'GET') return;
      const url = new URL(req.url);
      if (url.origin !== self.location.origin) return;
      event.respondWith(
        caches.open(CACHE).then(async (cache) => {
          try {
            const fresh = await fetch(req);
            if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
            return fresh;
          } catch (e) {
            const cached = await cache.match(req);
            if (cached) return cached;
            throw e;
          }
        })
      );
    });
  `;
  const blob = new Blob([swSource], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  navigator.serviceWorker.register(url, { scope: "/" }).catch(() => { /* ignore */ });
}

let initialized = false;
export function setupPWA() {
  if (initialized || typeof document === "undefined") return;
  initialized = true;

  ensureMeta("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
  ensureMeta("theme-color", BRAND);
  ensureMeta("color-scheme", "light");
  ensureMeta("apple-mobile-web-app-capable", "yes");
  ensureMeta("apple-mobile-web-app-status-bar-style", "default");
  ensureMeta("apple-mobile-web-app-title", APP_SHORT);
  ensureMeta("mobile-web-app-capable", "yes");
  ensureMeta("application-name", APP_NAME);

  ensureLink("manifest", buildManifestUrl());
  ensureLink("apple-touch-icon", buildIconDataUrl());
  ensureLink("icon", buildIconDataUrl(), { type: "image/svg+xml" });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });

  registerServiceWorker();
}
