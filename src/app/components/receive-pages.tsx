import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { HandCoins, Plus, User, FileText, Hash, CheckCircle, Copy, QrCode, Send, Clock, XCircle, RotateCw, ChevronRight } from "lucide-react";
import { formatCFA, getStatusColor, getStatusLabel, formatDate } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { useT } from "../i18n/language-context";
import { api, type ApiPaymentRequest } from "../api/client";
import { sanitizeAmount, sanitizeText, validateAmount } from "../utils/validation";

// ===== PAGE 11: RECEVOIR UN PAIEMENT =====
export function ReceivePage() {
  const t = useT();
  const [amount, setAmount] = useState("");
  const [object, setObject] = useState("");
  const [payerName, setPayerName] = useState("");
  const [reference, setReference] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [createdRequest, setCreatedRequest] = useState<ApiPaymentRequest | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.listPaymentRequests()
      .then(r => setPendingCount(r.requests.filter(x => x.status === "pending").length))
      .catch(() => { /* network — ignore badge count */ });
  }, []);

  const submit = async () => {
    setError("");
    const cleanPayer = sanitizeText(payerName, 100);
    if (!cleanPayer) return setError(t("receive.errorPayer") || "Nom du payeur requis");
    if (!object) return setError(t("receive.errorObject") || "Objet requis");
    const v = validateAmount(amount);
    if (!v.ok) return setError(v.error);
    setSubmitting(true);
    try {
      const { request } = await api.createPaymentRequest({
        amount: Number(amount),
        object,
        payerName: cleanPayer,
        reference: sanitizeText(reference, 60) || undefined,
      });
      setCreatedRequest(request);
      setStep("success");
    } catch (e: any) {
      setError(e?.message || "Échec de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const shareLink = createdRequest ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay?req=${createdRequest.id}` : "";

  const copyLink = async () => {
    if (!shareLink || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard refused */ }
  };

  const sharePayload = async () => {
    if (!createdRequest || typeof navigator === "undefined") return;
    const data = {
      title: "IPPOO CASH",
      text: `Demande de paiement ${formatCFA(createdRequest.amount)} — ${createdRequest.object}`,
      url: shareLink,
    };
    if ((navigator as any).share) {
      try { await (navigator as any).share(data); } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  };

  if (step === "success" && createdRequest) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#14B85A]/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-[#14B85A]" />
        </div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("receive.requestCreated")}</h1>
        <p className="text-[#6B7280]">{t("receive.requestSent", { amount: formatCFA(createdRequest.amount), payer: createdRequest.payerName })}</p>
        <div className="bg-white rounded-2xl p-5 space-y-3" >
          <p className="text-[13px] text-[#6B7280]">{t("receive.referenceLabel")}<span style={{ fontWeight: 600 }} className="text-[#1F2937]">{createdRequest.id}</span></p>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex-1 h-10 bg-gray-50 rounded-xl text-[13px] flex items-center justify-center gap-1 hover:bg-gray-100">
              <Copy size={14} /> {copied ? "✓" : t("receive.copyLink")}
            </button>
            <NavLink to="/qr/receive" className="flex-1 h-10 bg-gray-50 rounded-xl text-[13px] flex items-center justify-center gap-1 hover:bg-gray-100">
              <QrCode size={14} /> {t("receive.qrCode")}
            </NavLink>
            <button onClick={sharePayload} className="flex-1 h-10 bg-gray-50 rounded-xl text-[13px] flex items-center justify-center gap-1 hover:bg-gray-100">
              <Send size={14} /> {t("receive.share")}
            </button>
          </div>
        </div>
        <NavLink to="/receive/requests" className="inline-block px-6 py-3 bg-[#14B85A] text-white rounded-2xl" style={{ fontWeight: 600 }}>
          {t("receive.myRequestsCta")}
        </NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={HandCoins} title={t("receive.title")} subtitle={t("receive.subtitle")} color="#14B85A" />

      <NavLink to="/receive/requests" className="flex items-center gap-3 bg-white p-4 rounded-2xl hover:shadow-md transition-all" >
        <div className="w-10 h-10 rounded-xl bg-[#14B85A]/10 flex items-center justify-center">
          <Clock size={18} className="text-[#14B85A]" />
        </div>
        <div className="flex-1">
          <span className="text-[14px]" style={{ fontWeight: 600 }}>{t("receive.myRequests")}</span>
          <p className="text-[12px] text-[#6B7280]">{t("receive.pendingCount", { count: pendingCount })}</p>
        </div>
        <ChevronRight size={16} className="text-[#6B7280]" />
      </NavLink>

      <div className="bg-white rounded-2xl p-5 space-y-4" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("receive.newRequest")}</h2>
        <div>
          <label htmlFor="recv-amount" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><HandCoins size={14} /> {t("receive.amountToReceive")}</label>
          <input
            id="recv-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(sanitizeAmount(e.target.value))}
            placeholder="0 F CFA"
            className="w-full h-14 bg-[#F1F5F9] rounded-xl px-4 text-center outline-none focus:ring-2 focus:ring-[#14B85A]"
            style={{ fontWeight: 700, fontSize: "18px" }}
          />
        </div>
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><FileText size={14} /> {t("receive.object")}</label>
          <select value={object} onChange={e => setObject(e.target.value)} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]">
            <option value="">{t("receive.objSelect")}</option>
            <option value="Vente">{t("receive.objVente")}</option>
            <option value="Prestation">{t("receive.objPrestation")}</option>
            <option value="Transport">{t("receive.objTransport")}</option>
            <option value="Autre">{t("receive.objAutre")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="recv-payer" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><User size={14} /> {t("receive.payer")}</label>
          <input id="recv-payer" value={payerName} onChange={e => setPayerName(e.target.value.slice(0, 100))} maxLength={100} placeholder={t("receive.payerPlaceholder")} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]" />
        </div>
        <div>
          <label htmlFor="recv-ref" className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><Hash size={14} /> {t("receive.refOptional")}</label>
          <input id="recv-ref" value={reference} onChange={e => setReference(e.target.value.slice(0, 60))} maxLength={60} placeholder={t("receive.refPlaceholder")} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]" />
        </div>
        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      </div>

      <button
        onClick={submit}
        disabled={submitting || !amount || !payerName || !object}
        className="w-full h-14 bg-[#14B85A] text-white rounded-2xl disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
        style={{ fontWeight: 600 }}
      >
        {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {submitting ? t("pay.processing") : t("receive.createCta")}
      </button>
    </div>
  );
}

// ===== PAGE 12: DEMANDES DE PAIEMENT (LISTE) =====
export function PaymentRequestsPage() {
  const t = useT();
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [requests, setRequests] = useState<ApiPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const { requests } = await api.listPaymentRequests();
      setRequests(requests);
    } catch (e: any) {
      setError(e?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id: string) => {
    setBusyId(id);
    try { await api.cancelPaymentRequest(id); await load(); }
    catch (e: any) { setError(e?.message || "Erreur"); }
    finally { setBusyId(null); }
  };

  const relaunch = async (id: string) => {
    setBusyId(id);
    try { await api.relaunchPaymentRequest(id); await load(); }
    catch (e: any) { setError(e?.message || "Erreur"); }
    finally { setBusyId(null); }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("receive.requests.title")}</h1>
        <NavLink to="/receive" className="px-4 py-2 bg-[#14B85A] text-white rounded-xl text-[13px] flex items-center gap-1" style={{ fontWeight: 600 }}>
          <Plus size={14} /> {t("receive.requests.new")}
        </NavLink>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "all" as const, label: t("receive.requests.filter.all") },
          { key: "pending" as const, label: t("receive.requests.filter.pending") },
          { key: "confirmed" as const, label: t("receive.requests.filter.confirmed") },
          { key: "cancelled" as const, label: t("receive.requests.filter.cancelled") },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all ${filter === f.key ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280]"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && <p className="text-[13px] text-[#6B7280]">…</p>}

      <div className="space-y-3">
        {!loading && filtered.length === 0 && (
          <p className="text-[14px] text-[#6B7280] text-center py-8">{t("receive.requests.empty") || "Aucune demande"}</p>
        )}
        {filtered.map(req => (
          <div key={req.id} className="bg-white rounded-2xl p-4" >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[14px]" style={{ fontWeight: 600 }}>{req.description}</p>
                <p className="text-[12px] text-[#6B7280]">{req.payerName} | {formatDate(req.date)}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(req.status)}`}>
                {getStatusLabel(req.status)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[18px] text-[#14B85A]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(req.amount)}</span>
              <div className="flex gap-2">
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => relaunch(req.id)}
                      disabled={busyId === req.id}
                      className="px-3 py-1.5 bg-[#14B85A]/10 text-[#0E8F45] rounded-lg text-[12px] flex items-center gap-1 disabled:opacity-50"
                      style={{ fontWeight: 600 }}
                    >
                      <RotateCw size={12} /> {t("receive.requests.relaunch")}
                    </button>
                    <button
                      onClick={() => cancel(req.id)}
                      disabled={busyId === req.id}
                      className="px-3 py-1.5 bg-[#EF4444]/10 text-[#DC2626] rounded-lg text-[12px] flex items-center gap-1 disabled:opacity-50"
                      style={{ fontWeight: 600 }}
                    >
                      <XCircle size={12} /> {t("receive.requests.cancel")}
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-2">{t("receive.refLabel", { ref: req.reference })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
