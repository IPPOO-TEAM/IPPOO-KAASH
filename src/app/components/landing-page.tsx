import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet, Shield, Zap, Globe, ArrowRight,
  Smartphone, QrCode, TrendingUp, Users, Check, Star, Menu, X
} from "lucide-react";

import logoLight from "../../imports/Plan_de_travail72.png";
import logoDark from "../../imports/Plan_de_travail63.png";
import imgBusiness from "../../imports/photo_1_2026-06-16_16-28-24.jpg";
import imgWomen from "../../imports/Black_Girls.jpg";

const FEATURES = [
  { icon: Wallet, title: "Portefeuille Mobile", desc: "Gérez votre argent, encaissez et payez en quelques secondes depuis votre téléphone.", color: "#14B85A" },
  { icon: QrCode, title: "Paiement QR Code", desc: "Scannez ou générez un QR pour recevoir ou envoyer de l'argent instantanément.", color: "#FF4E00" },
  { icon: TrendingUp, title: "Épargne & Placements", desc: "Faites fructifier votre argent avec nos produits d'épargne et d'investissement.", color: "#14B85A" },
  { icon: Shield, title: "100% Sécurisé", desc: "OTP, PIN chiffré et protection de vos données selon les standards bancaires.", color: "#FF4E00" },
  { icon: Globe, title: "11 Langues Locales", desc: "Disponible en Fon, Yoruba, Wolof, Haoussa, Lingala et 6 autres langues africaines.", color: "#14B85A" },
  { icon: Zap, title: "Factures & Services", desc: "Payez SBEE, SONEB, Canal+, MTN MoMo directement depuis l'application.", color: "#FF4E00" },
];

const STATS = [
  { value: "43+", label: "Fonctionnalités" },
  { value: "11", label: "Langues africaines" },
  { value: "0%", label: "Frais cachés" },
  { value: "24/7", label: "Disponible" },
];

const TESTIMONIALS = [
  { name: "Aminatou K.", city: "Cotonou", text: "Depuis que j'utilise IPPOO CASH, je gère mon commerce facilement. Je reçois les paiements en temps réel !", rating: 5 },
  { name: "Kofi M.", city: "Porto-Novo", text: "Le QR Code m'a changé la vie. Mes clients paient sans contact, c'est moderne et rapide.", rating: 5 },
  { name: "Fatou D.", city: "Parakou", text: "J'apprécie le suivi de mes dépenses et les relevés automatiques chaque mois.", rating: 5 },
];

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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A4D2C]/97 backdrop-blur shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo IPPOO CASH */}
          <div className="flex items-center gap-3">
            <img src={logoDark} alt="IPPOO" className="h-8 w-auto object-contain" />
            <div className="flex flex-col leading-none">
              <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "15px", color: "white", letterSpacing: "0.05em" }}>CASH</span>
              <span style={{ fontSize: "9px", color: "#14B85A", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>Adokèh !</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[["#features", "Fonctionnalités"], ["#how", "Comment ça marche"], ["#testimonials", "Témoignages"]].map(([href, label]) => (
              <a key={href} href={href} className="text-white/75 hover:text-white text-[14px] transition-colors" style={{ fontWeight: 500 }}>{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/login" className="px-4 py-2 text-white/75 hover:text-white text-[14px] transition-colors" style={{ fontWeight: 500 }}>Connexion</NavLink>
            <NavLink to="/register" className="px-5 py-2.5 bg-[#FF4E00] hover:bg-[#e64500] text-white rounded-xl text-[13px] transition-colors" style={{ fontWeight: 700 }}>
              Commencer gratuitement
            </NavLink>
          </div>

          <button onClick={() => setMenuOpen(s => !s)} className="md:hidden text-white p-2">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A4D2C] border-t border-white/10 px-6 pb-5 space-y-3">
              {[["#features", "Fonctionnalités"], ["#how", "Comment ça marche"], ["#testimonials", "Témoignages"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block text-white/75 py-2 text-[15px]">{label}</a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <NavLink to="/login" className="w-full h-11 border border-white/30 text-white rounded-xl flex items-center justify-center text-[14px]" style={{ fontWeight: 600 }}>Connexion</NavLink>
                <NavLink to="/register" className="w-full h-11 bg-[#FF4E00] text-white rounded-xl flex items-center justify-center text-[14px]" style={{ fontWeight: 700 }}>S'inscrire gratuitement</NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-[#0A4D2C] flex items-center overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#14B85A]/10" />
          <div className="absolute top-40 -right-10 w-64 h-64 rounded-full bg-[#FF4E00]/8" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-[#14B85A]/8" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texte gauche */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#14B85A] animate-pulse" />
              <span className="text-white/80 text-[12px]" style={{ fontWeight: 600 }}>Centre financier de l'écosystème IPPOO</span>
            </div>

            {/* Logo IPPOO CASH grand */}
            <div className="flex items-center gap-4 mb-6">
              <img src={logoDark} alt="IPPOO" className="h-16 w-auto object-contain" />
              <div className="flex flex-col">
                <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: "clamp(32px,5vw,52px)", color: "white", lineHeight: 1 }}>CASH</span>
                <span className="text-[#14B85A]" style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: "16px", letterSpacing: "0.2em" }}>ADOKÈH !</span>
              </div>
            </div>

            <p className="text-white/65 text-[16px] leading-relaxed max-w-md mb-8">
              Payez, encaissez, épargnez et suivez vos finances au quotidien. Une application mobile pensée pour l'Afrique de l'Ouest.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <NavLink to="/register"
                className="h-14 px-8 bg-[#FF4E00] hover:bg-[#e64500] text-white rounded-2xl inline-flex items-center justify-center gap-2 transition-all text-[15px] shadow-lg shadow-[#FF4E00]/25"
                style={{ fontWeight: 700 }}>
                Créer mon compte <ArrowRight size={18} />
              </NavLink>
              <NavLink to="/login"
                className="h-14 px-8 border-2 border-white/25 hover:border-white/50 text-white rounded-2xl inline-flex items-center justify-center text-[15px] transition-all"
                style={{ fontWeight: 600 }}>
                Se connecter
              </NavLink>
            </div>

            {/* Confiance */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex">
                {["#FF4E00","#14B85A","#00D4FF","#FF4E00"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A4D2C]" style={{ backgroundColor: c, marginLeft: i > 0 ? "-8px" : "0" }} />
                ))}
              </div>
              <p className="text-white/50 text-[13px]">Des milliers d'utilisateurs au <strong className="text-white/80">Bénin</strong></p>
            </div>
          </motion.div>

          {/* Mockup téléphone droite */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:flex justify-center">
            <div className="relative">
              {/* Phone */}
              <div className="w-[270px] h-[540px] bg-[#061a0f] rounded-[38px] border-[3px] border-[#14B85A]/30 shadow-2xl overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-10" />
                <div className="pt-12 px-4 pb-4 h-full flex flex-col gap-3">
                  {/* Card solde */}
                  <div className="rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: "#14B85A" }}>
                    <div className="flex items-center justify-between mb-3">
                      <img src={logoDark} alt="IPPOO" className="h-5 w-auto object-contain opacity-90" />
                      <span className="text-white/60 text-[10px]">CASH</span>
                    </div>
                    <p className="text-white/70 text-[10px]">Solde disponible</p>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "24px" }}>245 500 <span className="text-[13px] font-normal">FCFA</span></p>
                    <p className="text-white/50 text-[10px] mt-1">**** **** **** 4821</p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { icon: "↑", label: "Envoyer" },
                      { icon: "↓", label: "Recevoir" },
                      { icon: "⊞", label: "QR Code" },
                      { icon: "⚡", label: "Factures" },
                    ].map(a => (
                      <div key={a.label} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5">
                        <span className="text-[#FF4E00] text-[15px]">{a.icon}</span>
                        <span className="text-white/50 text-[8px]">{a.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Transactions */}
                  <div className="bg-white/5 rounded-2xl p-3 flex-1">
                    <p className="text-white/40 text-[10px] mb-2">Transactions récentes</p>
                    {[
                      { label: "SBEE Cotonou", amt: "-12 500", color: "#EF4444" },
                      { label: "Vente Tissus", amt: "+45 000", color: "#14B85A" },
                      { label: "MTN MoMo", amt: "+20 000", color: "#14B85A" },
                      { label: "Canal+", amt: "-5 000", color: "#EF4444" },
                    ].map(tx => (
                      <div key={tx.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-white/60 text-[10px]">{tx.label}</span>
                        <span className="text-[10px]" style={{ color: tx.color, fontWeight: 700 }}>{tx.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges flottants */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-16 top-16 bg-white rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 bg-[#14B85A]/10 rounded-xl flex items-center justify-center">
                  <Shield size={15} className="text-[#14B85A]" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">Sécurité</p>
                  <p className="text-[11px] font-bold text-gray-800">Certifié</p>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -right-14 bottom-28 bg-white rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 bg-[#FF4E00]/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={15} className="text-[#FF4E00]" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">Ce mois</p>
                  <p className="text-[11px] font-bold text-gray-800">+12.4%</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 70L1440 70L1440 15C1200 70 900 0 720 18C540 36 240 0 0 35L0 70Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
              <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: "42px", color: i % 2 === 0 ? "#14B85A" : "#FF4E00" }}>{s.value}</p>
              <p className="text-gray-500 text-[13px] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#FF4E00] text-[12px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Ce que vous pouvez faire</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(26px,4vw,40px)", color: "#0A4D2C" }}>
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.07 }} viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: f.color + "15" }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="mb-1.5 text-[#0A4D2C]" style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "15px" }}>{f.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="how" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#0A4D2C]">
                <img src={imgBusiness} alt="Commerce africain avec IPPOO CASH" className="w-full h-full object-cover opacity-85" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={logoLight} alt="IPPOO" className="h-8 w-auto" />
                  <div>
                    <p className="text-gray-400 text-[10px]">Powered by</p>
                    <p className="text-[#0A4D2C] text-[13px]" style={{ fontWeight: 800 }}>IPPOO CASH</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <p className="text-[#FF4E00] text-[12px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Simple & Rapide</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(24px,3.5vw,36px)", color: "#0A4D2C", lineHeight: 1.25 }}>
              3 étapes pour<br />commencer.
            </h2>

            <div className="mt-8 space-y-6">
              {[
                { n: "01", col: "#14B85A", title: "Créez votre compte", desc: "Inscrivez-vous avec votre numéro de téléphone et un code OTP en 2 minutes." },
                { n: "02", col: "#FF4E00", title: "Rechargez votre portefeuille", desc: "Alimentez votre compte via MTN MoMo, Moov ou virement bancaire." },
                { n: "03", col: "#14B85A", title: "Payez & Encaissez partout", desc: "QR Code, lien de paiement, demande directe — à votre choix." },
              ].map(step => (
                <div key={step.n} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: step.col }}>
                    <span className="text-white text-[11px]" style={{ fontWeight: 800 }}>{step.n}</span>
                  </div>
                  <div>
                    <p className="text-[#0A4D2C] text-[14px]" style={{ fontWeight: 700 }}>{step.title}</p>
                    <p className="text-gray-500 text-[13px] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <NavLink to="/register"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-[#0A4D2C] text-white rounded-2xl hover:bg-[#0d5c35] transition-colors text-[14px]"
              style={{ fontWeight: 700 }}>
              Je commence maintenant <ArrowRight size={16} />
            </NavLink>
          </motion.div>
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section className="py-20 bg-[#0A4D2C] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10" style={{ background: "radial-gradient(circle at 80% 50%, #FF4E00, transparent 70%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-[#FF4E00] text-[12px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Pour tout le monde</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(24px,3.5vw,38px)", color: "white", lineHeight: 1.2 }}>
              Conçu pour<br /><span className="text-[#14B85A]">l'Afrique de l'Ouest</span>
            </h2>
            <p className="mt-4 text-white/55 text-[14px] leading-relaxed max-w-sm">
              Des marchés de Cotonou aux grandes entreprises de Lagos, Adokèh accompagne chaque projet financier.
            </p>
            <div className="mt-8 space-y-3">
              {["Commerçants et boutiquiers", "Entrepreneurs et PME", "Travailleurs freelance", "Particuliers et familles", "Associations et tontines"].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#14B85A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-white/75 text-[14px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full aspect-square rounded-3xl overflow-hidden bg-[#14B85A]/15">
            <img src={imgWomen} alt="Femmes entrepreneures IPPOO CASH" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#FF4E00] text-[12px] mb-3" style={{ fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Ils nous font confiance</p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(24px,4vw,38px)", color: "#0A4D2C" }}>Ce que disent nos utilisateurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }} viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} className="text-[#FF4E00] fill-[#FF4E00]" />)}
                </div>
                <p className="text-gray-600 text-[14px] leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#14B85A] flex items-center justify-center">
                    <span className="text-white text-[11px]" style={{ fontWeight: 700 }}>{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[#0A4D2C] text-[13px]" style={{ fontWeight: 700 }}>{t.name}</p>
                    <p className="text-gray-400 text-[11px]">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-[#0A4D2C] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#14B85A]/10" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <img src={logoDark} alt="IPPOO" className="h-14 w-auto mx-auto mb-6 object-contain" />
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(26px,4vw,44px)", color: "white", lineHeight: 1.2 }}>
              Prenez le contrôle de<br /><span className="text-[#14B85A]">votre argent</span> dès aujourd'hui.
            </h2>
            <p className="mt-4 text-white/55 text-[15px]">Inscription gratuite, en 2 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <NavLink to="/register"
                className="h-14 px-10 bg-[#FF4E00] hover:bg-[#e64500] text-white rounded-2xl inline-flex items-center justify-center gap-2 text-[15px] transition-all shadow-lg shadow-[#FF4E00]/30"
                style={{ fontWeight: 700 }}>
                Créer mon compte gratuit <ArrowRight size={17} />
              </NavLink>
              <NavLink to="/login"
                className="h-14 px-8 border-2 border-white/20 hover:border-white/40 text-white rounded-2xl inline-flex items-center justify-center text-[14px] transition-all"
                style={{ fontWeight: 600 }}>
                J'ai déjà un compte
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#061a0f] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src={logoDark} alt="IPPOO" className="h-7 w-auto object-contain" />
            <div>
              <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "14px", color: "white" }}>CASH</span>
              <span className="text-white/30 text-[12px] ml-2">— Adokèh !</span>
            </div>
          </div>
          <p className="text-white/30 text-[12px]">© 2026 IPPOO TEAM. Tous droits réservés.</p>
          <div className="flex gap-6">
            <NavLink to="/login" className="text-white/40 hover:text-white/70 text-[13px] transition-colors">Connexion</NavLink>
            <NavLink to="/register" className="text-white/40 hover:text-white/70 text-[13px] transition-colors">S'inscrire</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
