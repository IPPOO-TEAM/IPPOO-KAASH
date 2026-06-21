import { useState, useEffect, useMemo } from "react";
import { useParams, NavLink } from "react-router";
import { FileText, Receipt, Download, Share2, Archive, Search, Eye } from "lucide-react";
import { formatCFA, formatDate, getStatusColor, getStatusLabel } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { useT } from "../i18n/language-context";
import { api, type ApiTransaction } from "../api/client";
import { useAuth } from "../auth/auth-context";
import { EmptyState, EmptyInboxIllustration } from "./illustrations";
import { toast } from "sonner";

interface Doc {
  id: string;
  date: string;
  type: "invoice" | "receipt";
  description: string;
  amount: number;
  counterparty: string;
  status: "paid" | "unpaid" | "overdue";
  transactionRef: string;
  raw: ApiTransaction;
}

function toDoc(tx: ApiTransaction, fallbackName: string): Doc {
  const type = tx.type === "income" ? "invoice" : "receipt";
  const status: Doc["status"] = tx.status === "confirmed" ? "paid" : tx.status === "pending" ? "unpaid" : "overdue";
  return {
    id: `${type === "invoice" ? "FAC" : "REC"}-${tx.id.toUpperCase()}`,
    date: tx.date.slice(0, 10),
    type,
    description: tx.description,
    amount: tx.amount,
    counterparty: tx.type === "income" ? fallbackName : "Vous",
    status,
    transactionRef: tx.id,
    raw: tx,
  };
}

function downloadInvoice(doc: Doc) {
  const lines = [
    `${doc.type === "invoice" ? "FACTURE" : "REÇU"} ${doc.id}`,
    `Date: ${formatDate(doc.date)}`,
    `Référence transaction: ${doc.transactionRef}`,
    `Contrepartie: ${doc.counterparty}`,
    `Description: ${doc.description}`,
    `Montant: ${formatCFA(doc.amount)}`,
    `Statut: ${getStatusLabel(doc.status)}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareInvoice(doc: Doc) {
  const text = `${doc.type === "invoice" ? "Facture" : "Reçu"} ${doc.id} — ${formatCFA(doc.amount)} (${doc.description})`;
  try {
    if (navigator.share) await navigator.share({ title: doc.id, text });
    else { await navigator.clipboard.writeText(text); toast.success("Copié dans le presse-papiers"); }
  } catch { /* user cancelled */ }
}

// ===== PAGE 19: DOCUMENTS (FACTURES / RECUS) =====
export function DocumentsPage() {
  const t = useT();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"invoices" | "receipts">("invoices");
  const [searchTerm, setSearchTerm] = useState("");
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

  const docs = useMemo(() => {
    const fallbackName = user?.fullName ?? "Contrepartie";
    return transactions.map(tx => toDoc(tx, fallbackName));
  }, [transactions, user?.fullName]);

  const filtered = docs.filter(doc => {
    const matchTab = tab === "invoices" ? doc.type === "invoice" : doc.type === "receipt";
    if (!matchTab) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return doc.description.toLowerCase().includes(s) || doc.id.toLowerCase().includes(s) || doc.counterparty.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={FileText} title={t("documents.title")} subtitle={t("documents.subtitle")} color="#00D4FF" />

      <div className="flex bg-white rounded-2xl p-1">
        <button
          onClick={() => setTab("invoices")}
          className={`flex-1 py-3 rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 ${tab === "invoices" ? "bg-[#00D4FF] text-white shadow-md" : "text-[#6B7280]"}`}
          style={{ fontWeight: 600 }}
        >
          <FileText size={16} /> {t("documents.tab.invoices")}
        </button>
        <button
          onClick={() => setTab("receipts")}
          className={`flex-1 py-3 rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 ${tab === "receipts" ? "bg-[#00D4FF] text-white shadow-md" : "text-[#6B7280]"}`}
          style={{ fontWeight: 600 }}
        >
          <Receipt size={16} /> {t("documents.tab.receipts")}
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t("documents.searchPlaceholder")}
          className="w-full h-12 bg-white rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#00D4FF] text-[14px]"
        />
      </div>

      {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
      {loading && filtered.length === 0 && <p className="text-[13px] text-[#6B7280]">…</p>}

      {filtered.length === 0 && !loading ? (
        <EmptyState
          illustration={<EmptyInboxIllustration size={140} />}
          title={tab === "invoices" ? "Aucune facture" : "Aucun reçu"}
          subtitle={tab === "invoices" ? "Vos encaissements apparaîtront ici" : "Vos paiements apparaîtront ici"}
        />
      ) : (
      <div className="space-y-3">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[14px]" style={{ fontWeight: 600 }}>{doc.id}</p>
                <p className="text-[13px] text-[#1F2937]">{doc.description}</p>
                <p className="text-[12px] text-[#6B7280]">{doc.counterparty} | {formatDate(doc.date)}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(doc.status)}`}>
                {getStatusLabel(doc.status)}
              </span>
            </div>
            <p className="text-[18px] text-[#00D4FF]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(doc.amount)}</p>
            <div className="flex gap-2 mt-3">
              <NavLink to={`/documents/${doc.transactionRef}`} className="flex-1 h-9 bg-gray-50 rounded-xl text-[12px] flex items-center justify-center gap-1 hover:bg-gray-100" style={{ fontWeight: 500 }}>
                <Eye size={14} /> {t("documents.view")}
              </NavLink>
              <button onClick={() => downloadInvoice(doc)} className="flex-1 h-9 bg-gray-50 rounded-xl text-[12px] flex items-center justify-center gap-1 hover:bg-gray-100" style={{ fontWeight: 500 }}>
                <Download size={14} /> {t("documents.download")}
              </button>
              <button onClick={() => shareInvoice(doc)} className="flex-1 h-9 bg-gray-50 rounded-xl text-[12px] flex items-center justify-center gap-1 hover:bg-gray-100" style={{ fontWeight: 500 }}>
                <Share2 size={14} /> {t("documents.share")}
              </button>
              <button className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100" aria-label={t("documents.archive")}>
                <Archive size={14} className="text-[#6B7280]" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

// ===== PAGE 20: VUE GENERATION FACTURE =====
export function InvoiceGeneratorPage() {
  const t = useT();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    const fallbackName = user?.fullName ?? "Contrepartie";
    setLoading(true);
    let cancelled = false;
    const fetcher = id
      ? api.getTransaction(id).then(({ transaction }) => [transaction])
      : api.listTransactions().then(({ transactions }) => transactions.filter(tx => tx.type === "income"));
    fetcher
      .then(list => {
        if (cancelled) return;
        const first = list[0];
        if (first) setDoc(toDoc(first, fallbackName));
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isAuthenticated, user?.fullName]);

  if (loading && !doc) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-3">
        <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("invoice.preview")}</h1>
        <p className="text-[13px] text-[#6B7280]">{error || "Aucune facture à afficher"}</p>
      </div>
    );
  }

  const item = { designation: doc.description, qty: 1, unitPrice: doc.amount, total: doc.amount };

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("invoice.preview")}</h1>
      <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: "0 8px 20px rgba(11,18,32,0.1)" }}>
        <div className="flex justify-between items-start">
          <div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#00D4FF" }}>{t("invoice.invoice")}</h2>
            <p className="text-[13px] text-[#6B7280]">{doc.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#6B7280]">{t("invoice.dateLabel", { date: formatDate(doc.date) })}</p>
            <p className="text-[12px] text-[#6B7280]">{t("invoice.txRef", { ref: doc.transactionRef })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-[#6B7280] mb-1">{t("invoice.issuer")}</p>
            <p style={{ fontWeight: 600 }}>{user?.fullName ?? t("invoice.issuerName")}</p>
            <p className="text-[#6B7280]">{user?.city ?? t("invoice.issuerCity")}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-[#6B7280] mb-1">{t("invoice.client")}</p>
            <p style={{ fontWeight: 600 }}>{doc.counterparty}</p>
            <p className="text-[#6B7280]">{t("invoice.clientCity")}</p>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-4 gap-2 text-[11px] text-[#6B7280] pb-2 border-b">
            <span className="col-span-1">{t("invoice.col.designation")}</span>
            <span className="text-center">{t("invoice.col.qty")}</span>
            <span className="text-right">{t("invoice.col.unitPrice")}</span>
            <span className="text-right">{t("invoice.col.total")}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[13px] py-2 border-b border-gray-50">
            <span className="col-span-1 truncate">{item.designation}</span>
            <span className="text-center">{item.qty}</span>
            <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCFA(item.unitPrice)}</span>
            <span className="text-right" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCFA(item.total)}</span>
          </div>
          <div className="flex justify-between pt-3 text-[16px]">
            <span style={{ fontWeight: 700 }}>{t("invoice.total")}</span>
            <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }} className="text-[#00D4FF]">{formatCFA(doc.amount)}</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-[#6B7280] pt-3 border-t">
          <p>{t("invoice.footer")}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => downloadInvoice(doc)} className="flex-1 h-12 bg-[#00D4FF] text-white rounded-2xl flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
          <Download size={16} /> {t("invoice.exportPdf")}
        </button>
        <button onClick={() => shareInvoice(doc)} className="flex-1 h-12 bg-white border rounded-2xl flex items-center justify-center gap-2 text-[#6B7280]" style={{ fontWeight: 600 }}>
          <Share2 size={16} /> {t("invoice.share")}
        </button>
      </div>
    </div>
  );
}
