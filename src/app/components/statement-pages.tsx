import { useState, useEffect, useMemo } from "react";
import { BarChart3, Download, Share2, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { formatCFA, formatDate } from "../data/mock-data";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PageHero } from "./page-hero";
import { useBalance } from "../hooks/use-balance";
import { useT } from "../i18n/language-context";
import { api, type ApiTransaction } from "../api/client";
import { useAuth } from "../auth/auth-context";

function useTransactions() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.listTransactions()
      .then(({ transactions }) => { if (!cancelled) setTransactions(transactions); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return { transactions, loading, error };
}

const PERIOD_MS = { day: 24 * 3600 * 1000, week: 7 * 24 * 3600 * 1000, month: 30 * 24 * 3600 * 1000 } as const;

const ACTIVITY_PALETTE: Record<string, string> = {
  vente: "#14B85A",
  prestation: "#3B82F6",
  investissement: "#00D4FF",
  transport: "#F59E0B",
  bonus: "#8B5CF6",
  facture: "#EF4444",
  cotisation: "#F97316",
  recharge: "#0EA5E9",
  retrait: "#6B7280",
};
function colorFor(cat: string): string {
  const k = cat.toLowerCase();
  for (const key of Object.keys(ACTIVITY_PALETTE)) if (k.includes(key)) return ACTIVITY_PALETTE[key];
  return "#94A3B8";
}

// ===== PAGE 21: RELEVE DE COMPTE =====
export function StatementsPage() {
  const t = useT();
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const { balance } = useBalance();
  const { transactions, loading } = useTransactions();

  const periodTx = useMemo(() => {
    const now = Date.now();
    return transactions.filter(tx => now - new Date(tx.date).getTime() <= PERIOD_MS[period]);
  }, [transactions, period]);

  const totalIncome = periodTx.filter(tx => tx.type === "income" && tx.status === "confirmed").reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = periodTx.filter(tx => tx.type === "expense" && tx.status === "confirmed").reduce((s, tx) => s + tx.amount, 0);
  const startBalance = balance - totalIncome + totalExpense;

  const monthlyData = useMemo(() => {
    const buckets = new Map<string, { income: number; expense: number; ts: number }>();
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "short" });
      const existing = buckets.get(key) ?? { income: 0, expense: 0, ts: d.getTime() };
      if (tx.status === "confirmed") {
        if (tx.type === "income") existing.income += tx.amount;
        else existing.expense += tx.amount;
      }
      buckets.set(key, existing);
      (existing as any).label = label;
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => ({ month: (v as any).label, income: v.income, expense: v.expense }));
  }, [transactions]);

  const handleExport = () => {
    const rows = [
      ["Date", "Type", "Catégorie", "Description", "Montant", "Statut"],
      ...periodTx.map(tx => [tx.date.slice(0, 10), tx.type, tx.category, `"${tx.description.replace(/"/g, '""')}"`, String(tx.amount), tx.status]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `releve-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const summary = `Relevé IPPOO-CASH (${period})\nRevenus: ${formatCFA(totalIncome)}\nDépenses: ${formatCFA(totalExpense)}\nSolde: ${formatCFA(balance)}`;
    try {
      if (navigator.share) await navigator.share({ title: "Relevé IPPOO-CASH", text: summary });
      else await navigator.clipboard.writeText(summary);
    } catch { /* user cancelled */ }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={BarChart3} title={t("statements.title")} subtitle={t("statements.subtitle")} color="#8B5CF6" />

      <div className="flex gap-2">
        {(["day", "week", "month"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-5 py-2.5 rounded-xl text-[13px] transition-all ${period === p ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280]"}`} style={{ fontWeight: 600 }}>
            {p === "day" ? t("statements.period.day") : p === "week" ? t("statements.period.week") : t("statements.period.month")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><ArrowDownLeft size={16} className="text-[#14B85A]" /><span className="text-[12px] text-[#6B7280]">{t("statements.totalIncome")}</span></div>
          <p className="text-[#14B85A]" style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><ArrowUpRight size={16} className="text-[#EF4444]" /><span className="text-[12px] text-[#6B7280]">{t("statements.totalExpense")}</span></div>
          <p className="text-[#EF4444]" style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><Wallet size={16} className="text-[#0A0A0A]" /><span className="text-[12px] text-[#6B7280]">{t("statements.startBalance")}</span></div>
          <p style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(startBalance)}</p>
        </div>
        <div className="bg-[#00D4FF]/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><Wallet size={16} className="text-[#00D4FF]" /><span className="text-[12px] text-[#6B7280]">{t("statements.endBalance")}</span></div>
          <p className="text-[#00D4FF]" style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(balance)}</p>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-5">
          <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("statements.monthlyEvolution")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCFA(value)} />
              <Bar key="income" dataKey="income" fill="#14B85A" radius={[6, 6, 0, 0]} />
              <Bar key="expense" dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5">
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("statements.opsOfMonth")}</h2>
        {loading && periodTx.length === 0 ? (
          <p className="text-[13px] text-[#6B7280]">…</p>
        ) : periodTx.length === 0 ? (
          <p className="text-[13px] text-[#6B7280]">{t("tx.empty.title")}</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {periodTx.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-[#14B85A]/10" : "bg-[#EF4444]/10"}`}>
                  {tx.type === "income" ? <ArrowDownLeft size={14} className="text-[#14B85A]" /> : <ArrowUpRight size={14} className="text-[#EF4444]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate">{tx.description}</p>
                  <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date.slice(0, 10))}</p>
                </div>
                <span className={`text-[13px] ${tx.type === "income" ? "text-[#14B85A]" : "text-[#EF4444]"}`} style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {tx.type === "income" ? "+" : "-"}{formatCFA(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={handleExport} className="flex-1 h-12 bg-[#8B5CF6] text-white rounded-2xl flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
          <Download size={16} /> {t("statements.download")}
        </button>
        <button onClick={handleShare} className="flex-1 h-12 bg-white border rounded-2xl flex items-center justify-center gap-2 text-[#6B7280]" style={{ fontWeight: 600 }}>
          <Share2 size={16} /> {t("statements.share")}
        </button>
      </div>
    </div>
  );
}

// ===== PAGE 22: ETATS RECAPITULATIFS =====
export function SummaryStatesPage() {
  const t = useT();
  const { transactions, loading } = useTransactions();

  const activityData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter(tx => tx.type === "income" && tx.status === "confirmed")
      .forEach(tx => {
        const cat = tx.category || "Autre";
        map.set(cat, (map.get(cat) ?? 0) + tx.amount);
      });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value, color: colorFor(name) }));
  }, [transactions]);

  const counts = {
    confirmed: transactions.filter(tx => tx.status === "confirmed").length,
    pending: transactions.filter(tx => tx.status === "pending").length,
    failed: transactions.filter(tx => tx.status === "failed").length,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("statements.summary.title")}</h1>

      <div className="bg-white rounded-2xl p-5">
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("statements.summary.byActivity")}</h2>
        {loading ? (
          <p className="text-[13px] text-[#6B7280]">…</p>
        ) : activityData.length === 0 ? (
          <p className="text-[13px] text-[#6B7280]">{t("tx.empty.title")}</p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={activityData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                  {activityData.map(entry => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {activityData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] text-[#6B7280]">{item.name}</span>
                  <span className="text-[12px] ml-auto" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCFA(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5">
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("statements.summary.byStatus")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("statements.summary.confirmed"), count: counts.confirmed, color: "#14B85A" },
            { label: t("statements.summary.pending"), count: counts.pending, color: "#00D4FF" },
            { label: t("statements.summary.failed"), count: counts.failed, color: "#EF4444" },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: item.color + "10" }}>
              <p style={{ fontWeight: 700, fontSize: "24px", color: item.color }}>{item.count}</p>
              <p className="text-[11px] text-[#6B7280]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
