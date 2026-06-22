import { useState, useEffect, useCallback } from "react";
import { NavLink, useParams } from "react-router";
import {
  ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Search, Download, Clock, CheckCircle, AlertTriangle
} from "lucide-react";
import { formatCFA, formatDate, getStatusColor, getStatusLabel, type Transaction } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { EmptyState, EmptyInboxIllustration, NoResultsIllustration } from "./illustrations";
import { api, type ApiTransaction } from "../api/client";
import { useAuth } from "../auth/auth-context";
import { refreshBalance } from "../hooks/use-balance";
import { useT } from "../i18n/language-context";

function apiToTransaction(t: ApiTransaction, fallbackName: string): Transaction {
  return {
    id: t.id,
    date: t.date.slice(0, 10),
    amount: t.amount,
    type: t.type,
    category: (t.category as Transaction["category"]) ?? "Autre",
    description: t.description,
    payerName: t.type === "income" ? fallbackName : "Vous",
    beneficiaryName: t.type === "income" ? "Vous" : fallbackName,
    status: t.status,
    reference: t.id.toUpperCase(),
  };
}

// ===== PAGE 13: HISTORIQUE DES TRANSACTIONS =====
export function TransactionsPage() {
  const t = useT();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled" | "failed">("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "day" | "week" | "month">("all");
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    api.listTransactions()
      .then(({ transactions }) => {
        if (cancelled) return;
        const fallbackName = user?.fullName ?? "Contrepartie";
        setLiveTransactions(transactions.map(tx => apiToTransaction(tx, fallbackName)));
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.fullName]);

  const filtered = liveTransactions.filter(tx => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return tx.description.toLowerCase().includes(s) || tx.reference.toLowerCase().includes(s) || tx.id.toLowerCase().includes(s) || tx.payerName.toLowerCase().includes(s) || tx.beneficiaryName.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={ArrowLeftRight} title={t("tx.title")} subtitle={t("tx.subtitle")} color="#14B85A" />

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t("tx.searchPlaceholder")}
          className="w-full h-12 bg-white rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#00D4FF] text-[14px]"
        />
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all" as const, label: t("tx.filter.all") },
            { key: "income" as const, label: t("tx.filter.income") },
            { key: "expense" as const, label: t("tx.filter.expense") },
          ].map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)} className={`px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all ${typeFilter === f.key ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280]"}`}>
              {f.label}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {[
            { key: "all" as const, label: t("tx.filter.statusAll") },
            { key: "confirmed" as const, label: t("tx.filter.confirmed") },
            { key: "pending" as const, label: t("tx.filter.pending") },
            { key: "failed" as const, label: t("tx.filter.failed") },
          ].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`px-3 py-2 rounded-xl text-[12px] whitespace-nowrap transition-all ${statusFilter === f.key ? "bg-[#00D4FF] text-white" : "bg-white text-[#6B7280]"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && <p className="text-[13px] text-[#6B7280]">…</p>}

      <p className="text-[13px] text-[#6B7280]">{t("tx.count", { count: filtered.length })}</p>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration={<NoResultsIllustration size={140} />}
          title={t("tx.empty.title")}
          subtitle={t("tx.empty.sub")}
        />
      ) : (
      <div className="space-y-2">
        {filtered.map(tx => (
          <NavLink
            key={tx.id}
            to={`/transactions/${tx.id}`}
            className="flex items-center gap-3 bg-white p-4 rounded-2xl hover:shadow-md transition-all"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-[#14B85A]/10" : "bg-[#EF4444]/10"}`}>
              {tx.type === "income" ? <ArrowDownLeft size={20} className="text-[#14B85A]" /> : <ArrowUpRight size={20} className="text-[#EF4444]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] truncate" style={{ fontWeight: 500 }}>{tx.description}</p>
              <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date)} | {tx.category} | {tx.reference}</p>
              {tx.module && <p className="text-[10px] text-[#3B82F6]">{tx.module}</p>}
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className={`text-[14px] ${tx.type === "income" ? "text-[#14B85A]" : "text-[#EF4444]"}`} style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {tx.type === "income" ? "+" : "-"}{formatCFA(tx.amount)}
              </p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(tx.status)}`}>
                {getStatusLabel(tx.status)}
              </span>
            </div>
          </NavLink>
        ))}
      </div>
      )}

      {/* Export */}
      <div className="flex justify-center">
        <NavLink to="/statements" className="px-6 py-3 bg-white rounded-2xl text-[13px] text-[#6B7280] flex items-center gap-2 hover:shadow-md transition-all" style={{ fontWeight: 600 }}>
          <Download size={16} /> {t("tx.downloadStatement")}
        </NavLink>
      </div>
    </div>
  );
}

// ===== PAGE 14: DETAIL TRANSACTION =====
export function TransactionDetailPage() {
  const t = useT();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [liveTx, setLiveTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<"confirm" | "refuse" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!isAuthenticated || !id) return;
    setLoading(true);
    api.getTransaction(id)
      .then(({ transaction }) => setLiveTx(apiToTransaction(transaction, user?.fullName ?? "Contrepartie")))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, user?.fullName]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status: "confirmed" | "failed") => {
    if (!id) return;
    setBusy(status === "confirmed" ? "confirm" : "refuse");
    setError("");
    try {
      await api.setTransactionStatus(id, status);
      await refreshBalance();
      load();
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const tx = liveTx;

  if (loading && !tx) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-[#14B85A]/20 border-t-[#14B85A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <EmptyState
          illustration={<NoResultsIllustration size={150} />}
          title={t("tx.notFound")}
          subtitle={t("tx.notFoundSub")}
          action={<NavLink to="/transactions" className="px-5 h-11 inline-flex items-center rounded-2xl bg-[#00D4FF] text-white text-[13px]" style={{ fontWeight: 600 }}>{t("tx.backToHistory")}</NavLink>}
        />
      </div>
    );
  }

  const timeline = [
    { label: t("tx.timeline.initiated"), date: tx.date, done: true },
    { label: t("tx.timeline.processing"), date: tx.date, done: tx.status !== "pending" },
    { label: tx.status === "confirmed" ? t("tx.timeline.confirmed") : tx.status === "failed" ? t("tx.timeline.failed") : tx.status === "cancelled" ? t("tx.timeline.cancelled") : t("tx.timeline.pending"), date: tx.date, done: tx.status !== "pending" },
  ];

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/transactions" className="flex items-center gap-2 text-[#6B7280] text-[14px] hover:text-[#1F2937]">
        ← {t("tx.backToHistory")}
      </NavLink>

      {/* Amount card */}
      <div className={`rounded-3xl p-6 text-center text-white ${tx.type === "income" ? "bg-[#14B85A]" : "bg-[#0E8F45]"}`} style={{ boxShadow: "0 12px 28px rgba(20,184,90,0.2)" }}>
        <p className="text-white/80 text-[13px] mb-1">{tx.type === "income" ? t("tx.detail.income") : t("tx.detail.payment")}</p>
        <p className="text-white" style={{ fontFamily: "'Inter', sans-serif", fontSize: "2rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {tx.type === "income" ? "+" : "-"}{formatCFA(tx.amount)}
        </p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[12px] bg-white/20 text-white`}>
          {getStatusLabel(tx.status)}
        </span>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-5 space-y-3" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("tx.detail.info")}</h2>
        {[
          { label: t("common.date"), value: formatDate(tx.date) },
          { label: t("tx.description"), value: tx.description },
          { label: t("tx.detail.payer"), value: tx.payerName },
          { label: t("tx.detail.beneficiary"), value: tx.beneficiaryName },
          { label: t("tx.category"), value: tx.category },
          { label: t("tx.reference"), value: tx.reference },
          { label: t("tx.detail.id"), value: tx.id },
          ...(tx.module ? [{ label: t("tx.detail.module"), value: tx.module }] : []),
        ].map(item => (
          <div key={item.label} className="flex justify-between text-[14px] py-1 border-b border-gray-50 last:border-0">
            <span className="text-[#6B7280]">{item.label}</span>
            <span style={{ fontWeight: 500 }} className="text-right max-w-[200px]">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("tx.detail.timeline")}</h2>
        <div className="space-y-4">
          {timeline.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-[#14B85A]" : "bg-gray-200"}`}>
                {step.done ? <CheckCircle size={14} className="text-white" /> : <Clock size={14} className="text-[#6B7280]" />}
              </div>
              <div>
                <p className="text-[14px]" style={{ fontWeight: 500 }}>{step.label}</p>
                <p className="text-[12px] text-[#6B7280]">{formatDate(step.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="h-12 bg-white border rounded-xl text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50" style={{ fontWeight: 600 }}>
          <Download size={16} /> {t("tx.actions.download")}
        </button>
        {tx.status === "pending" && (
          <button
            onClick={() => updateStatus("confirmed")}
            disabled={busy !== null}
            className="h-12 bg-[#14B85A] text-white rounded-xl text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {busy === "confirm" ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {t("tx.actions.confirm")}
          </button>
        )}
        {tx.status === "pending" && (
          <button
            onClick={() => updateStatus("failed")}
            disabled={busy !== null}
            className="h-12 bg-[#EF4444]/10 text-[#DC2626] rounded-xl text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {busy === "refuse" ? (
              <div className="w-4 h-4 border-2 border-[#DC2626]/30 border-t-[#DC2626] rounded-full animate-spin" />
            ) : (
              <AlertTriangle size={16} />
            )}
            {t("tx.actions.refuse") || "Refuser"}
          </button>
        )}
        {tx.status === "confirmed" && (
          <NavLink to="/support" className="h-12 bg-[#EF4444]/10 text-[#DC2626] rounded-xl text-[13px] flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            <AlertTriangle size={16} /> {t("tx.actions.dispute")}
          </NavLink>
        )}
      </div>
      {error && <p className="text-[13px] text-[#DC2626] text-center">{error}</p>}
    </div>
  );
}

function usePendingTransactions(filterType?: "income" | "expense") {
  const { user, isAuthenticated } = useAuth();
  const [pending, setPending] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    api.listTransactions()
      .then(({ transactions }) => {
        const fallbackName = user?.fullName ?? "Contrepartie";
        const mapped = transactions
          .filter(tx => tx.status === "pending" && (filterType ? tx.type === filterType : true))
          .map(tx => apiToTransaction(tx, fallbackName));
        setPending(mapped);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user?.fullName, filterType]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id: string, status: "confirmed" | "failed") => {
    setBusyId(id);
    setError("");
    try {
      await api.setTransactionStatus(id, status);
      await refreshBalance();
      load();
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setBusyId(null);
    }
  };

  return { pending, loading, error, busyId, decide };
}

// ===== PAGE 15: CONFIRMATION DE PAIEMENT =====
export function PaymentConfirmationPage() {
  const t = useT();
  const { pending, loading, error, busyId, decide } = usePendingTransactions("expense");

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("tx.confirm.title")}</h1>
      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && pending.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#14B85A]/20 border-t-[#14B85A] rounded-full animate-spin" />
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          illustration={<EmptyInboxIllustration size={150} />}
          title={t("tx.confirm.empty")}
          subtitle={t("tx.confirm.emptySub")}
        />
      ) : (
        pending.map(tx => (
          <div key={tx.id} className="bg-white rounded-2xl p-5">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]" style={{ fontWeight: 600 }}>{tx.description}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor("pending")}`}>{t("tx.confirm.pending")}</span>
            </div>
            <p className="text-[12px] text-[#6B7280]">{tx.payerName} → {tx.beneficiaryName} | {formatDate(tx.date)}</p>
            <p className="text-[18px] mt-2" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(tx.amount)}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => decide(tx.id, "confirmed")}
                disabled={busyId !== null}
                className="flex-1 h-10 bg-[#14B85A] text-white rounded-xl text-[13px] disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                {busyId === tx.id ? "…" : t("tx.confirm.confirm")}
              </button>
              <button
                onClick={() => decide(tx.id, "failed")}
                disabled={busyId !== null}
                className="flex-1 h-10 bg-[#EF4444]/10 text-[#DC2626] rounded-xl text-[13px] disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                {t("tx.confirm.refuse")}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ===== PAGE 16: CONFIRMATION DE TRANSACTION (BILATERALE) =====
export function TransactionConfirmationPage() {
  const t = useT();
  const { pending, loading, error, busyId, decide } = usePendingTransactions();

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("tx.bilateral.title")}</h1>
      <p className="text-[14px] text-[#6B7280]">{t("tx.bilateral.subtitle")}</p>
      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && pending.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#14B85A]/20 border-t-[#14B85A] rounded-full animate-spin" />
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          illustration={<EmptyInboxIllustration size={150} />}
          title={t("tx.confirm.empty")}
          subtitle={t("tx.confirm.emptySub")}
        />
      ) : (
        pending.map(tx => (
          <div key={tx.id} className="bg-white rounded-2xl p-5">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]" style={{ fontWeight: 600 }}>{tx.description}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor("pending")}`}>{t("tx.bilateral.required")}</span>
            </div>
            <p className="text-[12px] text-[#6B7280]">{tx.payerName} ↔ {tx.beneficiaryName}</p>
            <p className="text-[12px] text-[#6B7280]">{t("tx.reference")} : {tx.reference}</p>
            <p className="text-[18px] mt-2" style={{ fontWeight: 700 }}>{formatCFA(tx.amount)}</p>
            <div className="mt-3 p-3 bg-[#00D4FF]/5 rounded-xl">
              <p className="text-[12px] text-[#00A3CC]">{t("tx.bilateral.awaiting")}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => decide(tx.id, "confirmed")}
                disabled={busyId !== null}
                className="flex-1 h-10 bg-[#14B85A] text-white rounded-xl text-[13px] disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                {busyId === tx.id ? "…" : t("tx.bilateral.validate")}
              </button>
              <button
                onClick={() => decide(tx.id, "failed")}
                disabled={busyId !== null}
                className="flex-1 h-10 bg-white border rounded-xl text-[13px] text-[#6B7280] disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                {t("tx.bilateral.report")}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
