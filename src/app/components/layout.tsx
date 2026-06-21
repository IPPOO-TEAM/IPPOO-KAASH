import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate, useNavigation } from "react-router";
import { usePageTitle } from "../utils/use-page-title";
import { prefetchRoute } from "../routes";
import { motion, AnimatePresence } from "motion/react";
import {
  Home, CreditCard, HandCoins, ArrowLeftRight, FileText, BarChart3, Tag, Landmark, PiggyBank, Gift, TrendingUp, Package, Calculator, Settings, HelpCircle, Menu, X, Bell, User, Wallet, ChevronRight, MoreHorizontal, Receipt, ShieldCheck, Globe, QrCode
} from "lucide-react";
import { Logo } from "./logo";
import { useT } from "../i18n/language-context";

const navGroups = [
  {
    labelKey: "nav.group.main",
    labelFallback: "Principal",
    items: [
      { path: "/", labelKey: "nav.home", icon: Home },
      { path: "/wallet", labelKey: "nav.wallet", icon: Wallet },
      { path: "/pay", labelKey: "nav.pay", icon: CreditCard },
      { path: "/qr", labelKey: "nav.qr", icon: QrCode },
      { path: "/receive", labelKey: "nav.receive", icon: HandCoins },
      { path: "/transactions", labelKey: "nav.transactions", icon: ArrowLeftRight },
    ]
  },
  {
    labelKey: "nav.group.commerce",
    labelFallback: "Commerce",
    items: [
      { path: "/orders", labelKey: "nav.orders", icon: Package },
      { path: "/documents", labelKey: "nav.documents", icon: FileText },
      { path: "/statements", labelKey: "nav.statements", icon: BarChart3 },
      { path: "/shop", labelKey: "nav.shop", icon: Package },
      { path: "/vouchers", labelKey: "nav.vouchers", icon: Tag },
    ]
  },
  {
    labelKey: "nav.group.finance",
    labelFallback: "Finance",
    items: [
      { path: "/credit", labelKey: "nav.credit", icon: Landmark },
      { path: "/savings", labelKey: "nav.savings", icon: PiggyBank },
      { path: "/gains", labelKey: "nav.gains", icon: Gift },
      { path: "/investments", labelKey: "nav.investments", icon: TrendingUp },
      { path: "/accounting", labelKey: "nav.accounting", icon: Calculator },
    ]
  },
  {
    labelKey: "nav.group.system",
    labelFallback: "Système",
    items: [
      { path: "/settings", labelKey: "nav.settings", icon: Settings },
      { path: "/integrations", labelKey: "nav.integrations", icon: Globe },
      { path: "/support", labelKey: "nav.support", icon: HelpCircle },
    ]
  },
];

const bottomNavItems = [
  { path: "/", labelKey: "nav.home", icon: Home },
  { path: "/pay", labelKey: "nav.pay", icon: CreditCard },
  { path: "/qr", labelKey: "nav.qr", icon: QrCode },
  { path: "/receive", labelKey: "nav.receive", icon: HandCoins },
  { path: "/more", labelKey: "nav.more", icon: MoreHorizontal },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const t = useT();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const titleFromPath = (() => {
    const p = location.pathname;
    if (p === "/") return t("dashboard.title");
    if (p.startsWith("/wallet/recharge")) return t("wallet.recharge");
    if (p.startsWith("/wallet/withdraw")) return t("wallet.withdraw");
    if (p.startsWith("/wallet")) return t("nav.wallet");
    if (p.startsWith("/pay")) return t("nav.pay");
    if (p.startsWith("/qr/scan")) return t("qr.scan");
    if (p.startsWith("/qr/receive")) return t("qr.receive");
    if (p.startsWith("/qr/history")) return t("qr.history");
    if (p.startsWith("/qr")) return t("nav.qr");
    if (p.startsWith("/receive")) return t("nav.receive");
    if (p.startsWith("/transactions")) return t("nav.transactions");
    if (p.startsWith("/orders")) return t("nav.orders");
    if (p.startsWith("/documents")) return t("nav.documents");
    if (p.startsWith("/statements")) return t("nav.statements");
    if (p.startsWith("/shop")) return t("nav.shop");
    if (p.startsWith("/vouchers")) return t("nav.vouchers");
    if (p.startsWith("/credit")) return t("nav.credit");
    if (p.startsWith("/savings")) return t("nav.savings");
    if (p.startsWith("/gains")) return t("nav.gains");
    if (p.startsWith("/investments")) return t("nav.investments");
    if (p.startsWith("/accounting")) return t("nav.accounting");
    if (p.startsWith("/profile")) return t("nav.profile");
    if (p.startsWith("/settings")) return t("nav.settings");
    if (p.startsWith("/integrations")) return t("nav.integrations");
    if (p.startsWith("/support")) return t("nav.support");
    return "";
  })();
  usePageTitle(titleFromPath);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-gray-200 shrink-0 overflow-y-auto">
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <Logo size={40} className="shadow-lg" />
          <p
            className="text-[#14B85A]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px" }}>IPPOO CASH</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.labelKey}>
              <p className="text-[10px] tracking-widest text-[#9CA3AF] px-3 mb-2 uppercase">{t(group.labelKey)}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => prefetchRoute(item.path)}
                    onFocus={() => prefetchRoute(item.path)}
                    className={() =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] ${
                        isActive(item.path)
                          ? "bg-[#14B85A]/10 text-[#14B85A]"
                          : "text-[#4B5563] hover:text-[#1F2937] hover:bg-gray-50"
                      }`
                    }
                  >
                    <item.icon size={18} />
                    <span>{t(item.labelKey)}</span>
                    {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#14B85A] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] text-[#1F2937]">Kofi D.</p>
              <p className="text-[10px] text-[#9CA3AF]">{t("nav.role.merchantPro")}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-[280px] bg-white overflow-y-auto animate-in slide-in-from-left shadow-2xl">
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Logo size={40} />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-[#6B7280] hover:text-[#1F2937]" aria-label={t("nav.closeMenu")}>
                <X size={20} />
              </button>
            </div>
            <nav className="py-4 px-3 space-y-5">
              {navGroups.map((group) => (
                <div key={group.labelKey}>
                  <p className="text-[10px] tracking-widest text-[#9CA3AF] px-3 mb-2 uppercase">{t(group.labelKey)}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        onMouseEnter={() => prefetchRoute(item.path)}
                        onFocus={() => prefetchRoute(item.path)}
                        className={() =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] ${
                            isActive(item.path)
                              ? "bg-[#14B85A]/10 text-[#14B85A]"
                              : "text-[#4B5563] hover:text-[#1F2937] hover:bg-gray-50"
                          }`
                        }
                      >
                        <item.icon size={18} />
                        <span>{t(item.labelKey)}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* More Menu Modal (Mobile) */}
      {moreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 pb-8 max-h-[75vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("nav.moreOptions")}</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { path: "/wallet", labelKey: "nav.wallet", icon: Wallet, color: "bg-[#14B85A]" },
                { path: "/qr", labelKey: "nav.qr", icon: QrCode, color: "bg-[#00D4FF]" },
                { path: "/orders", labelKey: "nav.orders", icon: Package, color: "bg-[#00D4FF]" },
                { path: "/documents", labelKey: "nav.documents", icon: FileText, color: "bg-[#00D4FF]" },
                { path: "/statements", labelKey: "nav.statements", icon: BarChart3, color: "bg-[#14B85A]" },
                { path: "/shop", labelKey: "nav.shop", icon: Package, color: "bg-[#00D4FF]" },
                { path: "/vouchers", labelKey: "nav.vouchers", icon: Tag, color: "bg-[#14B85A]" },
                { path: "/credit", labelKey: "nav.credit", icon: Landmark, color: "bg-[#00D4FF]" },
                { path: "/savings", labelKey: "nav.savings", icon: PiggyBank, color: "bg-[#14B85A]" },
                { path: "/gains", labelKey: "nav.gains", icon: Gift, color: "bg-[#00D4FF]" },
                { path: "/investments", labelKey: "nav.investments", icon: TrendingUp, color: "bg-[#00D4FF]" },
                { path: "/accounting", labelKey: "nav.accounting", icon: Calculator, color: "bg-[#14B85A]" },
                { path: "/settings", labelKey: "nav.settings", icon: Settings, color: "bg-[#6B7280]" },
                { path: "/integrations", labelKey: "nav.integrations", icon: Globe, color: "bg-[#14B85A]" },
                { path: "/support", labelKey: "nav.support", icon: HelpCircle, color: "bg-[#14B85A]" },
                { path: "/profile", labelKey: "nav.profile", icon: User, color: "bg-[#00D4FF]" },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreMenuOpen(false)}
                  onMouseEnter={() => prefetchRoute(item.path)}
                  onFocus={() => prefetchRoute(item.path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-md`}>
                    <item.icon size={20} className="text-white" />
                  </div>
                  <span className="text-[11px] text-[#1F2937]">{t(item.labelKey)}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Route loading progress bar */}
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 overflow-hidden" aria-hidden>
            <div className="h-full bg-[#00D4FF] animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
        {/* Top Bar */}
        <header className="bg-white/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between shrink-0 z-40 fixed top-0 left-0 right-0 lg:left-[260px] border-b border-gray-100 app-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-[#1F2937] hover:bg-black/5 rounded-xl" aria-label={t("nav.openMenu")}>
              <Menu size={22} />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <Logo size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-black/5 rounded-xl transition-all" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />
            </button>
            <NavLink to="/profile" className="p-1">
              <div className="w-9 h-9 rounded-full bg-[#14B85A] flex items-center justify-center shadow-md">
                <User size={16} className="text-white" />
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-40 border-t border-gray-100"
          style={{ boxShadow: "0 -2px 20px rgba(11, 18, 32, 0.06)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-around h-[68px] px-2 pb-1">
            {bottomNavItems.map((item) => {
              const active = item.path === "/more" ? false : isActive(item.path);
              const isMore = item.path === "/more";
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (isMore) {
                      setMoreMenuOpen(true);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  onMouseEnter={() => !isMore && prefetchRoute(item.path)}
                  onFocus={() => !isMore && prefetchRoute(item.path)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all active:scale-90"
                >
                  <div
                    className={`flex items-center justify-center transition-all ${
                      active ? "bg-[#14B85A]/12 px-4 py-1 rounded-full" : ""
                    }`}
                  >
                    <item.icon size={22} className={active ? "text-[#14B85A]" : "text-[#6B7280]"} />
                  </div>
                  <span className={`text-[10px] ${active ? "text-[#14B85A]" : "text-[#6B7280]"}`} style={{ fontWeight: active ? 600 : 400 }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}