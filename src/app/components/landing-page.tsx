import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet, Shield, Zap, Globe, ChevronRight, ArrowRight,
  Smartphone, QrCode, TrendingUp, Users, Check, Star, Menu, X
} from "lucide-react";

import imgBusiness from "../../imports/photo_1_2026-06-16_16-28-24.jpg";
import imgWomen from "../../imports/Black_Girls.jpg";
import imgShop from "../../imports/trois-femmes-africaines-choisissent-vetements-lors-journee-magasinage_926199-2565282.jpg";

const FEATURES = [
  { icon: Wallet, title: "Portefeuille Mobile", desc: "Gérez votre argent, encaissez et payez en quelques secondes depuis votre téléphone.", color: "#14B85A" },
  { icon: QrCode, title: "Paiement QR Code", desc: "Scannez ou générez un QR pour recevoir ou envoyer de l'argent instantanément.", color: "#00D4FF" },
  { icon: TrendingUp, title: "Épargne & Placements", desc: "Faites fructifier votre argent avec nos produits d'épargne et d'investissement adaptés.", color: "#14B85A" },
  { icon: Shield, title: "100% Sécurisé", desc: "Authentification OTP, PIN chiffré et protection de vos données selon les standards bancaires.", color: "#00D4FF" },
  { icon: Globe, title: "11 Langues Locales", desc: "Disponible en Fon, Yoruba, Wolof, Haoussa, Lingala et 6 autres langues africaines.", color: "#14B85A" },
  { icon: Zap, title: "Factures & Services", desc: "Payez SBEE, SONEB, Canal+, MTN et Moov directement depuis l'application.", color: "#00D4FF" },
];

const STATS = [
  { value: "43+", label: "Fonctionnalités" },
  { value: "11", label: "Langues" },
  { value: "0%", label: "Frais cachés" },
  { value: "24/7", label: "Disponible" },
];

const TESTIMONIALS = [
  { name: "Aminatou K.", city: "Cotonou", text: "Depuis que j'utilise IPPOO CASH, je gère mon commerce facilement. Je reçois les paiements en temps réel !", rating: 5 },
  { name: "Kofi M.", city: "Porto-Novo", text: "Le QR Code m'a changé la vie. Mes clients paient sans contact, c'est moderne et rapide.", rating: 5 },
  { name: "Fatou D.", city: "Parakou", text: "J'apprécie particulièrement le suivi de mes dépenses et les relevés automatiques chaque mois.", rating: 5 },
];

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 40);
      const t = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(start);
        if (start >= target) clearInterval(t);
      }, 30);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A4D2C]/95 backdrop-blur shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
              <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "14px", color: "#0A4D2C" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "18px", color: "white" }}>
              Adokèh <span className="text-[#00D4FF]">!</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[["#features", "Fonctionnalités"], ["#how", "Comment ça marche"], ["#testimonials", "Témoignages"]].map(([href, label]) => (
              <a key={href} href={href} className="text-white/80 hover:text-white text-[14px] transition-colors" style={{ fontWeight: 500 }}>{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/login" className="px-4 py-2 text-white/80 hover:text-white text-[14px] transition-colors" style={{ fontWeight: 500 }}>Connexion</NavLink>
            <NavLink to="/register" className="px-5 py-2 bg-[#14B85A] hover:bg-[#12a051] text-white rounded-xl text-[14px] transition-colors" style={{ fontWeight: 600 }}>
              Commencer gratuitement
            </NavLink>
          </div>

          <button onClick={() => setMenuOpen(s => !s)} className="md:hidden text-white p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A4D2C] border-t border-white/10 px-6 pb-4 space-y-3">
              {[["#features", "Fonctionnalités"], ["#how", "Comment ça marche"], ["#testimonials", "Témoignages"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block text-white/80 py-2 text-[15px]">{label}</a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <NavLink to="/login" className="w-full h-11 border border-white/30 text-white rounded-xl flex items-center justify-center text-[14px]" style={{ fontWeight: 600 }}>Connexion</NavLink>
                <NavLink to="/register" className="w-full h-11 bg-[#14B85A] text-white rounded-xl flex items-center justify-center text-[14px]" style={{ fontWeight: 600 }}>S'inscrire gratuitement</NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-[#0A4D2C] flex items-center overflow-hidden">
        {/* motif de fond */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white" />
          <div className="absolute top-40 left-40 w-96 h-96 rounded-full border border-white" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full border border-[#14B85A]" />
          <div className="absolute bottom-40 right-30 w-80 h-80 rounded-full border border-[#14B85A]" />
        </div>

        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-gradient-to-l from-[#14B85A]/30 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14B85A]/20 border border-[#14B85A]/30 mb-6">
              <Zap size={14} className="text-[#14B85A]" />
              <span className="text-[#14B85A] text-[13px]" style={{ fontWeight: 600 }}>Centre financier de l'écosystème IPPOO</span>
            </div>

            <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.1, color: "white" }}>
              Votre argent,<br />
              <span className="text-[#00D4FF]">maîtrisé</span><br />
              au quotidien.
            </h1>

            <p className="mt-6 text-white/70 text-[16px] leading-relaxed max-w-md">
              Adokèh réunit paiement, encaissement, épargne, crédit et suivi financier dans une seule app mobile pensée pour l'Afrique de l'Ouest.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <NavLink to="/register" className="h-13 px-8 bg-[#14B85A] hover:bg-[#12a051] text-white rounded-2xl flex items-center justify-center gap-2 transition-all text-[15px]" style={{ fontWeight: 700 }}>
                Créer mon compte <ArrowRight size={18} />
              </NavLink>
              <NavLink to="/login" className="h-13 px-8 border-2 border-white/30 hover:border-white/60 text-white rounded-2xl flex items-center justify-center gap-2 transition-all text-[15px]" style={{ fontWeight: 600 }}>
                Se connecter
              </NavLink>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {["#14B85A", "#00D4FF", "#F59E0B", "#8B5CF6"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A4D2C]" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-white/60 text-[13px]">Rejoignez des <strong className="text-white">milliers d'utilisateurs</strong> au Bénin</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block">
            <div className="relative mx-auto" style={{ width: "300px" }}>
              {/* Phone mockup */}
              <div className="w-[280px] h-[560px] bg-[#0F2A1A] rounded-[40px] border-4 border-[#14B85A]/40 shadow-2xl overflow-hidden mx-auto relative">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
                {/* App UI preview */}
                <div className="pt-14 px-4 pb-4 h-full flex flex-col gap-3">
                  <div className="bg-[#14B85A] rounded-2xl p-4 text-white">
                    <p className="text-[11px] opacity-70">Solde disponible</p>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "26px" }}>245 500 <span className="text-[14px] font-normal">FCFA</span></p>
                    <p className="text-[11px] opacity-70 mt-1">**** **** **** 4821</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: "↑", label: "Envoyer", bg: "#1a3a2a" },
                      { icon: "↓", label: "Recevoir", bg: "#1a3a2a" },
                      { icon: "⊞", label: "QR Code", bg: "#1a3a2a" },
                      { icon: "⚡", label: "Factures", bg: "#1a3a2a" },
                    ].map(a => (
                      <div key={a.label} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: a.bg }}>
                        <span className="text-[#14B85A] text-[16px]">{a.icon}</span>
                        <span className="text-white/60 text-[8px]">{a.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#1a3a2a] rounded-2xl p-3">
                    <p className="text-white/50 text-[10px] mb-2">Transactions récentes</p>
                    {[
                      { label: "SBEE Cotonou", amt: "-12 500", color: "#EF4444" },
                      { label: "Vente Tissus", amt: "+45 000", color: "#14B85A" },
                      { label: "MTN MoMo", amt: "+20 000", color: "#14B85A" },
                    ].map(tx => (
                      <div key={tx.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-white/70 text-[10px]">{tx.label}</span>
                        <span className="text-[10px]" style={{ color: tx.color, fontWeight: 700 }}>{tx.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-12 top-20 bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-[#14B85A]/10 rounded-xl flex items-center justify-center">
                  <Shield size={16} className="text-[#14B85A]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Sécurité</p>
                  <p className="text-[12px] font-bold text-gray-800">100% Protégé</p>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -right-10 bottom-32 bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={16} className="text-[#00D4FF]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Ce mois</p>
                  <p className="text-[12px] font-bold text-gray-800">+12.4%</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* wave séparateur */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 20C1200 80 900 0 720 20C540 40 240 0 0 40L0 80Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[#14B85A]" style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "40px" }}>
                {s.value === "43+" ? <><CountUp target={43} />+</> :
                 s.value === "11" ? <CountUp target={11} /> :
                 s.value === "0%" ? "0%" : "24/7"}
              </p>
              <p className="text-gray-500 text-[13px] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#14B85A] text-[13px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Fonctionnalités</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,42px)", color: "#0A4D2C" }}>
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-gray-500 text-[15px] max-w-xl mx-auto">
              Une plateforme complète pour gérer votre vie financière au quotidien, conçue pour l'Afrique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-[#14B85A]/20 transition-all group cursor-default">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ backgroundColor: f.color + "15" }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="mb-2 text-[#0A4D2C]" style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "16px" }}>{f.title}</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT IMAGE + TEXTE ── */}
      <section className="py-20 bg-[#F8FAFC]" id="how">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#0A4D2C]">
                <img src={imgBusiness} alt="Commerce africain avec IPPOO CASH" className="w-full h-full object-cover opacity-90" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#0A4D2C] rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#14B85A] rounded-xl flex items-center justify-center">
                    <Users size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-[11px] opacity-60">Commerçants</p>
                    <p className="text-white text-[15px]" style={{ fontWeight: 700 }}>& Particuliers</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <p className="text-[#14B85A] text-[13px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Comment ça marche</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(26px,3.5vw,38px)", color: "#0A4D2C", lineHeight: 1.2 }}>
              Simple, rapide,<br />accessible à tous.
            </h2>
            <p className="mt-4 text-gray-500 text-[15px] leading-relaxed">
              Que vous soyez commerçant ou particulier, Adokèh s'adapte à vos besoins. Inscrivez-vous en 2 minutes et commencez à gérer votre argent.
            </p>

            <div className="mt-8 space-y-5">
              {[
                { n: "01", title: "Créez votre compte", desc: "Inscrivez-vous avec votre numéro de téléphone et un code OTP." },
                { n: "02", title: "Rechargez votre portefeuille", desc: "Alimentez votre compte via MTN MoMo, Moov ou virement." },
                { n: "03", title: "Payez & Encaissez", desc: "Utilisez le QR Code, les liens de paiement ou la demande de paiement." },
              ].map(step => (
                <div key={step.n} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#14B85A] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px]" style={{ fontWeight: 800 }}>{step.n}</span>
                  </div>
                  <div>
                    <p className="text-[#0A4D2C] text-[15px]" style={{ fontWeight: 700 }}>{step.title}</p>
                    <p className="text-gray-500 text-[13px] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <NavLink to="/register" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#0A4D2C] text-white rounded-2xl hover:bg-[#0d5c35] transition-colors text-[14px]" style={{ fontWeight: 700 }}>
              Je commence maintenant <ChevronRight size={18} />
            </NavLink>
          </motion.div>
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section className="py-20 bg-[#0A4D2C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-white" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-[#14B85A] text-[13px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pour tout le monde</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(26px,3.5vw,38px)", color: "white", lineHeight: 1.2 }}>
              Conçu pour<br />
              <span className="text-[#00D4FF]">l'Afrique de l'Ouest</span>
            </h2>
            <p className="mt-4 text-white/60 text-[15px] leading-relaxed">
              Des commerçants du marché aux grandes entreprises, en passant par les familles et les étudiants — Adokèh accompagne chaque projet.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Commerçants et boutiquiers",
                "Entrepreneurs et PME",
                "Travailleurs à la tâche",
                "Particuliers et familles",
                "Associations et coopératives",
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#14B85A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-white/80 text-[14px]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-[#14B85A]/10">
              <img src={imgWomen} alt="Femmes entrepreneures africaines" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#14B85A] text-[13px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ils nous font confiance</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,42px)", color: "#0A4D2C" }}>
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-[#14B85A] fill-[#14B85A]" />
                  ))}
                </div>
                <p className="text-gray-600 text-[14px] leading-relaxed italic mb-4">"{t.text}"</p>
                <div>
                  <p className="text-[#0A4D2C] text-[14px]" style={{ fontWeight: 700 }}>{t.name}</p>
                  <p className="text-gray-400 text-[12px]">{t.city}, Bénin</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#14B85A] rounded-2xl mb-6">
              <Smartphone size={28} className="text-white" />
            </div>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", color: "#0A4D2C" }}>
              Prêt à prendre le contrôle<br />de votre argent ?
            </h2>
            <p className="mt-4 text-gray-500 text-[16px] max-w-lg mx-auto">
              Rejoignez des milliers d'utilisateurs qui gèrent leur finances avec Adokèh. Inscription gratuite, en 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <NavLink to="/register" className="h-14 px-10 bg-[#14B85A] hover:bg-[#12a051] text-white rounded-2xl inline-flex items-center justify-center gap-2 text-[15px] transition-all shadow-lg shadow-[#14B85A]/25" style={{ fontWeight: 700 }}>
                Créer mon compte gratuit <ArrowRight size={18} />
              </NavLink>
              <NavLink to="/login" className="h-14 px-10 border-2 border-[#0A4D2C] text-[#0A4D2C] rounded-2xl inline-flex items-center justify-center gap-2 text-[15px] hover:bg-[#0A4D2C]/5 transition-all" style={{ fontWeight: 600 }}>
                J'ai déjà un compte
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A4D2C] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00D4FF] flex items-center justify-center">
              <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "12px", color: "#0A4D2C" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "16px", color: "white" }}>
              Adokèh <span className="text-[#00D4FF]">!</span>
            </span>
            <span className="text-white/40 text-[13px] ml-2">— IPPOO CASH</span>
          </div>
          <p className="text-white/40 text-[13px]">© 2026 IPPOO TEAM. Tous droits réservés.</p>
          <div className="flex gap-6">
            <NavLink to="/login" className="text-white/50 hover:text-white text-[13px] transition-colors">Connexion</NavLink>
            <NavLink to="/register" className="text-white/50 hover:text-white text-[13px] transition-colors">S'inscrire</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
