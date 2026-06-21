import { useState, useEffect, useCallback } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { Tag, Gift, Landmark, PiggyBank, TrendingUp, Plus, ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { formatCFA, formatDate, getStatusColor, getStatusLabel } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { useT } from "../i18n/language-context";
import { api, type ApiVoucher, type ApiCredit, type ApiInvestment, type ApiTransaction } from "../api/client";
import { useAuth } from "../auth/auth-context";
import { useBalance, refreshBalance } from "../hooks/use-balance";
import { toast } from "sonner";

// ===== VOUCHERS =====
export function VouchersPage() {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<"all" | "active" | "used" | "expired">("all");
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.listVouchers()
      .then(({ vouchers }) => { if (!cancelled) setVouchers(vouchers); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const filtered = filter === "all" ? vouchers : vouchers.filter(v => v.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Tag} title={t("vouchers.title")} subtitle={t("vouchers.subtitle")} color="#EC4899" />

      <div className="flex gap-2 overflow-x-auto">
        {(["all", "active", "used", "expired"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-[13px] whitespace-nowrap ${filter === f ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280]"}`}>
            {f === "all" ? t("vouchers.filter.all") : getStatusLabel(f)}
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && vouchers.length === 0 && <p className="text-[13px] text-[#6B7280]">…</p>}
      {!loading && filtered.length === 0 && <p className="text-[13px] text-[#6B7280]">Aucun bon</p>}

      <div className="space-y-3">
        {filtered.map(v => (
          <div key={v.id} className="bg-white rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]" style={{ fontWeight: 600 }}>{v.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(v.status)}`}>{getStatusLabel(v.status)}</span>
            </div>
            <p className="text-[12px] text-[#6B7280] mb-1">{t("vouchers.issuer", { issuer: v.issuer, beneficiary: v.beneficiary })}</p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-[12px] text-[#6B7280]">{t("vouchers.initialValue")}</p>
                <p className="text-[16px]" style={{ fontWeight: 700 }}>{formatCFA(v.value)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#6B7280]">{t("vouchers.remaining")}</p>
                <p className="text-[16px] text-[#14B85A]" style={{ fontWeight: 700 }}>{formatCFA(v.remainingValue)}</p>
              </div>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-2">{t("vouchers.expires", { date: formatDate(v.expiryDate) })}</p>
            {v.usageHistory.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-[11px] text-[#6B7280] mb-1">{t("vouchers.usageHistory")}</p>
                {v.usageHistory.map((u, i) => (
                  <p key={i} className="text-[11px] text-[#1F2937]">{formatDate(u.date)} - {formatCFA(u.amount)} ({u.reference})</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CREDIT =====
export function CreditPage() {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const [credits, setCredits] = useState<ApiCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.listCredits()
      .then(({ credits }) => { if (!cancelled) setCredits(credits); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const activeCredits = credits.filter(c => c.status === "active");
  const pendingCredits = credits.filter(c => c.status === "pending");
  const completedCredits = credits.filter(c => c.status === "completed");

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Landmark} title={t("credit.title")} subtitle={t("credit.subtitle")} color="#00D4FF" />

      <NavLink to="/credit/request" className="flex items-center gap-3 bg-white p-4 rounded-2xl hover:shadow-md transition-all">
        <div className="w-10 h-10 rounded-xl bg-[#00D4FF] flex items-center justify-center">
          <Plus size={18} className="text-white" />
        </div>
        <span className="text-[14px]" style={{ fontWeight: 600 }}>{t("credit.newRequest")}</span>
        <ChevronRight size={14} className="ml-auto text-[#6B7280]" />
      </NavLink>

      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && credits.length === 0 && <p className="text-[13px] text-[#6B7280]">…</p>}
      {!loading && credits.length === 0 && <p className="text-[13px] text-[#6B7280]">Aucun crédit pour le moment</p>}

      {activeCredits.length > 0 && (
        <div>
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("credit.active")}</h2>
          {activeCredits.map(c => (
            <NavLink key={c.id} to={`/credit/${c.id}`} className="block bg-white rounded-2xl p-4 mb-3 hover:shadow-md transition-all">
              <div className="flex justify-between mb-2">
                <span style={{ fontWeight: 600 }}>{c.motif}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-[11px] text-[#6B7280]">{t("credit.field.amount")}</p><p className="text-[14px]" style={{ fontWeight: 700 }}>{formatCFA(c.amount)}</p></div>
                <div><p className="text-[11px] text-[#6B7280]">{t("credit.field.remaining")}</p><p className="text-[14px] text-[#EF4444]" style={{ fontWeight: 700 }}>{formatCFA(c.remainingAmount)}</p></div>
                <div><p className="text-[11px] text-[#6B7280]">{t("credit.field.rate")}</p><p className="text-[14px]" style={{ fontWeight: 700 }}>{c.interestRate}%</p></div>
              </div>
              <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#14B85A] rounded-full" style={{ width: `${((c.amount - c.remainingAmount) / c.amount) * 100}%` }} />
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">{t("credit.repaidPercent", { percent: Math.round(((c.amount - c.remainingAmount) / c.amount) * 100) })}</p>
            </NavLink>
          ))}
        </div>
      )}

      {pendingCredits.length > 0 && (
        <div>
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("credit.pending")}</h2>
          {pendingCredits.map(c => (
            <div key={c.id} className="bg-[#00D4FF]/5 rounded-2xl p-4">
              <div className="flex justify-between mb-1">
                <span style={{ fontWeight: 600 }}>{c.motif}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
              </div>
              <p className="text-[16px]" style={{ fontWeight: 700 }}>{formatCFA(c.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {completedCredits.length > 0 && (
        <div>
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("credit.completed")}</h2>
          {completedCredits.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 opacity-60">
              <div className="flex justify-between mb-1">
                <span style={{ fontWeight: 600 }}>{c.motif}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
              </div>
              <p className="text-[14px]">{formatCFA(c.amount)} | {c.interestRate}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreditRequestPage() {
  const t = useT();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("Montant invalide"); return; }
    if (!motif.trim()) { setError("Motif requis"); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.createCredit({ amount: value, motif: motif.trim() });
      toast.success("Demande envoyée");
      navigate("/credit");
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/credit" className="text-[14px] text-[#6B7280]">{t("credit.back")}</NavLink>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("credit.request.title")}</h1>
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("credit.request.amount")}</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0 F CFA" className="w-full h-14 bg-[#F1F5F9] rounded-xl px-4 text-center outline-none focus:ring-2 focus:ring-[#00D4FF]" style={{ fontWeight: 700, fontSize: "18px" }} />
        </div>
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("credit.request.motif")}</label>
          <textarea value={motif} onChange={e => setMotif(e.target.value)} placeholder={t("credit.request.motifPlaceholder")} className="w-full bg-[#F1F5F9] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00D4FF] min-h-[100px] resize-none" />
        </div>
        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      </div>
      <button onClick={submit} disabled={submitting} className="w-full h-14 bg-[#00D4FF] text-white rounded-2xl active:scale-95 transition-all disabled:opacity-60" style={{ fontWeight: 600 }}>
        {submitting ? "…" : t("credit.request.submit")}
      </button>
    </div>
  );
}

export function CreditDetailPage() {
  const t = useT();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [credit, setCredit] = useState<ApiCredit | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    setLoading(true);
    api.getCredit(id).then(({ credit }) => setCredit(credit)).catch(() => {}).finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading && !credit) return <div className="p-8 text-center"><div className="inline-block w-8 h-8 border-4 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" /></div>;
  if (!credit) return <div className="p-8 text-center"><NavLink to="/credit" className="text-[#00D4FF]">{t("credit.back")}</NavLink></div>;

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/credit" className="text-[14px] text-[#6B7280]">{t("credit.back")}</NavLink>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{credit.motif}</h1>
      <div className="bg-white rounded-2xl p-5 space-y-3">
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("credit.field.amount")}</span><span style={{ fontWeight: 700 }}>{formatCFA(credit.amount)}</span></div>
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("credit.field.rate")}</span><span style={{ fontWeight: 600 }}>{credit.interestRate}%</span></div>
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("credit.field.remaining")}</span><span style={{ fontWeight: 700 }} className="text-[#EF4444]">{formatCFA(credit.remainingAmount)}</span></div>
        {credit.startDate && <div className="flex justify-between"><span className="text-[#6B7280]">{t("credit.field.start")}</span><span>{formatDate(credit.startDate)}</span></div>}
        {credit.endDate && <div className="flex justify-between"><span className="text-[#6B7280]">{t("credit.field.end")}</span><span>{formatDate(credit.endDate)}</span></div>}
      </div>
      {credit.installments.length > 0 && (
        <div className="bg-white rounded-2xl p-5">
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("credit.installments")}</h2>
          {credit.installments.map((inst, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-[13px]">{formatDate(inst.date)}</span>
              <span className="text-[13px]" style={{ fontWeight: 600 }}>{formatCFA(inst.amount)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(inst.status)}`}>{getStatusLabel(inst.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== SAVINGS (derived from real transactions, category=epargne) =====
function useSavingsTransactions() {
  const { isAuthenticated } = useAuth();
  const [list, setList] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    api.listTransactions()
      .then(({ transactions }) => setList(transactions.filter(tx => (tx.category || "").toLowerCase().includes("épargne") || (tx.category || "").toLowerCase().includes("epargne"))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);
  useEffect(() => { reload(); }, [reload]);
  return { list, loading, reload };
}

export function SavingsPage() {
  const t = useT();
  const { balance } = useBalance();
  const { list, loading } = useSavingsTransactions();

  const savings = list
    .filter(tx => tx.status === "confirmed")
    .reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -tx.amount), 0);
  const objective = Math.max(savings * 2, 1_000_000);
  const progress = objective > 0 ? Math.min(100, Math.round((savings / objective) * 100)) : 0;

  const history = [...list].sort((a, b) => b.date.localeCompare(a.date));
  let running = savings;
  const withRunning = history.map(tx => {
    const entry = { tx, balance: running };
    if (tx.status === "confirmed") {
      running -= tx.type === "income" ? tx.amount : -tx.amount;
    }
    return entry;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={PiggyBank} title={t("savings.title")} subtitle={t("savings.subtitle")} color="#14B85A" />

      <div className="bg-white rounded-2xl p-5">
        <p className="text-[12px] text-[#6B7280] mb-1">{t("savings.balance")}</p>
        <p className="text-[#14B85A]" style={{ fontFamily: "'Inter', sans-serif", fontSize: "2rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(savings)}</p>
        <div className="mt-3">
          <div className="flex justify-between text-[12px] text-[#6B7280] mb-1">
            <span>{t("savings.objective", { amount: formatCFA(objective) })}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#14B85A] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="text-[11px] text-[#6B7280] mt-2">Solde portefeuille : {formatCFA(balance)}</p>
        <div className="flex gap-3 mt-4">
          <NavLink to="/savings/deposit" className="flex-1 h-12 bg-[#14B85A] text-white rounded-2xl flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            <Plus size={16} /> {t("savings.deposit")}
          </NavLink>
          <NavLink to="/savings/withdraw" className="flex-1 h-12 bg-white border rounded-2xl flex items-center justify-center gap-2 text-[#6B7280]" style={{ fontWeight: 600 }}>
            <ArrowUpRight size={16} /> {t("savings.withdraw")}
          </NavLink>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5">
        <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("savings.history")}</h2>
        {loading && history.length === 0 && <p className="text-[13px] text-[#6B7280]">…</p>}
        {!loading && history.length === 0 && <p className="text-[13px] text-[#6B7280]">Aucun mouvement</p>}
        {withRunning.map(({ tx, balance: snap }) => {
          const isDeposit = tx.type === "expense"; // an expense from wallet → deposited into savings
          return (
            <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDeposit ? "bg-[#14B85A]/10" : "bg-[#EF4444]/10"}`}>
                {isDeposit ? <ArrowDownLeft size={14} className="text-[#14B85A]" /> : <ArrowUpRight size={14} className="text-[#EF4444]" />}
              </div>
              <div className="flex-1">
                <p className="text-[13px]">{isDeposit ? t("savings.depositLabel") : t("savings.withdrawLabel")}</p>
                <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date.slice(0, 10))}</p>
              </div>
              <div className="text-right">
                <p className={`text-[13px] ${isDeposit ? "text-[#14B85A]" : "text-[#EF4444]"}`} style={{ fontWeight: 600 }}>
                  {isDeposit ? "+" : "-"}{formatCFA(tx.amount)}
                </p>
                <p className="text-[11px] text-[#6B7280]">{t("savings.balanceLabel", { amount: formatCFA(snap) })}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SavingsMoveForm({ mode }: { mode: "deposit" | "withdraw" }) {
  const t = useT();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("Montant invalide"); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.createTransaction({
        type: mode === "deposit" ? "expense" : "income",
        amount: value,
        description: mode === "deposit" ? "Dépôt épargne" : "Retrait épargne",
        category: "épargne",
        status: "confirmed",
      });
      await refreshBalance();
      toast.success(mode === "deposit" ? "Dépôt effectué" : "Retrait effectué");
      navigate("/savings");
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/savings" className="text-[14px] text-[#6B7280]">{t("credit.back")}</NavLink>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{mode === "deposit" ? t("savings.depositTitle") : t("savings.withdraw")}</h1>
      <div className="bg-white rounded-2xl p-5">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t("savings.amountPlaceholder")} className="w-full h-14 bg-[#F1F5F9] rounded-xl px-4 text-center outline-none focus:ring-2 focus:ring-[#14B85A]" style={{ fontWeight: 700, fontSize: "18px" }} />
      </div>
      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      <button onClick={submit} disabled={submitting} className="w-full h-14 bg-[#14B85A] text-white rounded-2xl disabled:opacity-60" style={{ fontWeight: 600, boxShadow: "0 12px 28px rgba(20,184,90,0.3)" }}>
        {submitting ? "…" : mode === "deposit" ? t("savings.confirmDeposit") : t("savings.withdraw")}
      </button>
    </div>
  );
}

export function SavingsDepositPage() { return <SavingsMoveForm mode="deposit" />; }

// ===== GAINS (derived from real income transactions tagged bonus/gain) =====
export function GainsPage() {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const [list, setList] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.listTransactions()
      .then(({ transactions }) => {
        if (cancelled) return;
        setList(transactions.filter(tx => tx.type === "income" && /bonus|gain|commission|parrainage|fid/i.test(tx.category)));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const totalGains = list.filter(g => /gain|commission/i.test(g.category)).reduce((s, g) => s + g.amount, 0);
  const totalBonus = list.filter(g => /bonus|parrainage|fid/i.test(g.category)).reduce((s, g) => s + g.amount, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Gift} title={t("gains.title")} subtitle={t("gains.subtitle")} color="#00D4FF" />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] text-[#6B7280] mb-1">{t("gains.totalGains")}</p>
          <p className="text-[#14B85A]" style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalGains)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] text-[#6B7280] mb-1">{t("gains.totalBonus")}</p>
          <p className="text-[#00D4FF]" style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalBonus)}</p>
        </div>
      </div>

      {loading && list.length === 0 && <p className="text-[13px] text-[#6B7280]">…</p>}
      {!loading && list.length === 0 && <p className="text-[13px] text-[#6B7280]">Aucun gain ou bonus pour le moment</p>}

      <div className="space-y-3">
        {list.map(gb => {
          const isGain = /gain|commission/i.test(gb.category);
          return (
            <div key={gb.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[14px]" style={{ fontWeight: 600 }}>{gb.description}</p>
                  <p className="text-[12px] text-[#6B7280]">{gb.category} | {formatDate(gb.date.slice(0, 10))}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isGain ? "bg-[#14B85A]/10 text-[#0E8F45]" : "bg-[#00D4FF]/10 text-[#00A3CC]"}`}>
                  {isGain ? t("gains.gain") : t("gains.bonus")}
                </span>
              </div>
              <p className={`text-[16px] ${isGain ? "text-[#14B85A]" : "text-[#00D4FF]"}`} style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                +{formatCFA(gb.amount)}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-1">{t("gains.refLabel", { ref: gb.id.toUpperCase() })}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== INVESTMENTS =====
export function InvestmentsPage() {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const [investments, setInvestments] = useState<ApiInvestment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.listInvestments()
      .then(({ investments }) => { if (!cancelled) setInvestments(investments); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const activeInv = investments.filter(i => i.status === "active");
  const completedInv = investments.filter(i => i.status === "completed");
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalReturns = investments.reduce((s, i) => s + i.returns, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={TrendingUp} title={t("investments.title")} subtitle={t("investments.subtitle")} color="#00D4FF" />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] text-[#6B7280] mb-1">{t("investments.totalInvested")}</p>
          <p style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalInvested)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] text-[#6B7280] mb-1">{t("investments.returns")}</p>
          <p className="text-[#14B85A]" style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>+{formatCFA(totalReturns)}</p>
        </div>
      </div>

      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && investments.length === 0 && <p className="text-[13px] text-[#6B7280]">…</p>}
      {!loading && investments.length === 0 && <p className="text-[13px] text-[#6B7280]">Aucun investissement</p>}

      {activeInv.length > 0 && (
        <div>
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("investments.active")}</h2>
          {activeInv.map(inv => (
            <NavLink key={inv.id} to={`/investments/${inv.id}`} className="block bg-white rounded-2xl p-4 mb-3 hover:shadow-md transition-all">
              <div className="flex justify-between mb-2">
                <span style={{ fontWeight: 600 }}>{inv.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(inv.status)}`}>{getStatusLabel(inv.status)}</span>
              </div>
              <p className="text-[12px] text-[#6B7280]">{inv.type} | {formatDate(inv.startDate)}{inv.endDate ? ` → ${formatDate(inv.endDate)}` : ""}</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div><p className="text-[11px] text-[#6B7280]">{t("investments.invested")}</p><p className="text-[14px]" style={{ fontWeight: 700 }}>{formatCFA(inv.amount)}</p></div>
                <div><p className="text-[11px] text-[#6B7280]">{t("investments.returns")}</p><p className="text-[14px] text-[#14B85A]" style={{ fontWeight: 700 }}>+{formatCFA(inv.returns)}</p></div>
                <div><p className="text-[11px] text-[#6B7280]">{t("investments.perf")}</p><p className="text-[14px] text-[#00D4FF]" style={{ fontWeight: 700 }}>+{inv.performance}%</p></div>
              </div>
            </NavLink>
          ))}
        </div>
      )}

      {completedInv.length > 0 && (
        <div>
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("investments.completed")}</h2>
          {completedInv.map(inv => (
            <div key={inv.id} className="bg-white rounded-2xl p-4 opacity-70">
              <div className="flex justify-between mb-1">
                <span style={{ fontWeight: 600 }}>{inv.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(inv.status)}`}>{getStatusLabel(inv.status)}</span>
              </div>
              <p className="text-[13px]">{formatCFA(inv.amount)} → +{formatCFA(inv.returns)} ({inv.performance}%)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InvestmentDetailPage() {
  const t = useT();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [inv, setInv] = useState<ApiInvestment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    setLoading(true);
    api.getInvestment(id).then(({ investment }) => setInv(investment)).catch(() => {}).finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading && !inv) return <div className="p-8 text-center"><div className="inline-block w-8 h-8 border-4 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" /></div>;
  if (!inv) return <div className="p-8 text-center"><NavLink to="/investments" className="text-[#00D4FF]">{t("credit.back")}</NavLink></div>;

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/investments" className="text-[14px] text-[#6B7280]">{t("credit.back")}</NavLink>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{inv.name}</h1>
      <div className="bg-white rounded-2xl p-5 space-y-3">
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.amount")}</span><span style={{ fontWeight: 700 }}>{formatCFA(inv.amount)}</span></div>
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.returns")}</span><span style={{ fontWeight: 700 }} className="text-[#14B85A]">+{formatCFA(inv.returns)}</span></div>
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.performance")}</span><span style={{ fontWeight: 700 }} className="text-[#00D4FF]">+{inv.performance}%</span></div>
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.type")}</span><span>{inv.type}</span></div>
        {inv.startDate && <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.start")}</span><span>{formatDate(inv.startDate)}</span></div>}
        {inv.endDate && <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.end")}</span><span>{formatDate(inv.endDate)}</span></div>}
        <div className="flex justify-between"><span className="text-[#6B7280]">{t("investments.field.status")}</span><span className={`px-3 py-1 rounded-full text-[12px] ${getStatusColor(inv.status)}`}>{getStatusLabel(inv.status)}</span></div>
      </div>
    </div>
  );
}
