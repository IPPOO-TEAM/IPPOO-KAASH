import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, Smartphone, Clock, CheckCircle } from "lucide-react";
import { formatCFA, formatDate, getStatusColor } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { sanitizeAmount, validateAmount } from "../utils/validation";
import { api, type ApiTransaction } from "../api/client";
import { useBalance, refreshBalance } from "../hooks/use-balance";
import { toast } from "sonner";
import { useT } from "../i18n/language-context";

const COMPOSITION_COLORS: Record<string, string> = {
  Vente: "#14B85A",
  Prestation: "#3B82F6",
  QR: "#00D4FF",
  Recharge: "#8B5CF6",
  Bonus: "#EC4899",
  Autre: "#94A3B8",
};

function colorFor(category: string): string {
  if (COMPOSITION_COLORS[category]) return COMPOSITION_COLORS[category];
  const k = category.toLowerCase();
  if (k.includes("qr")) return COMPOSITION_COLORS.QR;
  if (k.includes("recharge")) return COMPOSITION_COLORS.Recharge;
  if (k.includes("vente")) return COMPOSITION_COLORS.Vente;
  if (k.includes("prest")) return COMPOSITION_COLORS.Prestation;
  return COMPOSITION_COLORS.Autre;
}

// ===== PAGE 3: PORTEFEUILLE / SOLDE =====
export function WalletPage() {
  const t = useT();
  const { balance } = useBalance();
  const [txs, setTxs] = useState<ApiTransaction[]>([]);

  useEffect(() => {
    api.listTransactions().then(r => setTxs(r.transactions)).catch(() => { /* network */ });
  }, []);

  const pendingBalance = useMemo(
    () => txs.filter(x => x.status === "pending" && x.type === "income").reduce((s, x) => s + x.amount, 0),
    [txs],
  );

  const recentEntries = useMemo(() => txs.filter(x => x.type === "income").slice(0, 4), [txs]);
  const recentExits = useMemo(() => txs.filter(x => x.type === "expense").slice(0, 4), [txs]);

  const compositionData = useMemo(() => {
    const incomes = txs.filter(x => x.type === "income" && x.status !== "failed");
    const byCat = new Map<string, number>();
    for (const x of incomes) byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amount);
    const total = Array.from(byCat.values()).reduce((s, v) => s + v, 0);
    return Array.from(byCat.entries())
      .map(([label, amount]) => ({ label, amount, percent: total ? Math.round((amount / total) * 100) : 0, color: colorFor(label) }))
      .sort((a, b) => b.amount - a.amount);
  }, [txs]);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.title")}</h1>

      {/* Solde Card */}
      <div className="bg-[#14B85A] rounded-3xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={18} className="text-white/80" />
          <span className="text-white/80 text-[13px]">{t("dashboard.balance")}</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "2rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {formatCFA(balance)}
        </p>
        <div className="mt-3 p-3 bg-white/15 rounded-xl">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white/80" />
            <span className="text-[12px] text-white/80">{t("wallet.pendingBalance")}</span>
            <span className="ml-auto text-[14px] text-white" style={{ fontWeight: 600 }}>{formatCFA(pendingBalance)}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <NavLink to="/wallet/recharge" className="flex-1 h-12 bg-[#00D4FF] text-white rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95" style={{ fontWeight: 600, fontSize: "14px" }}>
            <Plus size={18} /> {t("wallet.recharge")}
          </NavLink>
          <NavLink to="/wallet/withdraw" className="flex-1 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-white/30 transition-all" style={{ fontWeight: 600, fontSize: "14px" }}>
            <ArrowUpRight size={18} /> {t("wallet.withdraw")}
          </NavLink>
        </div>
      </div>

      {/* Composition */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.composition")}</h2>
        <div className="space-y-3">
          {compositionData.map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="flex-1 text-[13px]">{item.label}</span>
              <span className="text-[13px] text-[#6B7280]" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCFA(item.amount)}</span>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entrées récentes */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.recentIncome")}</h2>
        <div className="space-y-2">
          {recentEntries.map(tx => (
            <NavLink key={tx.id} to={`/transactions/${tx.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
              <div className="w-9 h-9 rounded-xl bg-[#14B85A]/10 flex items-center justify-center">
                <ArrowDownLeft size={16} className="text-[#14B85A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate">{tx.description}</p>
                <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date)}</p>
              </div>
              <span className="text-[13px] text-[#14B85A]" style={{ fontWeight: 600 }}>+{formatCFA(tx.amount)}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Sorties récentes */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.recentExpense")}</h2>
        <div className="space-y-2">
          {recentExits.map(tx => (
            <NavLink key={tx.id} to={`/transactions/${tx.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
              <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-[#EF4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate">{tx.description}</p>
                <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date)}</p>
              </div>
              <span className="text-[13px] text-[#EF4444]" style={{ fontWeight: 600 }}>-{formatCFA(tx.amount)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== PAGE 4: RECHARGE =====
export function RechargePage() {
  const t = useT();
  const [amount, setAmount] = useState("");
  const [operator, setOperator] = useState("mtn");
  const [step, setStep] = useState<"form" | "recap" | "success">("form");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string>("");

  const quickAmounts = [5000, 10000, 25000, 50000, 100000, 200000];

  const handleContinue = () => {
    setError("");
    const result = validateAmount(amount);
    if (!result.ok) { setError(result.error); return; }
    setStep("recap");
  };

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { transaction } = await api.createTransaction({
        type: "income",
        amount: Number(amount),
        description: `Recharge ${operator.toUpperCase()}`,
        category: "Recharge",
        status: "pending",
      });
      setReference(transaction.id);
      await refreshBalance();
      toast.success(t("wallet.opSuccess"));
      setStep("success");
    } catch (err: any) {
      setError(err?.message || "Erreur");
      toast.error(err?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#14B85A]/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-[#14B85A]" />
        </div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.recharge.success")}</h1>
        <p className="text-[#6B7280] text-[14px]">{t("wallet.recharge.successDesc", { amount: formatCFA(Number(amount)) })}</p>
        <p className="text-[12px] text-[#6B7280]">{t("wallet.recharge.referenceLabel", { n: reference })}</p>
        <div className={`inline-block px-4 py-2 rounded-xl text-[13px] ${getStatusColor("pending")}`}>
          {t("wallet.recharge.awaitingConfirmation")}
        </div>
        <div className="pt-4">
          <NavLink to="/wallet" className="inline-block px-6 py-3 bg-[#00D4FF] text-white rounded-2xl" style={{ fontWeight: 600 }}>
            {t("wallet.recharge.backCta")}
          </NavLink>
        </div>
      </div>
    );
  }

  if (step === "recap") {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.recap.title")}</h1>
        <div className="bg-white rounded-2xl p-5 space-y-4" >
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("common.amount")}</span><span style={{ fontWeight: 600 }}>{formatCFA(Number(amount))}</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("common.fees")}</span><span style={{ fontWeight: 600 }}>0 F CFA</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("wallet.recap.operator")}</span><span style={{ fontWeight: 600 }}>{operator === "mtn" ? "MTN Mobile Money" : operator === "moov" ? "Moov Money" : "Celtiis Cash"}</span></div>
          <div className="border-t pt-3 flex justify-between text-[16px]"><span style={{ fontWeight: 600 }}>{t("common.total")}</span><span style={{ fontWeight: 700 }} className="text-[#14B85A]">{formatCFA(Number(amount))}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="flex-1 h-14 bg-white border border-black/10 rounded-2xl text-[#6B7280]" style={{ fontWeight: 600 }}>{t("common.edit")}</button>
          <button onClick={handleConfirm} disabled={submitting} className="flex-1 h-14 bg-[#00D4FF] text-white rounded-2xl active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {submitting ? t("wallet.withdraw.processing") : t("common.confirm")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Plus} title={t("wallet.recharge")} subtitle={t("wallet.recharge.subtitle")} color="#00D4FF" />

      {/* Operator */}
      <div className="bg-white rounded-2xl p-5" >
        <h3 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.recharge.paymentMethod")}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "mtn", name: "MTN MoMo", color: "#FFC107" },
            { id: "moov", name: "Moov Money", color: "#0066CC" },
            { id: "celtiis", name: "Celtiis Cash", color: "#EF4444" },
          ].map(op => (
            <button
              key={op.id}
              onClick={() => setOperator(op.id)}
              className={`p-3 rounded-2xl border-2 transition-all text-center ${operator === op.id ? "border-[#00D4FF] bg-[#00D4FF]/5" : "border-transparent bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: op.color + "20" }}>
                <Smartphone size={18} style={{ color: op.color }} />
              </div>
              <span className="text-[11px]">{op.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="bg-white rounded-2xl p-5" >
        <h3 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("common.amount")}</h3>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={e => setAmount(sanitizeAmount(e.target.value))}
          placeholder={t("wallet.recharge.amountPlaceholder")}
          className="w-full h-14 bg-[#F1F5F9] rounded-2xl px-4 text-[18px] text-center outline-none focus:ring-2 focus:ring-[#00D4FF]"
          style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
        />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {quickAmounts.map(a => (
            <button key={a} onClick={() => setAmount(String(a))} className="py-2 bg-gray-50 rounded-xl text-[13px] hover:bg-[#00D4FF]/10 transition-all">
              {formatCFA(a)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-[12px] text-[#DC2626] text-center">{error}</p>}

      <button
        onClick={handleContinue}
        disabled={!amount}
        className="w-full h-14 bg-[#00D4FF] text-white rounded-2xl disabled:opacity-40 active:scale-95 transition-all"
        style={{ fontWeight: 600 }}
      >
        {t("common.continue")}
      </button>
    </div>
  );
}

// ===== PAGE 5: RETRAIT =====
export function WithdrawPage() {
  const t = useT();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mobile");
  const [step, setStep] = useState<"form" | "recap" | "success">("form");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { balance: availableBalance } = useBalance();

  const handleContinue = () => {
    setError("");
    const result = validateAmount(amount);
    if (!result.ok) { setError(result.error); return; }
    if (result.amount > availableBalance) { setError(t("wallet.withdraw.overBalance")); return; }
    setStep("recap");
  };

  const handleConfirm = () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    api.createTransaction({
      type: "expense",
      amount: Number(amount),
      description: `Retrait ${method === "mobile" ? "Mobile Money" : "Espèces"}`,
      category: "Retrait",
      status: "pending",
    })
      .then(() => { refreshBalance(); toast.success(t("wallet.opSuccess")); setStep("success"); })
      .catch((err: Error) => { setError(err.message); toast.error(err.message); })
      .finally(() => setSubmitting(false));
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#14B85A]/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-[#14B85A]" />
        </div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.withdraw.success")}</h1>
        <p className="text-[#6B7280] text-[14px]">{t("wallet.withdraw.successMsg", { amount: formatCFA(Number(amount)) })}</p>
        <NavLink to="/wallet" className="inline-block px-6 py-3 bg-[#14B85A] text-white rounded-2xl" style={{ fontWeight: 600 }}>
          {t("wallet.recharge.backCta")}
        </NavLink>
      </div>
    );
  }

  if (step === "recap") {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.withdraw.summary")}</h1>
        <div className="bg-white rounded-2xl p-5 space-y-4" >
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("common.amount")}</span><span style={{ fontWeight: 600 }}>{formatCFA(Number(amount))}</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("wallet.recap.method")}</span><span style={{ fontWeight: 600 }}>{method === "mobile" ? t("wallet.withdraw.method.mobile") : t("wallet.withdraw.method.cash")}</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("common.fees")}</span><span style={{ fontWeight: 600 }}>0 F CFA</span></div>
          <div className="border-t pt-3 flex justify-between"><span style={{ fontWeight: 600 }}>{t("common.total")}</span><span style={{ fontWeight: 700 }} className="text-[#EF4444]">{formatCFA(Number(amount))}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="flex-1 h-14 bg-white border rounded-2xl text-[#6B7280]" style={{ fontWeight: 600 }}>{t("common.edit")}</button>
          <button onClick={handleConfirm} disabled={submitting} className="flex-1 h-14 bg-[#14B85A] text-white rounded-2xl active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {submitting ? t("wallet.withdraw.processing") : t("common.confirm")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={ArrowUpRight} title={t("wallet.withdraw.title")} subtitle={t("wallet.withdraw.subtitle")} color="#3B82F6" />

      <div className="bg-white rounded-2xl p-5 space-y-4" >
        <h3 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("wallet.withdraw.method")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[{ id: "mobile", label: t("wallet.withdraw.method.mobile") }, { id: "cash", label: t("wallet.withdraw.method.cash") }].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`p-4 rounded-2xl border-2 text-[13px] transition-all ${method === m.id ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-transparent bg-gray-50"}`}
              style={{ fontWeight: 600 }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5" >
        <h3 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("common.amount")}</h3>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={e => setAmount(sanitizeAmount(e.target.value))}
          placeholder={t("wallet.withdraw.amountPlaceholder")}
          className="w-full h-14 bg-[#F1F5F9] rounded-2xl px-4 text-[18px] text-center outline-none focus:ring-2 focus:ring-[#00D4FF]"
          style={{ fontWeight: 700 }}
        />
        <p className="text-[12px] text-[#6B7280] mt-2 text-center">{t("wallet.withdraw.availableBalance", { amount: formatCFA(availableBalance) })}</p>
      </div>

      {error && <p className="text-[12px] text-[#DC2626] text-center">{error}</p>}

      <button
        onClick={handleContinue}
        disabled={!amount}
        className="w-full h-14 bg-[#14B85A] text-white rounded-2xl disabled:opacity-40 active:scale-95 transition-all"
        style={{ fontWeight: 600 }}
      >
        {t("wallet.withdraw.continueCta")}
      </button>
    </div>
  );
}
