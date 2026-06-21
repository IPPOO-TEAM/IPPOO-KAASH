import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import {
  QrCode, ScanLine, CheckCircle, ArrowLeft, Copy, Share2, Download,
  Clock, User, Hash, FileText, Shield, ChevronRight, ArrowDownLeft, ArrowUpRight,
  Smartphone, Zap, RefreshCw, Flashlight, ImagePlus,
} from "lucide-react";
import { formatCFA, formatDate } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { EmptyState, NoResultsIllustration } from "./illustrations";
import { sanitizeAmount, sanitizeText, validateAmount } from "../utils/validation";
import { api, type ApiTransaction } from "../api/client";
import { refreshBalance } from "../hooks/use-balance";
import { useT } from "../i18n/language-context";

// ===== Helpers QR transactions (dérivées des vraies transactions) =====
export interface QRTransaction {
  id: string;
  date: string;
  amount: number;
  type: "paid" | "received";
  counterpart: string;
  reference: string;
  status: "confirmed" | "pending" | "failed";
  method: "scan" | "show";
}

function txToQR(tx: ApiTransaction): QRTransaction | null {
  const cat = (tx.category ?? "").toLowerCase();
  if (!cat.includes("qr")) return null;
  return {
    id: tx.id,
    date: tx.date,
    amount: tx.amount,
    type: tx.type === "income" ? "received" : "paid",
    counterpart: tx.description.split(" — ")[0] || tx.description,
    reference: tx.id,
    status: tx.status,
    method: cat.includes("scan") ? "scan" : "show",
  };
}

function useQRTransactions() {
  const [items, setItems] = useState<QRTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      const { transactions } = await api.listTransactions();
      setItems(transactions.map(txToQR).filter((x): x is QRTransaction => x !== null));
    } catch { /* network — keep previous list */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { items, loading, reload };
}

function getQRStatusColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-[#14B85A]/10 text-[#0E8F45]";
    case "pending": return "bg-[#00D4FF]/10 text-[#00A3CC]";
    case "failed": return "bg-[#EF4444]/10 text-[#DC2626]";
    default: return "bg-gray-100 text-gray-600";
  }
}

function useQRStatusLabel() {
  const t = useT();
  return (status: string) => {
    switch (status) {
      case "confirmed": return t("qr.status.confirmed");
      case "pending": return t("qr.status.pending");
      case "failed": return t("qr.status.failed");
      default: return status;
    }
  };
}

// ===== HUB =====
export function QRHubPage() {
  const t = useT();
  const getQRStatusLabel = useQRStatusLabel();
  const { items: qrTransactions } = useQRTransactions();
  const totalReceived = qrTransactions.filter(x => x.type === "received" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0);
  const totalPaid = qrTransactions.filter(x => x.type === "paid" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0);
  const pendingCount = qrTransactions.filter(x => x.status === "pending").length;

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={QrCode} title={t("qr.title")} subtitle={t("qr.subtitle")} color="#14B85A" />
      <div className="flex items-center gap-4 text-[12px] flex-wrap">
        <span className="flex items-center gap-1 text-[#14B85A]" style={{ fontWeight: 600 }}>
          <ArrowDownLeft size={14} /> +{formatCFA(totalReceived)}
        </span>
        <span className="flex items-center gap-1 text-[#EF4444]" style={{ fontWeight: 600 }}>
          <ArrowUpRight size={14} /> -{formatCFA(totalPaid)}
        </span>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-[#00A3CC]" style={{ fontWeight: 600 }}>
            <Clock size={14} /> {t("qr.pendingCount", { count: pendingCount })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NavLink to="/qr/scan" className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-[#00D4FF] flex items-center justify-center" style={{ boxShadow: "0 8px 20px rgba(0,212,255,0.3)" }}>
            <ScanLine size={30} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 600 }}>{t("qr.scan")}</p>
            <p className="text-[11px] text-[#6B7280]">{t("qr.scan.payMerchant")}</p>
          </div>
        </NavLink>
        <NavLink to="/qr/receive" className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-[#14B85A] flex items-center justify-center" style={{ boxShadow: "0 8px 20px rgba(20,184,90,0.3)" }}>
            <QrCode size={30} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 600 }}>{t("qr.receive.cta")}</p>
            <p className="text-[11px] text-[#6B7280]">{t("qr.receive.cashIn")}</p>
          </div>
        </NavLink>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("qr.feat.bill"), icon: FileText, path: "/qr/receive", color: "bg-[#8B5CF6]" },
          { label: t("qr.feat.fixed"), icon: Smartphone, path: "/qr/receive", color: "bg-[#00D4FF]" },
          { label: t("qr.feat.history"), icon: Clock, path: "/qr/history", color: "bg-[#14B85A]" },
        ].map(item => (
          <NavLink key={item.label} to={item.path} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon size={18} className="text-white" />
            </div>
            <span className="text-[11px] text-[#1F2937]">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.how.title")}</h2>
        <div className="space-y-3">
          {[
            { step: "1", title: t("qr.how.toPay"), desc: t("qr.how.toPayDesc"), icon: ScanLine, color: "bg-[#00D4FF]" },
            { step: "2", title: t("qr.how.toReceive"), desc: t("qr.how.toReceiveDesc"), icon: QrCode, color: "bg-[#14B85A]" },
            { step: "3", title: t("qr.how.instant"), desc: t("qr.how.instantDesc"), icon: Zap, color: "bg-[#8B5CF6]" },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                <item.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] text-[#1F2937]" style={{ fontWeight: 600 }}>{item.title}</p>
                <p className="text-[12px] text-[#6B7280]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.recentTx")}</h2>
          <NavLink to="/qr/history" className="text-[#14B85A] text-[13px] flex items-center gap-1" style={{ fontWeight: 600 }}>
            {t("dashboard.seeAll")} <ChevronRight size={14} />
          </NavLink>
        </div>
        <div className="space-y-2">
          {qrTransactions.length === 0 && (
            <p className="text-[13px] text-[#6B7280] text-center py-4">{t("qr.history.empty")}</p>
          )}
          {qrTransactions.slice(0, 4).map(tx => (
            <div key={tx.id} className="bg-white rounded-2xl p-4 flex items-center gap-3" >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "received" ? "bg-[#14B85A]/10" : "bg-[#EF4444]/10"}`}>
                {tx.type === "received" ? <ArrowDownLeft size={18} className="text-[#14B85A]" /> : <ArrowUpRight size={18} className="text-[#EF4444]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate" style={{ fontWeight: 600 }}>{tx.counterpart}</p>
                <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date)} · {tx.method === "scan" ? t("qr.viaScan") : t("qr.viaMyQr")}</p>
              </div>
              <div className="text-right">
                <p className={`text-[14px] ${tx.type === "received" ? "text-[#14B85A]" : "text-[#EF4444]"}`} style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {tx.type === "received" ? "+" : "-"}{formatCFA(tx.amount)}
                </p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getQRStatusColor(tx.status)}`}>{getQRStatusLabel(tx.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== QR payload parsing =====
type ScannedPayload = { merchant: string; amount: number; reference: string; description?: string };

function parseQR(raw: string): ScannedPayload | null {
  // Try JSON IPPOO format
  try {
    const o = JSON.parse(raw);
    if (o && (o.app === "IPPOO-CASH" || o.merchant)) {
      const amount = Number(o.amount);
      if (!Number.isFinite(amount) || amount <= 0) return null;
      return {
        merchant: String(o.merchant || "Marchand"),
        amount,
        reference: String(o.reference || "QR-" + Date.now().toString(36).toUpperCase()),
        description: o.description ? String(o.description) : undefined,
      };
    }
  } catch { /* not JSON */ }
  // Fallback: URL with query params ?amount=...&merchant=...
  try {
    const u = new URL(raw);
    const amt = Number(u.searchParams.get("amount") ?? u.searchParams.get("a"));
    const merchant = u.searchParams.get("merchant") ?? u.searchParams.get("m") ?? u.hostname;
    if (Number.isFinite(amt) && amt > 0) {
      return {
        merchant,
        amount: amt,
        reference: u.searchParams.get("ref") ?? `QR-${Date.now().toString(36).toUpperCase()}`,
        description: u.searchParams.get("desc") ?? undefined,
      };
    }
  } catch { /* not URL */ }
  return null;
}

// ===== SCANNER =====
export function QRScanPage() {
  const t = useT();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<"scan" | "confirm" | "pin" | "success">("scan");
  const [scannedData, setScannedData] = useState<ScannedPayload | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [flashOn, setFlashOn] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(tr => tr.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(t("qr.scan.noCamera") || "Caméra non disponible — utilisez l'import depuis la galerie.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();
      tick();
    } catch (e: any) {
      setCameraError(e?.message || "Impossible d'ouvrir la caméra");
    }
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { rafRef.current = requestAnimationFrame(tick); return; }
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const w = video.videoWidth, h = video.videoHeight;
      if (w && h) {
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
          if (code && code.data) {
            const parsed = parseQR(code.data);
            if (parsed) {
              stopCamera();
              setScannedData(parsed);
              setStep("confirm");
              return;
            }
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [stopCamera]);

  useEffect(() => {
    if (step === "scan") startCamera();
    return stopCamera;
  }, [step, startCamera, stopCamera]);

  const toggleFlash = async () => {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const caps = (track.getCapabilities?.() as any) || {};
    if (!caps.torch) { setCameraError("Flash non supporté"); return; }
    try {
      await track.applyConstraints({ advanced: [{ torch: !flashOn } as any] });
      setFlashOn(!flashOn);
    } catch { /* device refused */ }
  };

  const onFileChosen = async (file: File) => {
    setCameraError("");
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(data.data, canvas.width, canvas.height);
        if (!code) { setCameraError(t("qr.scan.notFound") || "Aucun QR détecté dans l'image"); return; }
        const parsed = parseQR(code.data);
        if (!parsed) { setCameraError(t("qr.scan.invalid") || "QR non reconnu"); return; }
        stopCamera();
        setScannedData(parsed);
        setStep("confirm");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const confirmPin = async () => {
    if (!scannedData || pin.length < 4) return;
    setSubmitting(true);
    setPinError("");
    try {
      await api.verifyPin(pin);
      await api.createTransaction({
        type: "expense",
        amount: scannedData.amount,
        description: `QR Scan — ${scannedData.merchant} (${scannedData.reference})`,
        category: "QR Scan",
      });
      await refreshBalance();
      setStep("success");
    } catch (e: any) {
      setPinError(e?.message || "PIN incorrect");
      setPin("");
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
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.scan.success")}</h1>
        <p className="text-[#6B7280]">{t("qr.scan.successMsg", { amount: formatCFA(scannedData?.amount || 0), merchant: scannedData?.merchant || "" })}</p>
        <div className="bg-white rounded-2xl p-5 space-y-3 text-left" >
          <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">{t("tx.reference")}</span><span style={{ fontWeight: 600 }}>{scannedData?.reference}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">{t("qr.scan.method")}</span><span style={{ fontWeight: 600 }}>{t("qr.scan.viaQr")}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">{t("common.date")}</span><span style={{ fontWeight: 600 }}>{formatDate(new Date().toISOString())}</span></div>
        </div>
        <div className="flex gap-3">
          <NavLink to="/qr" className="flex-1 h-12 bg-white border border-gray-200 rounded-2xl text-[#6B7280] flex items-center justify-center text-[14px]" style={{ fontWeight: 600 }}>{t("qr.scan.backToHub")}</NavLink>
          <NavLink to="/transactions" className="flex-1 h-12 bg-[#14B85A] text-white rounded-2xl flex items-center justify-center text-[14px]" style={{ fontWeight: 600 }}>{t("qr.scan.viewHistory")}</NavLink>
        </div>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
        <button onClick={() => { setStep("confirm"); setPin(""); setPinError(""); }} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937]">
          <ArrowLeft size={20} /> {t("common.back")}
        </button>
        <div className="text-center space-y-2 py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#14B85A]/10 flex items-center justify-center mb-4">
            <Shield size={28} className="text-[#14B85A]" />
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.scan.confirmTitle")}</h1>
          <p className="text-[#6B7280] text-[13px]">{t("qr.scan.enterPin")}</p>
          <p className="text-[#EF4444]" style={{ fontWeight: 700, fontSize: "20px" }}>{formatCFA(scannedData?.amount || 0)}</p>
          <p className="text-[#6B7280] text-[13px]">{t("qr.scan.toward", { merchant: scannedData?.merchant || "" })}</p>
        </div>

        <div className="flex justify-center gap-3 py-4">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-[24px] transition-all ${pin.length > i ? "border-[#14B85A] bg-[#14B85A]/5" : "border-gray-200"}`}
              style={{ fontWeight: 700 }}
            >
              {pin.length > i ? "●" : ""}
            </div>
          ))}
        </div>

        {pinError && <p className="text-[13px] text-[#DC2626] text-center">{pinError}</p>}

        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, i) => (
            <button
              key={i}
              onClick={() => {
                if (key === null || submitting) return;
                if (key === "del") { setPin(p => p.slice(0, -1)); return; }
                const next = (pin + key.toString()).slice(0, 6);
                setPin(next);
              }}
              disabled={key === null || submitting}
              className={`h-14 rounded-2xl text-[20px] transition-all ${key === null ? "invisible" : key === "del" ? "bg-gray-50 text-[#6B7280] text-[14px]" : "bg-white hover:bg-gray-50 active:bg-gray-100 text-[#1F2937]"}`}
              style={{ fontWeight: 600, boxShadow: key !== null ? "0 2px 4px rgba(0,0,0,0.04)" : "none" }}
            >
              {key === "del" ? "←" : key === null ? "" : key}
            </button>
          ))}
        </div>

        <button
          onClick={confirmPin}
          disabled={pin.length < 4 || submitting}
          className="w-full h-14 bg-[#14B85A] text-white rounded-2xl disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ fontWeight: 600 }}
        >
          {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {submitting ? t("pay.processing") : t("common.confirm")}
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
        <button onClick={() => { setScannedData(null); setStep("scan"); }} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937]">
          <ArrowLeft size={20} /> {t("qr.scan.rescanAgain")}
        </button>

        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center mb-3">
            <CheckCircle size={28} className="text-[#00D4FF]" />
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.scan.detectedTitle")}</h1>
          <p className="text-[#6B7280] text-[13px]">{t("qr.scan.verifyInfo")}</p>
        </div>

        <div className="bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-2xl p-4 text-[13px] text-[#DC2626] flex items-center gap-2">
          <Shield size={16} /> {t("qr.scan.verifyBeneficiary")}
        </div>

        <div className="bg-white rounded-2xl p-5 space-y-4" >
          <div className="text-center border-b border-gray-100 pb-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#14B85A] flex items-center justify-center mb-2">
              <User size={22} className="text-white" />
            </div>
            <p className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{scannedData?.merchant}</p>
            <p className="text-[12px] text-[#6B7280]">{t("qr.scan.merchantVerified")}</p>
          </div>
          <div className="text-center py-2">
            <p className="text-[12px] text-[#6B7280] mb-1">{t("qr.scan.amountToPay")}</p>
            <p className="text-[#EF4444]" style={{ fontWeight: 700, fontSize: "28px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(scannedData?.amount || 0)}</p>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-[#6B7280]">{t("tx.reference")}</span><span style={{ fontWeight: 600 }}>{scannedData?.reference}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">{t("qr.scan.method")}</span><span style={{ fontWeight: 600 }}>{t("qr.scan.method2")}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">{t("common.fees")}</span><span className="text-[#14B85A]" style={{ fontWeight: 600 }}>{t("qr.scan.feesFree")}</span></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setScannedData(null); setStep("scan"); }} className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl text-[#6B7280]" style={{ fontWeight: 600 }}>{t("common.cancel")}</button>
          <button onClick={() => setStep("pin")} className="flex-1 h-14 bg-[#00D4FF] text-white rounded-2xl active:scale-95 transition-all" style={{ fontWeight: 600 }}>{t("common.confirm")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => { stopCamera(); navigate("/qr"); }} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937]">
          <ArrowLeft size={20} /> {t("common.back")}
        </button>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.1rem" }}>{t("qr.scan.title")}</h1>
        <div className="w-10" />
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] aspect-square" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-56 h-56">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#00D4FF] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#00D4FF] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#00D4FF] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#00D4FF] rounded-br-lg" />
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/80 text-[13px]">{t("qr.scan.placeFrame")}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
            <span className="text-[11px] text-white/50">{t("qr.scan.searching")}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={toggleFlash} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${flashOn ? "bg-[#00D4FF]" : "bg-white/20"}`} aria-pressed={flashOn} aria-label={flashOn ? t("qr.scan.flashOff") : t("qr.scan.flashOn")}>
            <Flashlight size={18} className="text-white" />
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-2xl p-3 text-[12px] text-[#DC2626]">{cameraError}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { stopCamera(); startCamera(); }}
          className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-2xl text-[#1F2937] hover:bg-gray-50 transition-all text-[13px]"
          style={{ fontWeight: 600 }}
        >
          <RefreshCw size={16} /> {t("qr.scan.rescan")}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-2xl text-[#1F2937] hover:bg-gray-50 transition-all text-[13px]"
          style={{ fontWeight: 600 }}
        >
          <ImagePlus size={16} /> {t("qr.scan.fromGallery")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFileChosen(f); e.target.value = ""; }}
        />
      </div>

      <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/10 rounded-2xl p-4">
        <p className="text-[12px] text-[#00A3CC]" style={{ fontWeight: 600 }}>{t("qr.scan.tipsTitle")}</p>
        <ul className="text-[11px] text-[#6B7280] mt-2 space-y-1">
          <li>• {t("qr.scan.tip1")}</li>
          <li>• {t("qr.scan.tip2")}</li>
          <li>• {t("qr.scan.tip3")}</li>
        </ul>
      </div>
    </div>
  );
}

// ===== GÉNÉRER QR =====
export function QRReceivePage() {
  const t = useT();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [merchantName, setMerchantName] = useState("");
  const [reference, setReference] = useState<string>("");
  const qrSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    api.me().then(({ user }) => setMerchantName(user.fullName)).catch(() => { /* logged out — leave blank */ });
  }, []);

  const handleGenerate = async () => {
    setError("");
    const result = validateAmount(amount);
    if (!result.ok) return setError(result.error);
    setSubmitting(true);
    try {
      const { transaction } = await api.createTransaction({
        type: "income",
        amount: result.amount,
        description: description || t("qr.receive.previewDesc"),
        category: "QR Code",
        status: "pending",
      });
      setReference(transaction.id);
      await refreshBalance();
      setGenerated(true);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const qrValue = useMemo(() => JSON.stringify({
    app: "IPPOO-CASH",
    merchant: merchantName || "Marchand",
    amount: Number(amount) || 0,
    description: description || "Paiement QR Code",
    reference: reference || "PENDING",
    currency: "XOF",
    timestamp: new Date().toISOString(),
  }), [merchantName, amount, description, reference]);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(reference || qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard refused */ }
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;
    const data = { title: "IPPOO CASH", text: `Demande ${formatCFA(Number(amount))} — ${description || ""}`, url: typeof window !== "undefined" ? window.location.href : "" };
    if ((navigator as any).share) {
      try { await (navigator as any).share(data); } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const svg = qrSvgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reference || "ippoo-qr"}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (generated && amount) {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
        <button onClick={() => setGenerated(false)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937]">
          <ArrowLeft size={20} /> {t("common.edit")}
        </button>

        <div className="text-center">
          <h1 className="mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.receive.title")}</h1>
          <p className="text-[#6B7280] text-[13px]">{t("qr.receive.subtitle")}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 text-center" style={{ boxShadow: "0 8px 24px rgba(11,18,32,0.08)" }}>
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#14B85A]/20 mb-4">
            <QRCodeSVG ref={qrSvgRef as any} value={qrValue} size={200} level="H" includeMargin={false} bgColor="#FFFFFF" fgColor="#0A4D2C" />
          </div>
          <div className="space-y-1">
            <p className="text-[#14B85A]" style={{ fontWeight: 700, fontSize: "28px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(Number(amount))}</p>
            {description && <p className="text-[#6B7280] text-[13px]">{description}</p>}
            <p className="text-[11px] text-[#9CA3AF]">{t("qr.receive.refLabel", { ref: reference })}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 flex items-center gap-3" >
          <div className="w-10 h-10 rounded-full bg-[#14B85A] flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 600 }}>{merchantName || "—"}</p>
            <p className="text-[11px] text-[#6B7280]">{t("qr.receive.merchantPro")}</p>
          </div>
          <div className="px-2 py-1 bg-[#14B85A]/10 rounded-full">
            <span className="text-[10px] text-[#0E8F45]" style={{ fontWeight: 600 }}>{t("qr.receive.verified")}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleCopy} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:shadow-md transition-all" aria-label={t("qr.receive.copyAriaLabel")}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${copied ? "bg-[#14B85A]" : "bg-gray-100"}`}>
              {copied ? <CheckCircle size={18} className="text-white" /> : <Copy size={18} className="text-[#6B7280]" />}
            </div>
            <span className="text-[11px] text-[#1F2937]">{copied ? t("qr.receive.copied") : t("qr.receive.copy")}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:shadow-md transition-all" aria-label={t("qr.receive.shareAriaLabel")}>
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center">
              <Share2 size={18} className="text-[#00D4FF]" />
            </div>
            <span className="text-[11px] text-[#1F2937]">{t("qr.receive.share")}</span>
          </button>
          <button onClick={handleDownload} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:shadow-md transition-all" aria-label={t("qr.receive.downloadAriaLabel")}>
            <div className="w-10 h-10 rounded-xl bg-[#14B85A]/10 flex items-center justify-center">
              <Download size={18} className="text-[#14B85A]" />
            </div>
            <span className="text-[11px] text-[#1F2937]">{t("qr.receive.download")}</span>
          </button>
        </div>

        <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/10 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={18} className="text-[#00D4FF] shrink-0" />
          <div>
            <p className="text-[13px] text-[#1F2937]" style={{ fontWeight: 600 }}>{t("qr.receive.awaitingPayment")}</p>
            <p className="text-[11px] text-[#6B7280]">{t("qr.receive.expiresIn")}</p>
          </div>
        </div>

        <NavLink to="/qr" className="block w-full h-14 bg-[#14B85A] text-white rounded-2xl flex items-center justify-center text-[14px] active:scale-95 transition-all" style={{ fontWeight: 600, boxShadow: "0 12px 28px rgba(20,184,90,0.3)" }}>
          {t("qr.receive.done")}
        </NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/qr" className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937]">
        <ArrowLeft size={20} /> {t("common.back")}
      </NavLink>

      <PageHero icon={QrCode} title={t("qr.receive.formTitle")} subtitle={t("qr.receive.formSubtitle")} color="#14B85A" />

      <div>
        <p className="text-[13px] text-[#6B7280] mb-2">{t("qr.receive.quickAmounts")}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1000, 2500, 5000, 10000, 25000, 50000].map(val => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className={`px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all ${amount === val.toString() ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280] hover:bg-gray-50"}`}
              style={{ fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}
            >
              {formatCFA(val)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 space-y-4" >
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><QrCode size={14} /> {t("qr.amountToReceive")}</label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(sanitizeAmount(e.target.value))}
            placeholder={t("pay.amountPlaceholder")}
            className="w-full h-14 bg-[#F1F5F9] rounded-xl px-4 text-center outline-none focus:ring-2 focus:ring-[#14B85A]"
            style={{ fontWeight: 700, fontSize: "22px" }}
          />
        </div>
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block flex items-center gap-1"><FileText size={14} /> {t("qr.descriptionLabel")}</label>
          <input
            value={description}
            onChange={e => setDescription(sanitizeText(e.target.value, 80))}
            placeholder={t("qr.receive.descPlaceholder")}
            maxLength={80}
            className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]"
          />
        </div>
      </div>

      {amount && (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4" >
          <div className="w-16 h-16 rounded-xl border border-gray-100 flex items-center justify-center bg-gray-50">
            <QRCodeSVG value={qrValue} size={52} level="L" bgColor="#F9FAFB" fgColor="#0A4D2C" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] text-[#14B85A]" style={{ fontWeight: 700 }}>{formatCFA(Number(amount))}</p>
            <p className="text-[12px] text-[#6B7280]">{description || t("qr.receive.previewDesc")}</p>
          </div>
          <ChevronRight size={16} className="text-[#6B7280]" />
        </div>
      )}

      {error && <p className="text-[12px] text-[#DC2626] text-center">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={!amount || submitting}
        className="w-full h-14 bg-[#14B85A] text-white rounded-2xl disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
        style={{ fontWeight: 600, boxShadow: "0 12px 28px rgba(20,184,90,0.3)" }}
      >
        {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {submitting ? t("pay.processing") : t("qr.receive.generateCta")}
      </button>
    </div>
  );
}

// ===== HISTORIQUE QR =====
export function QRHistoryPage() {
  const t = useT();
  const getQRStatusLabel = useQRStatusLabel();
  const [filter, setFilter] = useState<"all" | "paid" | "received">("all");
  const { items: qrTransactions, loading } = useQRTransactions();

  const filtered = filter === "all" ? qrTransactions : qrTransactions.filter(x => x.type === filter);
  const totalReceived = qrTransactions.filter(x => x.type === "received" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0);
  const totalPaid = qrTransactions.filter(x => x.type === "paid" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("qr.history.title")}</h1>
          <p className="text-[13px] text-[#6B7280]">{t("qr.history.count", { count: qrTransactions.length })}</p>
        </div>
        <NavLink to="/qr" className="px-4 py-2 bg-[#14B85A] text-white rounded-xl text-[13px] flex items-center gap-1" style={{ fontWeight: 600 }}>
          <QrCode size={14} /> {t("qr.history.new")}
        </NavLink>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#14B85A]/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><ArrowDownLeft size={16} className="text-[#14B85A]" /><span className="text-[12px] text-[#6B7280]">{t("qr.history.received")}</span></div>
          <p className="text-[#14B85A]" style={{ fontWeight: 700, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalReceived)}</p>
        </div>
        <div className="bg-[#EF4444]/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><ArrowUpRight size={16} className="text-[#EF4444]" /><span className="text-[12px] text-[#6B7280]">{t("qr.history.paid")}</span></div>
          <p className="text-[#EF4444]" style={{ fontWeight: 700, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(totalPaid)}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "all" as const, label: t("qr.history.filter.all") },
          { key: "received" as const, label: t("qr.history.filter.received") },
          { key: "paid" as const, label: t("qr.history.filter.paid") },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all ${filter === f.key ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280]"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(tx => (
          <div key={tx.id} className="bg-white rounded-2xl p-4" >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "received" ? "bg-[#14B85A]/10" : "bg-[#EF4444]/10"}`}>
                {tx.type === "received" ? <ArrowDownLeft size={18} className="text-[#14B85A]" /> : <ArrowUpRight size={18} className="text-[#EF4444]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[14px] truncate" style={{ fontWeight: 600 }}>{tx.counterpart}</p>
                  <p className={`text-[14px] ${tx.type === "received" ? "text-[#14B85A]" : "text-[#EF4444]"}`} style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {tx.type === "received" ? "+" : "-"}{formatCFA(tx.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#6B7280]">{formatDate(tx.date)} · {tx.method === "scan" ? t("qr.scan.viaQr") : t("qr.viaMyQr")} · {tx.reference}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getQRStatusColor(tx.status)}`}>{getQRStatusLabel(tx.status)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <EmptyState illustration={<NoResultsIllustration size={150} />} title={t("qr.history.empty")} subtitle={t("qr.history.emptySub")} />
      )}
    </div>
  );
}
