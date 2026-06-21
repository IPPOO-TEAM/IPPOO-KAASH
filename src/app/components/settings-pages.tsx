import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  User, Settings, Globe, Bell, Shield, Smartphone, Lock, ChevronRight, Calculator, FileText, HelpCircle, MessageSquare, AlertTriangle, Send, CheckCircle, ExternalLink, ArrowLeftRight, Package, Briefcase, TrendingUp, LogOut
} from "lucide-react";
import { useAuth } from "../auth/auth-context";
import { useLanguage } from "../i18n/language-context";
import { useT } from "../i18n/language-context";
import { disputes, formatCFA, formatDate, getStatusColor, getStatusLabel, IMAGES } from "../data/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PageHero } from "./page-hero";

// ===== PAGE 37-38: COMPTABILITE & FISCAL =====
export function AccountingPage() {
  const t = useT();
  const categories = [
    { name: t("accounting.cat.sales"), income: 695000, expense: 0 },
    { name: t("accounting.cat.services"), income: 255000, expense: 0 },
    { name: t("accounting.cat.transport"), income: 0, expense: 35000 },
    { name: t("accounting.cat.cotisations"), income: 0, expense: 55000 },
    { name: t("accounting.cat.bills"), income: 0, expense: 40500 },
    { name: t("accounting.cat.investments"), income: 500000, expense: 0 },
    { name: t("accounting.cat.recharges"), income: 0, expense: 50000 },
    { name: t("accounting.cat.withdrawals"), income: 0, expense: 100000 },
    { name: t("accounting.cat.bonus"), income: 45000, expense: 0 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Calculator} title={t("accounting.title")} subtitle={t("accounting.subtitle")} color="#6366F1" />

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1" >
        <button className="flex-1 py-2.5 bg-[#6366F1] text-white rounded-xl text-[13px]" style={{ fontWeight: 600 }}>{t("accounting.tab.accounting")}</button>
        <button className="flex-1 py-2.5 text-[#6B7280] rounded-xl text-[13px]" style={{ fontWeight: 600 }}>{t("accounting.tab.fiscal")}</button>
      </div>

      {/* Journal */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("accounting.journal")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] text-[#6B7280] border-b">
                <th className="text-left py-2">{t("accounting.col.category")}</th>
                <th className="text-right py-2">{t("accounting.col.income")}</th>
                <th className="text-right py-2">{t("accounting.col.expense")}</th>
                <th className="text-right py-2">{t("accounting.col.net")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.name} className="border-b border-gray-50">
                  <td className="py-2">{cat.name}</td>
                  <td className="text-right text-[#14B85A]" style={{ fontVariantNumeric: "tabular-nums" }}>{cat.income > 0 ? formatCFA(cat.income) : "-"}</td>
                  <td className="text-right text-[#EF4444]" style={{ fontVariantNumeric: "tabular-nums" }}>{cat.expense > 0 ? formatCFA(cat.expense) : "-"}</td>
                  <td className="text-right" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCFA(cat.income - cat.expense)}</td>
                </tr>
              ))}
              <tr className="border-t-2">
                <td className="py-2" style={{ fontWeight: 700 }}>{t("common.total")}</td>
                <td className="text-right text-[#14B85A]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(categories.reduce((s, c) => s + c.income, 0))}</td>
                <td className="text-right text-[#EF4444]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(categories.reduce((s, c) => s + c.expense, 0))}</td>
                <td className="text-right" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(categories.reduce((s, c) => s + (c.income - c.expense), 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiscal */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("accounting.fiscal")}</h2>
        <div className="space-y-3">
          {[t("accounting.fiscal.monthly"), t("accounting.fiscal.quarterly"), t("accounting.fiscal.annual")].map(doc => (
            <div key={doc} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <FileText size={16} className="text-[#6366F1]" />
              <span className="flex-1 text-[13px]">{doc}</span>
              <button className="text-[12px] text-[#6366F1]" style={{ fontWeight: 600 }}>{t("accounting.generate")}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== PAGE 39: PROFIL =====
export function ProfilePage() {
  const t = useT();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout().finally(() => navigate("/login", { replace: true }));
  };

  const displayName = user?.fullName || t("profile.defaultUser");
  const phone = user?.phone ? `+229 ${user.phone}` : "—";
  const accountLabel = user?.accountType === "commercant" ? t("profile.commercantPro") : t("profile.particulier");
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const city = user?.city || t("profile.defaultCity");

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("profile.title")}</h1>

      <div className="bg-white rounded-2xl p-5 text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-3 shadow-lg overflow-hidden bg-[#14B85A] flex items-center justify-center">
          {user?.avatarDataUrl ? (
            <img src={user.avatarDataUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-white" />
          )}
        </div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{displayName}</h2>
        <p className="text-[13px] text-[#6B7280]">{accountLabel} · {city}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-[#00D4FF]/10 text-[#00A3CC] rounded-full text-[12px]" style={{ fontWeight: 600 }}>{t("profile.verifiedAccount")}</span>
        {user?.bio && <p className="text-[13px] text-[#6B7280] mt-3 italic">"{user.bio}"</p>}
      </div>

      <div className="bg-white rounded-2xl p-5 space-y-3">
        <h3 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("profile.information")}</h3>
        {[
          { label: t("profile.info.phone"), value: phone },
          { label: t("profile.info.email"), value: user?.email || "—" },
          { label: t("profile.info.address"), value: user?.address || "—" },
          { label: t("profile.info.accountType"), value: accountLabel },
          { label: t("profile.info.memberSince"), value: memberSince },
        ].map(item => (
          <div key={item.label} className="flex justify-between gap-3 text-[14px] py-1 border-b border-gray-50 last:border-0">
            <span className="text-[#6B7280] shrink-0">{item.label}</span>
            <span style={{ fontWeight: 500 }} className="text-right truncate">{item.value}</span>
          </div>
        ))}
      </div>

      <NavLink
        to="/profile/edit"
        className="w-full h-12 bg-white border rounded-2xl flex items-center justify-center gap-2 text-[#1F2937] hover:bg-gray-50 transition-all"
        style={{ fontWeight: 600 }}
      >
        <Settings size={16} /> {t("profile.edit")}
      </NavLink>

      <button
        onClick={handleLogout}
        className="w-full h-12 bg-[#EF4444]/10 text-[#DC2626] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#EF4444]/15 active:scale-95 transition-all"
        style={{ fontWeight: 600 }}
      >
        <LogOut size={16} /> {t("profile.logout")}
      </button>
    </div>
  );
}

// ===== EDIT PROFILE =====
export function EditProfilePage() {
  const t = useT();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState(user?.city || "");
  const [address, setAddress] = useState(user?.address || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [accountType, setAccountType] = useState<"particulier" | "commercant">(user?.accountType || "particulier");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(user?.avatarDataUrl);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      setError(t("profile.edit.errorImageSize"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError(t("profile.edit.errorName")); return; }
    if (phone && !/^\d{8,10}$/.test(phone)) { setError(t("profile.edit.errorPhone")); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t("profile.edit.errorEmail")); return; }
    setSaving(true);
    try {
      await updateUser({
        fullName: fullName.trim(),
        email: email.trim(),
        city: city.trim(),
        address: address.trim(),
        bio: bio.trim(),
        accountType,
        avatarDataUrl,
      });
      setSaved(true);
      navigate("/profile");
    } catch (err: any) {
      setError(err?.message || t("profile.edit.errorGeneric") || "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/profile" className="text-[14px] text-[#6B7280] hover:text-[#1F2937]">{t("profile.edit.back")}</NavLink>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("profile.edit.title")}</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar */}
        <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#14B85A] flex items-center justify-center shadow-lg">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#14B85A] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#0E8F45]">
              <Settings size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <p className="text-[12px] text-[#6B7280]">{t("profile.edit.avatarHint")}</p>
          {avatarDataUrl && (
            <button type="button" onClick={() => setAvatarDataUrl(undefined)} className="text-[12px] text-[#DC2626]">
              {t("profile.edit.removePhoto")}
            </button>
          )}
        </div>

        {/* Identity */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <h3 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("profile.edit.identity")}</h3>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("profile.edit.fullName")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("profile.edit.namePlaceholder")}
              className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]"
            />
          </div>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("profile.edit.phone")}</label>
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-4 h-12">
              <span className="text-[14px] text-[#6B7280]">+229</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={t("profile.edit.phonePlaceholder")}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("profile.edit.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("profile.edit.emailPlaceholder")}
              className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]"
            />
          </div>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("profile.edit.bio")}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
              placeholder={t("profile.edit.bioPlaceholder")}
              rows={2}
              className="w-full bg-[#F1F5F9] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#14B85A] resize-none"
            />
            <p className="text-[11px] text-[#6B7280] mt-1 text-right">{bio.length}/140</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <h3 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("profile.edit.address")}</h3>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("profile.edit.city")}</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("profile.edit.cityPlaceholder")}
              className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]"
            />
          </div>
          <div>
            <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("profile.edit.addressFull")}</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("profile.edit.addressPlaceholder")}
              className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#14B85A]"
            />
          </div>
        </div>

        {/* Account type */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("profile.edit.accountType")}</h3>
          <div className="grid gap-3">
            {([
              { key: "particulier", label: t("profile.edit.particulier"), icon: User, color: "#14B85A" },
              { key: "commercant", label: t("profile.edit.commercantPro"), icon: Briefcase, color: "#00D4FF" },
            ] as const).map((opt) => {
              const active = accountType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAccountType(opt.key)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                    active ? "border-[#14B85A] bg-[#14B85A]/5" : "border-gray-100 bg-[#F8FAFC]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${opt.color}1F` }}>
                    <opt.icon size={18} style={{ color: opt.color }} />
                  </div>
                  <span style={{ fontWeight: 600 }} className="flex-1">{opt.label}</span>
                  {active && <CheckCircle size={18} className="text-[#14B85A]" />}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
        {saved && (
          <p className="text-[13px] text-[#15803D] flex items-center gap-1">
            <CheckCircle size={14} /> {t("profile.edit.updated")}
          </p>
        )}

        <div className="flex gap-3 pb-2">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="h-12 px-5 rounded-2xl bg-[#F1F5F9] text-[#1F2937] hover:bg-gray-200"
            style={{ fontWeight: 600 }}
          >
            {t("profile.edit.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-12 rounded-2xl bg-[#14B85A] text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontWeight: 600, boxShadow: "0 8px 20px rgba(20,184,90,0.25)" }}
          >
            {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving ? t("pay.processing") : t("profile.edit.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== PAGE 40: PARAMETRES =====
export function SettingsPage() {
  const t = useT();
  const [currency, setCurrency] = useState("XOF");
  const { language, setLanguageCode, languages } = useLanguage();

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("settings.title")}</h1>

      {/* Preferences */}
      <div className="bg-white rounded-2xl p-5 space-y-4" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("settings.preferences")}</h2>
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("settings.currency")}</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none">
            <option value="XOF">{t("settings.currency.xof")}</option>
            <option value="EUR">{t("settings.currency.eur")}</option>
            <option value="USD">{t("settings.currency.usd")}</option>
          </select>
        </div>
        <div>
          <label className="text-[13px] text-[#6B7280] mb-1.5 block">{t("settings.language")}</label>
          <select
            value={language.code}
            onChange={(e) => setLanguageCode(e.target.value)}
            className="w-full h-12 bg-[#F1F5F9] rounded-xl px-4 outline-none"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}{l.nativeLabel !== l.label ? ` — ${l.nativeLabel}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-5 space-y-3" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("settings.notifications")}</h2>
        {[
          t("settings.notif.paymentReceived"),
          t("settings.notif.paymentToConfirm"),
          t("settings.notif.statementReady"),
          t("settings.notif.creditDue"),
          t("settings.notif.lowStock"),
          t("settings.notif.newBonus"),
        ].map(n => (
          <div key={n} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-[14px]">{n}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#14B85A] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl p-5 space-y-3" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("settings.security")}</h2>
        {[
          { icon: Lock, label: t("settings.sec.changePin") },
          { icon: Smartphone, label: t("settings.sec.devices") },
          { icon: Shield, label: t("settings.sec.rules") },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
            <item.icon size={16} className="text-[#6B7280]" />
            <span className="flex-1 text-left text-[14px]">{item.label}</span>
            <ChevronRight size={14} className="text-[#6B7280]" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== PAGE 41: INTEGRATIONS IPPOO =====
export function IntegrationsPage() {
  const t = useT();
  const modules = [
    { name: "IPPOO - SHOP / TROK / OKZ", desc: t("integrations.shop.desc"), icon: Package, color: "bg-[#00D4FF]", connected: true, txCount: 8 },
    { name: "IPPOO - WORK & JOBS", desc: t("integrations.work.desc"), icon: Briefcase, color: "bg-[#3B82F6]", connected: true, txCount: 4 },
    { name: "IPPOO - BROK'IN-VESTS", desc: t("integrations.invest.desc"), icon: TrendingUp, color: "bg-[#00D4FF]", connected: true, txCount: 2 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("integrations.title")}</h1>
      <p className="text-[14px] text-[#6B7280]">{t("integrations.subtitle")}</p>

      <div className="space-y-3">
        {modules.map(m => (
          <div key={m.name} className="bg-white rounded-2xl p-4" >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center shadow-md`}>
                <m.icon size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[14px]" style={{ fontWeight: 600 }}>{m.name}</p>
                <p className="text-[12px] text-[#6B7280]">{m.desc}</p>
              </div>
              <span className="px-3 py-1 bg-[#14B85A]/10 text-[#0E8F45] rounded-full text-[11px]" style={{ fontWeight: 600 }}>
                {m.connected ? t("integrations.connected") : t("integrations.notConnected")}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px] p-3 bg-gray-50 rounded-xl">
              <span className="text-[#6B7280]">{t("integrations.txCount", { count: m.txCount })}</span>
              <NavLink to="/transactions" className="text-[#00D4FF] flex items-center gap-1" style={{ fontWeight: 600 }}>
                {t("integrations.view")} <ExternalLink size={12} />
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== PAGE 42: SUPPORT =====
export function SupportPage() {
  const t = useT();
  const [message, setMessage] = useState("");

  const faqs = [
    { q: t("support.faq1Q"), a: t("support.faq1A") },
    { q: t("support.faq2Q"), a: t("support.faq2A") },
    { q: t("support.faq3Q"), a: t("support.faq3A") },
    { q: t("support.faq4Q"), a: t("support.faq4A") },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={HelpCircle} title={t("support.title")} subtitle={t("support.subtitle")} color="#14B85A" />

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <NavLink to="/support/disputes" className="flex items-center gap-3 bg-white p-4 rounded-2xl hover:shadow-md transition-all" >
          <AlertTriangle size={18} className="text-[#EF4444]" />
          <div>
            <span className="text-[13px]" style={{ fontWeight: 600 }}>{t("support.disputes")}</span>
            <p className="text-[11px] text-[#6B7280]">{t("support.disputesOpen", { count: disputes.filter(d => d.status === "open").length })}</p>
          </div>
        </NavLink>
        <button className="flex items-center gap-3 bg-white p-4 rounded-2xl hover:shadow-md transition-all" >
          <MessageSquare size={18} className="text-[#3B82F6]" />
          <div className="text-left">
            <span className="text-[13px]" style={{ fontWeight: 600 }}>{t("support.contact")}</span>
            <p className="text-[11px] text-[#6B7280]">{t("support.contactSub")}</p>
          </div>
        </button>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("support.faqTitle")}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                <HelpCircle size={14} className="text-[#00D4FF] shrink-0" />
                <span className="flex-1 text-[13px]" style={{ fontWeight: 500 }}>{faq.q}</span>
                <ChevronRight size={14} className="text-[#6B7280] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-[13px] text-[#6B7280] p-3 pl-9">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("support.reportProblem")}</h2>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t("support.problemPlaceholder")}
          className="w-full bg-[#F1F5F9] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#14B85A] min-h-[100px] resize-none text-[14px]"
        />
        <button className="mt-3 w-full h-12 bg-[#14B85A] text-white rounded-2xl flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
          <Send size={16} /> {t("support.sendCta")}
        </button>
      </div>
    </div>
  );
}

// ===== PAGE 43: LITIGES =====
export function DisputesPage() {
  const t = useT();
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/support" className="text-[14px] text-[#6B7280]">{t("disputes.back")}</NavLink>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("disputes.title")}</h1>

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-[#14B85A] text-white rounded-xl text-[13px]">{t("disputes.open")}</button>
        <button className="px-4 py-2 bg-white text-[#6B7280] rounded-xl text-[13px]">{t("disputes.resolved")}</button>
      </div>

      <div className="space-y-3">
        {disputes.map(d => (
          <div key={d.id} className="bg-white rounded-2xl p-4" >
            <div className="flex justify-between mb-2">
              <span className="text-[14px]" style={{ fontWeight: 600 }}>{d.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(d.status)}`}>{getStatusLabel(d.status)}</span>
            </div>
            <p className="text-[13px]">{d.description}</p>
            <p className="text-[12px] text-[#6B7280]">{t("disputes.txLabel", { ref: d.transactionRef, date: formatDate(d.date), amount: formatCFA(d.amount) })}</p>

            {/* Messages */}
            <div className="mt-3 space-y-2">
              {d.messages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl text-[12px] ${msg.from === "Support" ? "bg-[#14B85A]/5" : "bg-gray-50"}`}>
                  <p className="text-[11px] text-[#6B7280]">{msg.from} - {msg.date}</p>
                  <p className="mt-1">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input placeholder={t("disputes.addMessage")} className="flex-1 h-10 bg-[#F1F5F9] rounded-xl px-3 text-[13px] outline-none" />
              <button className="h-10 px-4 bg-[#14B85A] text-white rounded-xl text-[13px]" style={{ fontWeight: 600 }} aria-label={t("disputes.sendMessage")}>
                <Send size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
