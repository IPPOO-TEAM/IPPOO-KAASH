import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { User, Smartphone, Shield, Briefcase, Wallet, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "../auth/auth-context";
import { api } from "../api/client";
import { notify as toast } from "./ui/notify";
import { canInstall, promptInstall, isStandalone } from "../pwa/pwa";
import { usePageTitle } from "../utils/use-page-title";
import loginLogo from "../../imports/Plan_de_travail63.png";
import { useT } from "../i18n/language-context";

type Step = "identity" | "type" | "pin" | "otp" | "success";

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerWithCredentials } = useAuth();
  const t = useT();

  const [step, setStep] = useState<Step>("identity");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<"particulier" | "commercant">("particulier");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  usePageTitle(t("auth.register.title"));

  const stepIndex = ["identity", "type", "pin", "otp"].indexOf(step);
  const progress = step === "success" ? 100 : ((stepIndex + 1) / 4) * 100;

  const nameRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step === "identity") nameRef.current?.focus();
    if (step === "pin") pinRef.current?.focus();
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  const pinStrength = pin.length >= 6 ? t("auth.register.pin.strong") : pin.length >= 4 ? t("auth.register.pin.medium") : pin.length > 0 ? t("auth.register.pin.weak") : "";
  const pinStrengthColor = pin.length >= 6 ? "#14B85A" : pin.length >= 4 ? "#F59E0B" : "#DC2626";

  const next = () => {
    setError("");
    if (step === "identity") {
      if (!fullName.trim()) {
        setError(t("auth.register.errorName"));
        return;
      }
      if (phone.length !== 10) {
        setError(t("auth.login.errorPhone"));
        return;
      }
      setStep("type");
    } else if (step === "type") {
      setStep("pin");
    } else if (step === "pin") {
      if (pin.length < 4) {
        setError(t("auth.login.errorPin"));
        return;
      }
      if (pin !== pinConfirm) {
        setError(t("auth.register.pinMismatch"));
        return;
      }
      if (submitting) return;
      setSubmitting(true);
      api.requestOtp(phone)
        .then((res) => { setDevCode(res.devCode ?? null); if (res.devCode) toast.otp(res.devCode, phone); setStep("otp"); })
        .catch((err: Error) => { setError(err.message); toast.error(err.message); })
        .finally(() => setSubmitting(false));
    } else if (step === "otp") {
      if (otp.some((d) => !d)) {
        setError(t("auth.otp.errorIncomplete"));
        return;
      }
      if (submitting) return;
      setSubmitting(true);
      (async () => {
        try {
          await api.verifyOtp(phone, otp.join(""));
          await registerWithCredentials({ fullName: fullName.trim(), phone, pin, accountType });
          setStep("success");
          setTimeout(() => {
            if (!isStandalone()) {
              const offerInstall = () => toast.install(
                "Installer IPPOO-CASH",
                "Ajoutez l'app à votre écran d'accueil pour un accès rapide.",
                "Installer",
                () => { promptInstall(); },
              );
              if (canInstall()) offerInstall();
              else toast.info("Installer IPPOO-CASH", "Ouvrez le menu de votre navigateur puis « Ajouter à l'écran d'accueil ».");
            }
            navigate("/", { replace: true });
          }, 1400);
        } catch (err) {
          const msg = (err as Error).message;
          setError(msg);
          toast.error(msg);
        } finally {
          setSubmitting(false);
        }
      })();
    }
  };

  const back = () => {
    setError("");
    if (step === "type") setStep("identity");
    else if (step === "pin") setStep("type");
    else if (step === "otp") setStep("pin");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-[#0A4D2C] px-5 pt-10 pb-16 relative overflow-hidden min-h-[360px] sm:min-h-[320px] lg:min-h-[280px]">
        <motion.div
          aria-hidden
          className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-[#14B85A]/30 blur-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full bg-[#00D4FF]/20 blur-2xl"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <NavLink to="/login" className="text-white/80 flex items-center gap-1 text-[13px] hover:text-white">
              <ArrowLeft size={16} /> {t("auth.login.title")}
            </NavLink>
          </div>
          <motion.img
            src={loginLogo}
            alt="IPPOO CASH"
            className="object-contain mx-auto mb-4"
            style={{ width: 130, height: "auto" }}
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
          />
          <h1 className="text-white text-center" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
            {t("auth.register.title")}
          </h1>
          <p className="text-white/70 text-[13px] mt-1 text-center">{t("auth.register.subtitle")}</p>
          <div className="mt-5 h-1.5 bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#14B85A] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to top, #F8FAFC 0%, rgba(248,250,252,0.85) 35%, rgba(248,250,252,0) 100%)" }}
        />
      </div>

      <div className="flex-1 -mt-6 px-5 pb-8">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-sm mt-20 sm:mt-10 lg:mt-0">
          <AnimatePresence mode="wait">
            {step === "identity" && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{t("auth.register.identity")}</h2>
                <div>
                  <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("auth.register.fullName")}</label>
                  <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-2xl px-4 h-14">
                    <User size={18} className="text-[#6B7280]" />
                    <input
                      ref={nameRef}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      placeholder={t("auth.register.namePlaceholder")}
                      className="flex-1 bg-transparent outline-none text-[#0F172A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("auth.login.phone")}</label>
                  <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-2xl px-4 h-14">
                    <Smartphone size={18} className="text-[#6B7280]" />
                    <span className="text-[14px] text-[#6B7280]">+229</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      placeholder="01 94 00 00 00"
                      maxLength={14}
                      className="flex-1 bg-transparent outline-none text-[#0F172A]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === "type" && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{t("auth.register.accountTypeTitle")}</h2>
                <div className="grid gap-3">
                  {([
                    { key: "particulier", label: t("auth.register.accountType.particulier"), subtitle: t("auth.register.particulier.subtitle"), icon: Wallet, color: "#14B85A" },
                    { key: "commercant", label: t("auth.register.commercantPro"), subtitle: t("auth.register.commercant.subtitle"), icon: Briefcase, color: "#00D4FF" },
                  ] as const).map((opt) => {
                    const active = accountType === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setAccountType(opt.key)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                          active ? "border-[#14B85A] bg-[#14B85A]/5" : "border-gray-100 bg-[#F8FAFC]"
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${opt.color}1F` }}
                        >
                          <opt.icon size={20} style={{ color: opt.color }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ fontWeight: 600 }}>{opt.label}</p>
                          <p className="text-[12px] text-[#6B7280]">{opt.subtitle}</p>
                        </div>
                        {active && <CheckCircle size={18} className="text-[#14B85A]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === "pin" && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{t("auth.register.security")}</h2>
                <p className="text-[13px] text-[#6B7280]">{t("auth.register.pinHelp")}</p>
                {[
                  { label: t("auth.register.pinNew"), value: pin, set: setPin, ref: pinRef, withMeter: true },
                  { label: t("auth.register.pinConfirm"), value: pinConfirm, set: setPinConfirm, ref: null, withMeter: false },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-[13px] text-[#6B7280] mb-1.5 block">{field.label}</label>
                    <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-2xl px-4 h-14">
                      <Shield size={18} className="text-[#6B7280]" />
                      <input
                        ref={field.ref as React.RefObject<HTMLInputElement> | null}
                        type={showPin ? "text" : "password"}
                        value={field.value}
                        onChange={(e) => field.set(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        onKeyDown={(e) => e.key === "Enter" && next()}
                        placeholder="••••"
                        className="flex-1 bg-transparent outline-none text-[#0F172A] tracking-widest"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        inputMode="numeric"
                      />
                      <button type="button" onClick={() => setShowPin(!showPin)} className="text-[#6B7280]" aria-label={showPin ? "Masquer le code PIN" : "Afficher le code PIN"}>
                        {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {field.withMeter && pin.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            animate={{ width: `${Math.min((pin.length / 6) * 100, 100)}%`, backgroundColor: pinStrengthColor }}
                            transition={{ duration: 0.25 }}
                          />
                        </div>
                        <span className="text-[11px]" style={{ color: pinStrengthColor, fontWeight: 600 }}>{pinStrength}</span>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{t("auth.register.verification")}</h2>
                <p className="text-[13px] text-[#6B7280]">
                  {t("auth.register.verificationHelp", { phone: phone || "97 XX XX XX" })}
                </p>
                <div className="flex gap-3 justify-center pt-1">
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
                          next();
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
                      className="w-14 h-14 text-center text-[22px] bg-[#F1F5F9] rounded-2xl outline-none focus:ring-2 focus:ring-[#14B85A]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-[#6B7280] text-center">
                  {devCode ? <>{t("auth.otp.yourCode")} : <span style={{ fontWeight: 600 }} className="text-[#0F172A]">{devCode}</span></> : t("auth.otp.smsSent")}
                </p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                className="text-center py-6 space-y-3"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-[#14B85A]/10 flex items-center justify-center">
                  <CheckCircle size={42} className="text-[#14B85A]" />
                </div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{t("auth.register.success")}</h2>
                <p className="text-[13px] text-[#6B7280]">{t("auth.register.welcome", { name: fullName.split(" ")[0] })}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && step !== "success" && (
            <p className="text-[12px] text-[#DC2626] mt-3">{error}</p>
          )}

          {step !== "success" && (
            <div className="flex gap-3 mt-6">
              {step !== "identity" && (
                <button
                  onClick={back}
                  className="h-12 px-4 rounded-2xl bg-[#F1F5F9] text-[#1F2937] flex items-center gap-1 hover:bg-gray-200 transition-all"
                  style={{ fontWeight: 600 }}
                >
                  <ArrowLeft size={16} /> {t("common.back")}
                </button>
              )}
              <button
                onClick={next}
                className="flex-1 h-12 rounded-2xl bg-[#14B85A] text-white flex items-center justify-center gap-1 hover:opacity-90 active:scale-95 transition-all"
                style={{ fontWeight: 600, boxShadow: "0 8px 20px rgba(20,184,90,0.25)" }}
              >
                {step === "otp" ? t("auth.register.createCta") : t("common.continue")} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === "identity" && (
            <p className="text-center text-[13px] text-[#6B7280] mt-5">
              {t("auth.register.alreadyAccount")}{" "}
              <NavLink to="/login" className="text-[#14B85A]" style={{ fontWeight: 600 }}>
                {t("auth.login.cta")}
              </NavLink>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
