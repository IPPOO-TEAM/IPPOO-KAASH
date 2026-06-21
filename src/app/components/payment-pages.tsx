import { useState } from "react";
import { NavLink } from "react-router";
import { CreditCard, CheckCircle, User, FileText, Hash, MessageSquare, ShoppingBag, Briefcase, Shield, Zap, Package, QrCode } from "lucide-react";
import { formatCFA, orders, cotisations, serviceBills, getStatusColor, getStatusLabel, formatDate } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { EmptyState, EmptyInboxIllustration } from "./illustrations";
import { sanitizeAmount, sanitizeText, validateAmount } from "../utils/validation";
import { useT } from "../i18n/language-context";
import { api } from "../api/client";
import { refreshBalance } from "../hooks/use-balance";

// ===== PAGE 6: EFFECTUER UN PAIEMENT =====
export function PayPage() {
  const t = useT();
  const [beneficiary, setBeneficiary] = useState("");
  const [object, setObject] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"form" | "recap" | "success">("form");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const paymentObjects = [
    { value: "Vente", label: t("pay.obj.sale") },
    { value: "Prestation", label: t("pay.obj.service") },
    { value: "Transport", label: t("pay.obj.transport") },
    { value: "Cotisation", label: t("pay.obj.cotisation") },
    { value: "Facture service", label: t("pay.obj.bill") },
    { value: "Autre", label: t("pay.obj.other") },
  ];

  const handleContinue = () => {
    setError("");
    const cleanBeneficiary = sanitizeText(beneficiary, 100);
    if (!cleanBeneficiary) return setError(t("pay.errorBeneficiary"));
    if (!object) return setError(t("pay.errorObject"));
    const result = validateAmount(amount);
    if (!result.ok) return setError(result.error);
    setBeneficiary(cleanBeneficiary);
    setStep("recap");
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      const description = [object, beneficiary, reference, note].filter(Boolean).join(" — ").slice(0, 140);
      await api.createTransaction({
        type: "expense",
        amount: Number(amount),
        description,
        category: object,
      });
      await refreshBalance();
      setStep("success");
    } catch (e: any) {
      setError(e?.message || t("pay.errorGeneric") || "Échec du paiement");
      setStep("form");
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
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.success")}</h1>
        <p className="text-[#6B7280]">{t("pay.successMsg", { amount: formatCFA(Number(amount)), beneficiary })}</p>
        <NavLink to="/transactions" className="inline-block px-6 py-3 bg-[#00D4FF] text-white rounded-2xl" style={{ fontWeight: 600 }}>
          {t("pay.viewHistory")}
        </NavLink>
      </div>
    );
  }

  if (step === "recap") {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.recap.title")}</h1>
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-2xl p-4 text-[13px] text-[#DC2626] flex items-center gap-2">
          <Shield size={16} /> {t("pay.recap.warning")}
        </div>
        <div className="bg-white rounded-2xl p-5 space-y-3" >
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("pay.beneficiary")}</span><span style={{ fontWeight: 600 }}>{beneficiary}</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("pay.object")}</span><span style={{ fontWeight: 600 }}>{object}</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("common.amount")}</span><span style={{ fontWeight: 700 }} className="text-[#EF4444]">{formatCFA(Number(amount))}</span></div>
          {reference && <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("tx.reference")}</span><span style={{ fontWeight: 600 }}>{reference}</span></div>}
          {note && <div className="flex justify-between text-[14px]"><span className="text-[#6B7280]">{t("pay.note")}</span><span className="text-right max-w-[200px]" style={{ fontWeight: 600 }}>{note}</span></div>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep("form")} disabled={submitting} className="flex-1 h-14 bg-white border rounded-2xl text-[#6B7280] disabled:opacity-50" style={{ fontWeight: 600 }}>{t("common.edit")}</button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 h-14 bg-[#00D4FF] text-white rounded-2xl active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {submitting ? t("pay.processing") : t("pay.payNow")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={CreditCard} title={t("pay.title")} subtitle={t("pay.subtitle")} color="#00D4FF" />

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t("pay.quick.order"), icon: ShoppingBag, path: "/pay/order", color: "bg-[#00D4FF]" },
          { label: t("pay.quick.mission"), icon: Briefcase, path: "/pay/mission", color: "bg-[#3B82F6]" },
          { label: t("pay.quick.scan"), icon: QrCode, path: "/qr/scan", color: "bg-[#8B5CF6]" },
          { label: t("pay.quick.cotisations"), icon: Shield, path: "/pay/cotisations", color: "bg-[#14B85A]" },
          { label: t("pay.quick.bills"), icon: Zap, path: "/pay/bills", color: "bg-[#F59E0B]" },
          { label: t("pay.quick.myQr"), icon: QrCode, path: "/qr/receive", color: "bg-[#14B85A]" },
        ].map(item => (
          <NavLink key={item.label} to={item.path} className="flex items-center gap-3 bg-white p-4 rounded-2xl hover:shadow-md transition-all" >
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon size={18} className="text-white" />
            </div>
            <span className="text-[13px]" style={{ fontWeight: 600 }}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-5 space-y-4" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.free")}</h2>
        <div>
          <label htmlFor="pay-beneficiary" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><User size={14} /> {t("pay.beneficiary")}</label>
          <input id="pay-beneficiary" value={beneficiary} onChange={e => setBeneficiary(e.target.value.slice(0, 100))} placeholder={t("pay.beneficiaryPlaceholder")} maxLength={100} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#00D4FF]" />
        </div>
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><FileText size={14} /> {t("pay.object")}</label>
          <select value={object} onChange={e => setObject(e.target.value)} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#00D4FF]">
            <option value="">{t("pay.selectPlaceholder")}</option>
            {paymentObjects.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pay-amount" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><CreditCard size={14} /> {t("common.amount")}</label>
          <input
            id="pay-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(sanitizeAmount(e.target.value))}
            placeholder={t("pay.amountPlaceholder")}
            className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 text-center outline-none focus:ring-2 focus:ring-[#00D4FF]"
            style={{ fontWeight: 700, fontSize: "18px" }}
          />
        </div>
        <div>
          <label htmlFor="pay-reference" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><Hash size={14} /> {t("pay.reference")}</label>
          <input id="pay-reference" value={reference} onChange={e => setReference(e.target.value.slice(0, 60))} placeholder={t("pay.referencePlaceholder")} maxLength={60} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#00D4FF]" />
        </div>
        <div>
          <label htmlFor="pay-note" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><MessageSquare size={14} /> {t("pay.note")}</label>
          <textarea id="pay-note" value={note} onChange={e => setNote(e.target.value.slice(0, 280))} placeholder={t("pay.notePlaceholder")} maxLength={280} className="w-full bg-[#F1F5F9] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00D4FF] min-h-[80px] resize-none" />
        </div>
        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        className="w-full h-14 bg-[#00D4FF] text-white rounded-2xl active:scale-95 transition-all"
        style={{ fontWeight: 600 }}
      >
        {t("common.continue")}
      </button>
    </div>
  );
}

// ===== PAGE 7: PAIEMENT COMMANDE =====
export function PayOrderPage() {
  const t = useT();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [successId, setSuccessId] = useState<string | null>(null);
  const pendingOrders = orders.filter(o => o.paymentStatus === "pending" && !paidIds.includes(o.id));
  const order = orders.find(o => o.id === selectedOrder);

  const payOrder = async () => {
    if (!order) return;
    setSubmitting(true);
    setError("");
    try {
      await api.createTransaction({
        type: "expense",
        amount: order.total,
        description: `Commande ${order.id} — ${order.seller}`,
        category: "Commande",
      });
      await refreshBalance();
      setPaidIds(prev => [...prev, order.id]);
      setSuccessId(order.id);
      setSelectedOrder(null);
    } catch (e: any) {
      setError(e?.message || "Échec du paiement");
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#14B85A]/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-[#14B85A]" />
        </div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.success")}</h1>
        <p className="text-[#6B7280]">{successId}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setSuccessId(null)} className="px-6 py-3 bg-white border rounded-2xl" style={{ fontWeight: 600 }}>{t("common.back")}</button>
          <NavLink to="/transactions" className="px-6 py-3 bg-[#00D4FF] text-white rounded-2xl" style={{ fontWeight: 600 }}>
            {t("pay.viewHistory")}
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={ShoppingBag} title={t("pay.order.title")} subtitle={t("pay.order.subtitle")} color="#00D4FF" />

      {!selectedOrder ? (
        <div className="space-y-3">
          <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.order.pending")}</h2>
          {pendingOrders.length === 0 ? (
            <EmptyState
              illustration={<EmptyInboxIllustration size={140} />}
              title={t("pay.order.empty")}
              subtitle={t("pay.order.emptySub")}
            />
          ) : (
            pendingOrders.map(o => (
              <button key={o.id} onClick={() => setSelectedOrder(o.id)} className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all" >
                <div className="flex justify-between mb-2">
                  <span className="text-[13px]" style={{ fontWeight: 600 }}>{o.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(o.paymentStatus)}`}>{getStatusLabel(o.paymentStatus)}</span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{o.seller} → {o.buyer}</p>
                <p className="text-[16px] text-[#00D4FF] mt-1" style={{ fontWeight: 700 }}>{formatCFA(o.total)}</p>
              </button>
            ))
          )}
          {/* Show all orders too */}
          <h2 className="pt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.order.all")}</h2>
          {orders.map(o => (
            <button key={o.id} onClick={() => setSelectedOrder(o.id)} className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all" >
              <div className="flex justify-between mb-1">
                <span className="text-[13px]" style={{ fontWeight: 600 }}>{o.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(o.paymentStatus)}`}>{getStatusLabel(o.paymentStatus)}</span>
              </div>
              <p className="text-[13px] text-[#6B7280]">{o.items.map(i => i.name).join(", ")}</p>
              <p className="text-[14px] mt-1" style={{ fontWeight: 700 }}>{formatCFA(o.total)}</p>
            </button>
          ))}
        </div>
      ) : order ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5" >
            <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.order.details", { id: order.id })}</h2>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-[14px]">
                  <span>{item.name} x{item.qty}</span>
                  <span style={{ fontWeight: 600 }}>{formatCFA(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between">
                <span style={{ fontWeight: 700 }}>{t("common.total")}</span>
                <span style={{ fontWeight: 700 }} className="text-[#00D4FF]">{formatCFA(order.total)}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[13px] text-[#6B7280]">
              <p>{t("pay.order.seller", { name: order.seller })}</p>
              <p>{t("pay.order.reference", { ref: order.id })}</p>
              <p>{t("pay.order.date", { date: formatDate(order.date) })}</p>
            </div>
          </div>
          {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setSelectedOrder(null)} disabled={submitting} className="flex-1 h-14 bg-white border rounded-2xl text-[#6B7280] disabled:opacity-50" style={{ fontWeight: 600 }}>{t("common.back")}</button>
            <button onClick={payOrder} disabled={submitting} className="flex-1 h-14 bg-[#00D4FF] text-white rounded-2xl active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
              {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {submitting ? t("pay.processing") : t("pay.order.payCta", { amount: formatCFA(order.total) })}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ===== PAGE 8: PAIEMENT MISSION =====
function useInlinePay() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [paid, setPaid] = useState<string[]>([]);
  const [error, setError] = useState("");
  const pay = async (id: string, amount: number, description: string, category: string) => {
    setBusyId(id); setError("");
    try {
      await api.createTransaction({ type: "expense", amount, description, category });
      await refreshBalance();
      setPaid(prev => [...prev, id]);
    } catch (e: any) {
      setError(e?.message || "Échec du paiement");
    } finally {
      setBusyId(null);
    }
  };
  return { busyId, paid, error, pay };
}

export function PayMissionPage() {
  const t = useT();
  const { busyId, paid, error, pay } = useInlinePay();

  const missions = [
    { id: "MIS-2024-005", title: "Design graphique", client: "Entreprise ABC", amount: 75000, status: "pending" },
    { id: "MIS-2024-006", title: "Formation comptabilité PME", client: "COGEF", amount: 180000, status: "pending" },
  ];

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Briefcase} title={t("pay.mission.title")} subtitle={t("pay.mission.subtitle")} color="#3B82F6" />

      <div className="space-y-3">
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("pay.mission.pending")}</h2>
        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
        {missions.map(m => {
          const isPaid = paid.includes(m.id);
          const isBusy = busyId === m.id;
          return (
            <div key={m.id} className="bg-white rounded-2xl p-4" >
              <div className="flex justify-between mb-2">
                <span className="text-[13px]" style={{ fontWeight: 600 }}>{m.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(isPaid ? "paid" : m.status)}`}>{getStatusLabel(isPaid ? "paid" : m.status)}</span>
              </div>
              <p className="text-[12px] text-[#6B7280]">{t("pay.mission.client", { name: m.client, id: m.id })}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[16px]" style={{ fontWeight: 700 }}>{formatCFA(m.amount)}</span>
                {!isPaid && (
                  <button
                    onClick={() => pay(m.id, m.amount, `Mission ${m.id} — ${m.title}`, "Mission")}
                    disabled={isBusy}
                    className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-[13px] active:scale-95 transition-all disabled:opacity-60"
                    style={{ fontWeight: 600 }}
                  >
                    {isBusy ? t("pay.processing") : t("pay.payCta")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== PAGE 9: COTISATIONS =====
export function PayCotisationsPage() {
  const t = useT();
  const { busyId, paid, error, pay } = useInlinePay();
  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Shield} title={t("pay.cotisations.title")} subtitle={t("pay.cotisations.subtitle")} color="#14B85A" />

      <div className="space-y-3">
        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
        {cotisations.map(c => {
          const isPaid = paid.includes(c.id) || c.status === "paid";
          const isBusy = busyId === c.id;
          return (
            <div key={c.id} className="bg-white rounded-2xl p-4" >
              <div className="flex justify-between mb-1">
                <span className="text-[14px]" style={{ fontWeight: 600 }}>{c.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(isPaid ? "paid" : c.status)}`}>{getStatusLabel(isPaid ? "paid" : c.status)}</span>
              </div>
              <p className="text-[12px] text-[#6B7280]">{c.period} - {c.beneficiary}</p>
              <p className="text-[12px] text-[#6B7280]">{t("pay.cotisations.due", { date: formatDate(c.dueDate) })}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[16px]" style={{ fontWeight: 700 }}>{formatCFA(c.amount)}</span>
                {!isPaid && (
                  <button
                    onClick={() => pay(c.id, c.amount, `Cotisation ${c.name} — ${c.period}`, "Cotisation")}
                    disabled={isBusy}
                    className="px-4 py-2 bg-[#00D4FF] text-white rounded-xl text-[13px] active:scale-95 transition-all disabled:opacity-60"
                    style={{ fontWeight: 600 }}
                  >
                    {isBusy ? t("pay.processing") : t("pay.payCta")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== PAGE 10: FACTURES SERVICES =====
interface BillProvider {
  id: string;
  name: string;
  category: "electricity" | "water" | "tv" | "internet" | "mobile" | "fuel" | "insurance" | "taxes";
  hint: string;
  color: string;
}

const BILL_PROVIDERS: BillProvider[] = [
  { id: "sbee", name: "SBEE", category: "electricity", hint: "N° compteur / police", color: "#F59E0B" },
  { id: "soneb", name: "SONEB", category: "water", hint: "N° contrat", color: "#0EA5E9" },
  { id: "canal", name: "Canal+", category: "tv", hint: "N° abonné / décodeur", color: "#8B5CF6" },
  { id: "startimes", name: "StarTimes", category: "tv", hint: "N° smart card", color: "#EF4444" },
  { id: "dstv", name: "DStv", category: "tv", hint: "N° smart card", color: "#1F2937" },
  { id: "isocel", name: "ISOCEL", category: "internet", hint: "N° contrat / login", color: "#3B82F6" },
  { id: "benin-telecoms", name: "Bénin Telecoms", category: "internet", hint: "N° abonné", color: "#14B85A" },
  { id: "mtn", name: "MTN", category: "mobile", hint: "Numéro à recharger", color: "#F59E0B" },
  { id: "moov", name: "Moov Africa", category: "mobile", hint: "Numéro à recharger", color: "#0EA5E9" },
  { id: "celtiis", name: "Celtiis", category: "mobile", hint: "Numéro à recharger", color: "#8B5CF6" },
  { id: "total", name: "TotalEnergies", category: "fuel", hint: "N° carte carburant", color: "#EF4444" },
  { id: "nsia", name: "NSIA Assurances", category: "insurance", hint: "N° police", color: "#14B85A" },
  { id: "dgi", name: "DGI - Impôts", category: "taxes", hint: "N° IFU / référence", color: "#6B7280" },
];

const CATEGORY_LABEL: Record<BillProvider["category"], string> = {
  electricity: "Électricité",
  water: "Eau",
  tv: "TV / Bouquet",
  internet: "Internet",
  mobile: "Recharge mobile",
  fuel: "Carburant",
  insurance: "Assurance",
  taxes: "Impôts & taxes",
};

function ProviderForm({ provider, onCancel, onPaid }: { provider: BillProvider; onCancel: () => void; onPaid: () => void }) {
  const t = useT();
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const amt = sanitizeAmount(amount);
    const v = validateAmount(amt);
    if (!v.ok) { setError(v.message); return; }
    if (!reference.trim()) { setError("Référence requise"); return; }
    setBusy(true);
    try {
      await api.createTransaction({
        type: "expense",
        amount: amt,
        description: `Facture ${provider.name} — ${sanitizeText(reference, 60)}`,
        category: "Facture",
      });
      await refreshBalance();
      onPaid();
    } catch (e: any) {
      setError(e?.message || "Échec du paiement");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: provider.color + "1A" }}>
          <Zap size={18} style={{ color: provider.color }} />
        </div>
        <div>
          <p className="text-[14px]" style={{ fontWeight: 600 }}>{provider.name}</p>
          <p className="text-[11px] text-[#6B7280]">{CATEGORY_LABEL[provider.category]}</p>
        </div>
      </div>
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder={provider.hint}
        className="w-full h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#8B5CF6]"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        inputMode="numeric"
        placeholder="Montant (FCFA)"
        className="w-full h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#8B5CF6]"
      />
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="flex-1 h-11 bg-[#8B5CF6] text-white rounded-xl text-[13px] disabled:opacity-60" style={{ fontWeight: 600 }}>
          {busy ? t("pay.processing") : t("pay.bills.settle")}
        </button>
        <button onClick={onCancel} disabled={busy} className="flex-1 h-11 bg-white border rounded-xl text-[13px] text-[#6B7280]" style={{ fontWeight: 600 }}>
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}

export function PayBillsPage() {
  const t = useT();
  const { busyId, paid, error, pay } = useInlinePay();
  const [selected, setSelected] = useState<BillProvider | null>(null);
  const [paidProviders, setPaidProviders] = useState<string[]>([]);

  const grouped = BILL_PROVIDERS.reduce<Record<string, BillProvider[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p); return acc;
  }, {});

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Zap} title={t("pay.bills.title")} subtitle={t("pay.bills.subtitle")} color="#8B5CF6" />

      {selected ? (
        <ProviderForm
          provider={selected}
          onCancel={() => setSelected(null)}
          onPaid={() => { setPaidProviders(p => [...p, selected.id]); setSelected(null); }}
        />
      ) : (
        <div className="space-y-4">
          {(Object.keys(grouped) as BillProvider["category"][]).map(cat => (
            <div key={cat}>
              <p className="text-[12px] text-[#6B7280] mb-2 px-1" style={{ fontWeight: 600 }}>{CATEGORY_LABEL[cat]}</p>
              <div className="grid grid-cols-2 gap-2">
                {grouped[cat].map(p => {
                  const justPaid = paidProviders.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="bg-white rounded-2xl p-3 flex items-center gap-3 text-left active:scale-95 transition-all hover:shadow-md"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "1A" }}>
                        <Zap size={16} style={{ color: p.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                        {justPaid && <p className="text-[10px] text-[#14B85A]">Payé</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selected && (
        <div className="space-y-2">
          <p className="text-[12px] text-[#6B7280] px-1" style={{ fontWeight: 600 }}>Factures en cours</p>
          {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
          {serviceBills.map(bill => {
            const isPaid = paid.includes(bill.id) || bill.status === "paid";
            const isBusy = busyId === bill.id;
            return (
              <div key={bill.id} className="bg-white rounded-2xl p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-[14px]" style={{ fontWeight: 600 }}>{bill.service}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(isPaid ? "paid" : bill.status)}`}>{getStatusLabel(isPaid ? "paid" : bill.status)}</span>
                </div>
                <p className="text-[12px] text-[#6B7280]">{t("pay.bills.refLine", { period: bill.period, ref: bill.reference })}</p>
                <p className="text-[12px] text-[#6B7280]">{t("pay.cotisations.due", { date: formatDate(bill.dueDate) })}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[16px]" style={{ fontWeight: 700 }}>{formatCFA(bill.amount)}</span>
                  {!isPaid && (
                    <button
                      onClick={() => pay(bill.id, bill.amount, `Facture ${bill.service} — ${bill.reference}`, "Facture")}
                      disabled={isBusy}
                      className="px-4 py-2 bg-[#8B5CF6] text-white rounded-xl text-[13px] active:scale-95 transition-all disabled:opacity-60"
                      style={{ fontWeight: 600 }}
                    >
                      {isBusy ? t("pay.processing") : t("pay.bills.settle")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
