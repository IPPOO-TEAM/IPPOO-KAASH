import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router";
import {
  CreditCard, HandCoins, Wallet, ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, FileText, BarChart3, ChevronRight, Eye, EyeOff, Plus, QrCode
} from "lucide-react";
import { formatCFA, formatDate, getStatusColor, getStatusLabel } from "../data/mock-data";
import { AdsCarousel } from "./ads-carousel";
import { motion } from "motion/react";
import { FinanceGrowthIllustration } from "./illustrations";
import { useBalance } from "../hooks/use-balance";
import { useT } from "../i18n/language-context";
import { api, type ApiTransaction } from "../api/client";
import { useAuth } from "../auth/auth-context";

const CATEGORY_PALETTE: Record<string, string> = {
  vente: "#14B85A",
  prestation: "#3B82F6",
  investissement: "#00D4FF",
  bonus: "#8B5CF6",
  recharge: "#0EA5E9",
  transport: "#F59E0B",
  facture: "#EF4444",
  cotisation: "#F97316",
  retrait: "#6B7280",
  qr: "#A855F7",
};

function colorFor(cat: string): string {
  const key = cat.toLowerCase();
  for (const k of Object.keys(CATEGORY_PALETTE)) {
    if (key.includes(k)) return CATEGORY_PALETTE[k];
  }
  return "#6B7280";
}

export function Dashboard() {
  const t = useT();
  const { isAuthenticated, user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<"day" | "week" | "month">("month");
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const { balance } = useBalance();

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api.listTransactions()
      .then(({ transactions }) => { if (!cancelled) setTransactions(transactions); })
      .catch(() => { /* silent on dashboard */ });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const periodTx = useMemo(() => {
    const now = Date.now();
    const ms = periodFilter === "day" ? 24 * 3600 * 1000 : periodFilter === "week" ? 7 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
    return transactions.filter(tx => now - new Date(tx.date).getTime() <= ms);
  }, [transactions, periodFilter]);

  const totalIncome = periodTx.filter(tx => tx.type === "income" && tx.status === "confirmed").reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = periodTx.filter(tx => tx.type === "expense" && tx.status === "confirmed").reduce((s, tx) => s + tx.amount, 0);
  const pendingOps = transactions.filter(tx => tx.status === "pending").length;

  const activityBreakdown = useMemo(() => {
    const incomes = periodTx.filter(tx => tx.type === "income" && tx.status === "confirmed");
    const total = incomes.reduce((s, tx) => s + tx.amount, 0);
    const byCat = new Map<string, number>();
    incomes.forEach(tx => {
      const cat = tx.category || "Autre";
      byCat.set(cat, (byCat.get(cat) ?? 0) + tx.amount);
    });
    return Array.from(byCat.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([label, amount]) => ({
        label,
        amount,
        color: colorFor(label),
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      }));
  }, [periodTx]);

  const quickActions = [
    { label: t("dashboard.action.pay"), icon: CreditCard, path: "/pay", color: "#00D4FF" },
    { label: t("dashboard.action.receive"), icon: HandCoins, path: "/receive", color: "#14B85A" },
    { label: t("dashboard.action.qr"), icon: QrCode, path: "/qr", color: "#8B5CF6" },
    { label: t("dashboard.action.recharge"), icon: Plus, path: "/wallet/recharge", color: "#0EA5E9" },
    { label: t("dashboard.action.withdraw"), icon: ArrowUpRight, path: "/wallet/withdraw", color: "#14B85A" },
    { label: t("dashboard.action.bills"), icon: FileText, path: "/documents", color: "#F97316" },
  ];

  const failedRecent = transactions.filter(tx => tx.status === "failed").length;
  const alerts: { type: "warning" | "danger" | "info"; text: string; icon: typeof Clock }[] = [];
  if (pendingOps > 0) alerts.push({ type: "warning", text: t("dashboard.alerts.pending", { count: pendingOps }), icon: Clock });
  if (failedRecent > 0) alerts.push({ type: "danger", text: t("dashboard.alerts.lateCotisation"), icon: AlertTriangle });
  if (transactions.length > 0) alerts.push({ type: "info", text: t("dashboard.alerts.newStatement"), icon: BarChart3 });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("common.greeting.morning");
    if (h < 18) return t("common.greeting.afternoon");
    return t("common.greeting.evening");
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 pt-4 pb-6 space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-[#6B7280] text-[13px]">{greeting},</p>
        <h1 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
          {t("dashboard.title")}
        </h1>
      </div>

      {/* Balance Card */}
      <BalanceCard
        balance={balance}
        showBalance={showBalance}
        onToggle={() => setShowBalance(!showBalance)}
        holder={user?.fullName ?? "IPPOO MEMBER"}
        phone={user?.phone}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        pendingOps={pendingOps}
        t={t}
      />

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-3 lg:grid-cols-6 gap-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
      >
        {quickActions.map((action) => (
          <motion.div
            key={action.label}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <NavLink
              to={action.path}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-white hover:bg-gray-50 transition-all"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-[12px] text-[#1F2937] text-center">{action.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </motion.div>

      {/* Carousel publicitaire */}
      <AdsCarousel />

      {/* Period Filter — Segmented control */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
          {t("dashboard.overview")}
        </h2>
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          {(["day", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] transition-all ${
                periodFilter === p
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-[#6B7280]"
              }`}
            >
              {p === "day" ? t("dashboard.period.day") : p === "week" ? t("dashboard.period.week") : t("dashboard.period.month")}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Tiles */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { label: t("dashboard.summary.received"), value: formatCFA(totalIncome), color: "#14B85A", icon: ArrowDownLeft },
          { label: t("dashboard.summary.spent"), value: formatCFA(totalExpense), color: "#EF4444", icon: ArrowUpRight },
          { label: t("common.pending"), value: t("dashboard.summary.pendingOps", { count: pendingOps }), color: "#00D4FF", icon: Clock },
          { label: t("common.balance"), value: formatCFA(balance), color: "#14B85A", icon: Wallet },
        ].map((card) => (
          <motion.div
            key={card.label}
            className="bg-white rounded-2xl p-4"
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(15,23,42,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon size={14} style={{ color: card.color }} />
              </div>
              <span className="text-[12px] text-[#6B7280]">{card.label}</span>
            </div>
            <p className="text-[#0F172A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "15px", fontVariantNumeric: "tabular-nums" }}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 600 }}>{t("dashboard.alerts")}</h2>
          {alerts.map((alert, i) => {
            const palette =
              alert.type === "danger"
                ? { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", icon: "text-[#DC2626]" }
                : alert.type === "warning"
                ? { bg: "bg-[#FFF7ED]", text: "text-[#C2410C]", icon: "text-[#F97316]" }
                : { bg: "bg-[#F0FDF4]", text: "text-[#15803D]", icon: "text-[#14B85A]" };
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${palette.bg}`}>
                <alert.icon size={16} className={palette.icon} />
                <span className={`flex-1 text-[13px] ${palette.text}`}>{alert.text}</span>
                <ChevronRight size={14} className={`${palette.icon} opacity-60`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Breakdown */}
      <motion.div
        className="bg-white rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
            {t("dashboard.activityBreakdown")}
          </h2>
          <FinanceGrowthIllustration size={120} className="-mr-2 -my-2 hidden sm:block" />
        </div>
        <div className="space-y-4">
          {activityBreakdown.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] text-[#1F2937]">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#0F172A]" style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {formatCFA(item.amount)}
                  </span>
                  <span className="text-[11px] text-[#6B7280] tabular-nums w-8 text-right">{item.percent}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: idx * 0.08, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
            {t("dashboard.recentTransactions")}
          </h2>
          <NavLink to="/transactions" className="text-[12px] text-[#14B85A] flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {t("dashboard.seeAll")} <ChevronRight size={14} />
          </NavLink>
        </div>
        <motion.div
          className="-mx-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {transactions.length === 0 ? (
            <p className="text-[13px] text-[#6B7280] px-2 py-4">{t("tx.empty.title")}</p>
          ) : (
            transactions.slice(0, 6).map((tx) => (
            <motion.div
              key={tx.id}
              variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
            >
            <NavLink
              to={`/transactions/${tx.id}`}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-[#14B85A]/10" : "bg-[#EF4444]/10"}`}>
                {tx.type === "income" ? <ArrowDownLeft size={18} className="text-[#14B85A]" /> : <ArrowUpRight size={18} className="text-[#EF4444]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#0F172A] truncate" style={{ fontWeight: 500 }}>{tx.description}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{formatDate(tx.date.slice(0, 10))} · {tx.id.toUpperCase()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-[13px] ${tx.type === "income" ? "text-[#14B85A]" : "text-[#EF4444]"}`} style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {tx.type === "income" ? "+" : "-"}{formatCFA(tx.amount)}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] mt-0.5 ${getStatusColor(tx.status)}`}>
                  {getStatusLabel(tx.status)}
                </span>
              </div>
            </NavLink>
            </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}


interface BalanceCardProps {
  balance: number;
  showBalance: boolean;
  onToggle: () => void;
  holder: string;
  phone?: string;
  totalIncome: number;
  totalExpense: number;
  pendingOps: number;
  t: (key: string, vars?: Record<string, unknown>) => string;
}

function BalanceCard({ balance, showBalance, onToggle, holder, phone, totalIncome, totalExpense, pendingOps, t }: BalanceCardProps) {
  const last4 = (phone ?? '').replace(/\D/g, '').slice(-4).padStart(4, '0') || '0000';
  const expiry = (() => {
    const d = new Date();
    const year = String((d.getFullYear() + 4) % 100).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${month}/${year}`;
  })();
  const upperHolder = holder.toUpperCase().slice(0, 22);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="relative rounded-3xl text-white overflow-hidden"
      style={{
        aspectRatio: '1.586 / 1',
        background: 'linear-gradient(135deg, #14B85A 0%, #0E7C3F 55%, #00D4FF 130%)',
        boxShadow: '0 14px 32px -10px rgba(20, 184, 90, 0.55)',
      }}
    >
      <div aria-hidden className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)' }} />
      <div aria-hidden className="absolute -bottom-24 -left-16 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.18), transparent 60%)' }} />

      {/* Sweep / shine animation */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-120%' }}
        animate={{ x: '160%' }}
        transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.28) 55%, transparent 75%)',
          mixBlendMode: 'overlay',
        }}
      />

      <div className="relative h-full p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/75 text-[10px] tracking-[0.18em]" style={{ fontWeight: 600 }}>IPPOO CASH</p>
            <p className="text-white/90 text-[12px] mt-0.5">{t('dashboard.balance')}</p>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-full bg-white/15 text-white/95 hover:bg-white/25 transition-all"
            aria-label={showBalance ? t('dashboard.hideBalance') : t('dashboard.showBalance')}
          >
            {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>

        <div className="-mt-1">
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.85rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {showBalance ? formatCFA(balance) : '••• ••• F CFA'}
          </p>
        </div>

        {/* Chip + contactless */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-md" style={{ background: 'linear-gradient(135deg, #FCD34D, #B45309)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }}>
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px p-0.5 opacity-50">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px]"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,236,179,0.95) 0%, rgba(217,156,42,0.85) 45%, rgba(120,72,12,0.9) 100%)",
                      boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/85">
              <path d="M8 9c1.5 1 1.5 5 0 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M11 7c2.5 1.5 2.5 8 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M14 5c3.5 2 3.5 12 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] text-white/70" style={{ fontWeight: 600, letterSpacing: '0.12em' }}>VALIDE JUSQU'AU {expiry}</span>
        </div>

        {/* Card number */}
        <div className="flex items-center gap-3" style={{ fontFamily: "'Poppins', sans-serif", fontVariantNumeric: 'tabular-nums', fontWeight: 600, letterSpacing: '0.18em', fontSize: '0.95rem' }}>
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span>{last4}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-white/65 tracking-widest">TITULAIRE</p>
            <p className="text-[12.5px]" style={{ fontWeight: 600, letterSpacing: '0.04em' }}>{upperHolder}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] bg-white/18 backdrop-blur-sm px-2 py-0.5 rounded-full"><ArrowDownLeft size={11} /> {formatCFA(totalIncome)}</span>
            <span className="flex items-center gap-1 text-[11px] bg-white/18 backdrop-blur-sm px-2 py-0.5 rounded-full"><ArrowUpRight size={11} /> {formatCFA(totalExpense)}</span>
            {pendingOps > 0 && (
              <span className="flex items-center gap-1 text-[11px] bg-white/18 backdrop-blur-sm px-2 py-0.5 rounded-full"><Clock size={11} /> {pendingOps}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

