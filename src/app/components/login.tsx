import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router";
import { Eye, EyeOff, Smartphone, Shield, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/auth-context";
import { api } from "../api/client";
import { toast } from "sonner";
import { usePageTitle } from "../utils/use-page-title";
import { IMAGES } from "../data/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Logo } from "./logo";
import loginLogo from "../../imports/Plan_de_travail63.png";
import { motion } from "motion/react";
import { EmptyWalletIllustration } from "./illustrations";
import { useT } from "../i18n/language-context";

export function LoginPage() {
  const t = useT();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState<"login" | "otp">("login");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuth();
  usePageTitle(step === "otp" ? t("auth.otp.title") : t("auth.login.title"));

  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step === "login") phoneRef.current?.focus();
    if (step === "otp") {
      otpRefs.current[0]?.focus();
      setResendIn(30);
    }
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const requestOtpFor = async (phoneNumber: string) => {
    const res = await api.requestOtp(phoneNumber);
    setDevCode(res.devCode ?? null);
    if (res.devCode) toast.info(`${t("auth.otp.yourCode")} : ${res.devCode}`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length !== 10) {
      setError(t("auth.login.errorPhone"));
      return;
    }
    if (pin.length < 4) {
      setError(t("auth.login.errorPin"));
      return;
    }
    setOtp(["", "", "", ""]);
    setSubmitting(true);
    requestOtpFor(phone)
      .then(() => setStep("otp"))
      .catch((err: Error) => { setError(err.message); toast.error(err.message); })
      .finally(() => setSubmitting(false));
  };

  const handleOtp = async () => {
    if (submitting) return;
    setError("");
    if (otp.some((d) => !d)) {
      setError(t("auth.otp.errorIncomplete"));
      return;
    }
    setSubmitting(true);
    try {
      await api.verifyOtp(phone, otp.join(""));
      await loginWithCredentials(phone, pin);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setResendIn(30);
    requestOtpFor(phone).catch((err: Error) => toast.error(err.message));
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <button
          onClick={() => { setStep("login"); setError(""); }}
          className="self-start flex items-center gap-1 text-[13px] text-[#6B7280] hover:text-[#1F2937] mb-4"
        >
          <ArrowLeft size={16} /> {t("common.back")}
        </button>
        <img src={new URL("../../imports/Plan_de_travail72-1.png", import.meta.url).href} alt="IPPOO CASH" className="object-contain mb-4" style={{ width: 140, height: "auto" }} />
        <h1 className="text-[#0A0A0A] mb-2 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("auth.otp.title")}</h1>
        <p className="text-[#6B7280] text-[14px] text-center mb-2">
          {t("auth.otp.sentTo")} +229 {phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim() || "97 XX XX XX"}
        </p>
        {devCode && (
          <p className="text-[12px] text-[#6B7280] mb-2">{t("auth.otp.yourCode")} : <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>{devCode}</span></p>
        )}
        <div className="flex gap-3 mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(-1);
                const newOtp = [...otp];
                newOtp[i] = v;
                setOtp(newOtp);
                if (v && i < 3) otpRefs.current[i + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  otpRefs.current[i - 1]?.focus();
                } else if (e.key === "Enter") {
                  handleOtp();
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
                if (text.length === 4) {
                  e.preventDefault();
                  setOtp(text.split(""));
                  otpRefs.current[3]?.focus();
                }
              }}
              className="w-14 h-14 text-center text-[22px] bg-white rounded-2xl border border-black/10 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
            />
          ))}
        </div>
        {error && <p className="text-[12px] text-[#DC2626] mb-3">{error}</p>}
        <button
          onClick={handleOtp}
          disabled={submitting}
          className="w-full max-w-xs h-14 bg-[#00D4FF] text-white rounded-2xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
        >
          {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {submitting ? t("auth.otp.verifying") : t("auth.otp.verify")}
        </button>
        <button
          onClick={handleResend}
          disabled={resendIn > 0}
          className="mt-4 text-[13px] text-[#00D4FF] disabled:text-[#6B7280] disabled:opacity-60"
        >
          {resendIn > 0 ? t("auth.otp.resendIn", { seconds: resendIn }) : t("auth.otp.resend")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Hero */}
      <div className="relative h-80 sm:h-72 lg:h-64 overflow-hidden">
        <ImageWithFallback
          src={IMAGES.entrepreneur}
          alt="Entrepreneur africain"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0A4D2C]/80" />
        <motion.div
          aria-hidden
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#14B85A]/30 blur-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-[#00D4FF]/25 blur-2xl"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <motion.img
            src={loginLogo}
            alt="IPPOO CASH"
            className="object-contain mb-3"
            style={{ width: 160, height: "auto" }}
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
          />
          <h1 className="text-white" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.75rem" }}>IPPOO CASH</h1>
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to top, #F8FAFC 0%, rgba(248,250,252,0.85) 35%, rgba(248,250,252,0) 100%)" }}
        />
      </div>

      {/* Login Form */}
      <div className="flex-1 -mt-6 bg-[#F8FAFC] rounded-t-3xl p-6 max-w-md mx-auto w-full">
        <h2 className="text-center mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("auth.login.title")}</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("auth.login.phone")}</label>
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 h-14 border border-black/5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <Smartphone size={18} className="text-[#6B7280]" />
              <span className="text-[14px] text-[#6B7280]">+229</span>
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                value={phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="01 94 00 00 00"
                maxLength={14}
                className="flex-1 bg-transparent outline-none text-[#111111]"
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("auth.login.pin")}</label>
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 h-14 border border-black/5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <Shield size={18} className="text-[#6B7280]" />
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••"
                className="flex-1 bg-transparent outline-none text-[#111111] tracking-widest"
                maxLength={6}
              />
              <button type="button" onClick={() => setShowPin(!showPin)} className="text-[#6B7280]" aria-label={showPin ? "Masquer le code PIN" : "Afficher le code PIN"}>
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end -mt-1">
            <button type="button" className="text-[12px] text-[#6B7280] hover:text-[#00D4FF]">
              {t("auth.login.forgotPin")}
            </button>
          </div>
          {error && <p className="text-[12px] text-[#DC2626]">{error}</p>}
          <button
            type="submit"
            className="w-full h-14 bg-[#00D4FF] text-white rounded-2xl transition-all hover:opacity-90 active:scale-95"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
          >
            {t("auth.login.cta")}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#6B7280] mt-4">
          {t("auth.login.noAccount")}{" "}
          <NavLink to="/register" className="text-[#14B85A]" style={{ fontWeight: 600 }}>
            {t("auth.login.createAccount")}
          </NavLink>
        </p>

        <div className="mt-8 space-y-3">
          <h3 className="text-[#6B7280] text-center text-[13px]">{t("auth.login.security")}</h3>
          {[
            { icon: Shield, text: t("auth.login.security.otp") },
            { icon: Smartphone, text: t("auth.login.security.devices") },
            { icon: Clock, text: t("auth.login.security.history") },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
              <item.icon size={16} className="text-[#00D4FF]" />
              <span className="text-[13px] text-[#6B7280] flex-1">{item.text}</span>
              <ChevronRight size={14} className="text-[#6B7280]/30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}