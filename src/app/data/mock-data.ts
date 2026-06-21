// ===== IMAGES =====
// Toutes les images sont liées à l'argent, aux transactions et à la finance.
export const IMAGES = {
  // Femme commerçante avec smartphone devant un étal — mobile money / encaissement marchand
  marketVendor: "https://images.unsplash.com/photo-1687422809654-579d81c29d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Petit entrepreneur africain tenant un billet — gestion de cash
  entrepreneur: "https://images.unsplash.com/photo-1680762556240-14bf288eb05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Main approchant une carte d'un terminal de paiement — transaction sans contact
  artisan: "https://images.unsplash.com/photo-1775751678032-216d96fc26ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Tableau de bord financier avec graphiques — analytics & croissance
  cooperative: "https://images.unsplash.com/photo-1763038311036-6d18805537e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Terminal POS tenu en main — encaissement professionnel
  transport: "https://images.unsplash.com/photo-1726066012825-b1ab9ba6e158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Pièce déposée dans une tirelire — épargne et investissement
  farmer: "https://images.unsplash.com/photo-1769676391614-ee47569b1c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Main tenant carte et smartphone — paiement mobile
  mobilePay: "https://images.unsplash.com/photo-1758876202400-64edbefc2256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Caisse enregistreuse — point de vente
  shop: "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Billets de banque — liquidités
  cash: "https://images.unsplash.com/photo-1579940906483-0ea99f5d04bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Scan QR avec smartphone — paiement par QR Code
  qrPay: "https://images.unsplash.com/photo-1662383729882-e03ce8e00887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  // Graphique de croissance — performance financière
  analytics: "https://images.unsplash.com/photo-1587400563263-e77a5590bfe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
};

// ===== TRANSACTIONS =====
export type TransactionStatus = "confirmed" | "pending" | "cancelled" | "failed" | "refunded";
export type TransactionType = "income" | "expense";
export type TransactionCategory = "vente" | "prestation" | "transport" | "cotisation" | "investissement" | "crédit" | "épargne" | "bonus" | "facture" | "retrait" | "recharge";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  payerName: string;
  beneficiaryName: string;
  status: TransactionStatus;
  reference: string;
  module?: string;
}

export const transactions: Transaction[] = [
  { id: "TX-001", date: "2026-02-21", amount: 150000, type: "income", category: "vente", description: "Vente de tissus wax", payerName: "Amina K.", beneficiaryName: "Ma Boutique", status: "confirmed", reference: "CMD-2024-001", module: "IPPOO-SHOP" },
  { id: "TX-002", date: "2026-02-21", amount: 35000, type: "expense", category: "transport", description: "Livraison Cotonou-Parakou", payerName: "Ma Boutique", beneficiaryName: "TransExpress", status: "confirmed", reference: "LIV-2024-012", module: "IPPOO-SHOP" },
  { id: "TX-003", date: "2026-02-20", amount: 75000, type: "income", category: "prestation", description: "Mission design graphique", payerName: "Entreprise ABC", beneficiaryName: "Kofi D.", status: "pending", reference: "MIS-2024-005", module: "IPPOO-WORK" },
  { id: "TX-004", date: "2026-02-20", amount: 25000, type: "expense", category: "cotisation", description: "Cotisation assurance transport", payerName: "Kofi D.", beneficiaryName: "AssurPlus", status: "confirmed", reference: "COT-2024-008" },
  { id: "TX-005", date: "2026-02-19", amount: 500000, type: "income", category: "investissement", description: "Retour investissement Projet Solaire", payerName: "BROK'IN-VESTS", beneficiaryName: "Kofi D.", status: "confirmed", reference: "INV-2024-003", module: "BROK'IN-VESTS" },
  { id: "TX-006", date: "2026-02-19", amount: 12000, type: "expense", category: "facture", description: "Facture SBEE - Électricité", payerName: "Kofi D.", beneficiaryName: "SBEE", status: "confirmed", reference: "FAC-2024-019" },
  { id: "TX-007", date: "2026-02-18", amount: 200000, type: "income", category: "vente", description: "Vente lot de chaussures", payerName: "Boutique Style", beneficiaryName: "Ma Boutique", status: "confirmed", reference: "CMD-2024-002", module: "IPPOO-SHOP" },
  { id: "TX-008", date: "2026-02-18", amount: 50000, type: "expense", category: "recharge", description: "Recharge compte IPPOO-CASH", payerName: "MTN Mobile", beneficiaryName: "Kofi D.", status: "confirmed", reference: "RCH-2024-007" },
  { id: "TX-009", date: "2026-02-17", amount: 180000, type: "income", category: "prestation", description: "Formation comptabilité PME", payerName: "COGEF", beneficiaryName: "Kofi D.", status: "pending", reference: "MIS-2024-006", module: "IPPOO-WORK" },
  { id: "TX-010", date: "2026-02-17", amount: 30000, type: "expense", category: "cotisation", description: "Cotisation crédit coopérative", payerName: "Kofi D.", beneficiaryName: "CoopFinance", status: "confirmed", reference: "COT-2024-009" },
  { id: "TX-011", date: "2026-02-16", amount: 95000, type: "income", category: "vente", description: "Vente produits cosmétiques", payerName: "Marie T.", beneficiaryName: "Ma Boutique", status: "confirmed", reference: "CMD-2024-003", module: "IPPOO-SHOP" },
  { id: "TX-012", date: "2026-02-16", amount: 15000, type: "expense", category: "facture", description: "Abonnement internet", payerName: "Kofi D.", beneficiaryName: "ISOCEL", status: "failed", reference: "FAC-2024-020" },
  { id: "TX-013", date: "2026-02-15", amount: 45000, type: "income", category: "bonus", description: "Bonus performance mensuel", payerName: "IPPOO", beneficiaryName: "Kofi D.", status: "confirmed", reference: "BON-2024-002" },
  { id: "TX-014", date: "2026-02-14", amount: 100000, type: "expense", category: "retrait", description: "Retrait vers MTN Mobile Money", payerName: "Kofi D.", beneficiaryName: "MTN MoMo", status: "confirmed", reference: "RET-2024-004" },
  { id: "TX-015", date: "2026-02-14", amount: 250000, type: "income", category: "vente", description: "Commande groupée textiles", payerName: "Asso Couturières", beneficiaryName: "Ma Boutique", status: "confirmed", reference: "CMD-2024-004", module: "IPPOO-SHOP" },
];

// ===== ORDERS =====
export interface Order {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  seller: string;
  buyer: string;
  paymentStatus: TransactionStatus;
  deliveryStatus: "pending" | "shipped" | "delivered" | "cancelled";
  transactionRef: string;
}

export const orders: Order[] = [
  { id: "CMD-2024-001", date: "2026-02-21", items: [{ name: "Tissus wax (lot 10m)", qty: 5, price: 30000 }], total: 150000, seller: "Ma Boutique", buyer: "Amina K.", paymentStatus: "confirmed", deliveryStatus: "delivered", transactionRef: "TX-001" },
  { id: "CMD-2024-002", date: "2026-02-18", items: [{ name: "Chaussures cuir artisanal", qty: 10, price: 20000 }], total: 200000, seller: "Ma Boutique", buyer: "Boutique Style", paymentStatus: "confirmed", deliveryStatus: "shipped", transactionRef: "TX-007" },
  { id: "CMD-2024-003", date: "2026-02-16", items: [{ name: "Crème hydratante bio", qty: 20, price: 3500 }, { name: "Savon noir artisanal", qty: 10, price: 2500 }], total: 95000, seller: "Ma Boutique", buyer: "Marie T.", paymentStatus: "confirmed", deliveryStatus: "delivered", transactionRef: "TX-011" },
  { id: "CMD-2024-004", date: "2026-02-14", items: [{ name: "Tissu pagne (lot)", qty: 25, price: 10000 }], total: 250000, seller: "Ma Boutique", buyer: "Asso Couturières", paymentStatus: "confirmed", deliveryStatus: "pending", transactionRef: "TX-015" },
  { id: "CMD-2024-005", date: "2026-02-13", items: [{ name: "Sac en raphia", qty: 15, price: 8000 }], total: 120000, seller: "Artisan Raphia", buyer: "Kofi D.", paymentStatus: "pending", deliveryStatus: "pending", transactionRef: "" },
];

// ===== INVOICES & RECEIPTS =====
export interface Invoice {
  id: string;
  date: string;
  type: "invoice" | "receipt";
  description: string;
  amount: number;
  client: string;
  status: "paid" | "unpaid" | "overdue";
  items: { designation: string; qty: number; unitPrice: number; total: number }[];
  transactionRef: string;
}

export const invoices: Invoice[] = [
  { id: "FAC-2024-001", date: "2026-02-21", type: "invoice", description: "Vente tissus wax", amount: 150000, client: "Amina K.", status: "paid", items: [{ designation: "Tissus wax (lot 10m)", qty: 5, unitPrice: 30000, total: 150000 }], transactionRef: "TX-001" },
  { id: "FAC-2024-002", date: "2026-02-18", type: "invoice", description: "Lot chaussures", amount: 200000, client: "Boutique Style", status: "paid", items: [{ designation: "Chaussures cuir artisanal", qty: 10, unitPrice: 20000, total: 200000 }], transactionRef: "TX-007" },
  { id: "REC-2024-001", date: "2026-02-21", type: "receipt", description: "Reçu paiement tissus", amount: 150000, client: "Amina K.", status: "paid", items: [{ designation: "Tissus wax", qty: 5, unitPrice: 30000, total: 150000 }], transactionRef: "TX-001" },
  { id: "FAC-2024-003", date: "2026-02-16", type: "invoice", description: "Produits cosmétiques", amount: 95000, client: "Marie T.", status: "paid", items: [{ designation: "Crème hydratante bio", qty: 20, unitPrice: 3500, total: 70000 }, { designation: "Savon noir artisanal", qty: 10, unitPrice: 2500, total: 25000 }], transactionRef: "TX-011" },
  { id: "FAC-2024-004", date: "2026-02-14", type: "invoice", description: "Commande textiles", amount: 250000, client: "Asso Couturières", status: "unpaid", items: [{ designation: "Tissu pagne (lot)", qty: 25, unitPrice: 10000, total: 250000 }], transactionRef: "TX-015" },
];

// ===== PAYMENT REQUESTS =====
export interface PaymentRequest {
  id: string;
  date: string;
  amount: number;
  description: string;
  payerName: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  reference: string;
}

export const paymentRequests: PaymentRequest[] = [
  { id: "DEM-001", date: "2026-02-21", amount: 75000, description: "Mission design graphique", payerName: "Entreprise ABC", status: "pending", reference: "MIS-2024-005" },
  { id: "DEM-002", date: "2026-02-20", amount: 180000, description: "Formation comptabilité PME", payerName: "COGEF", status: "pending", reference: "MIS-2024-006" },
  { id: "DEM-003", date: "2026-02-15", amount: 50000, description: "Réparation climatisation", payerName: "Hôtel Prestige", status: "confirmed", reference: "MIS-2024-004" },
  { id: "DEM-004", date: "2026-02-10", amount: 30000, description: "Maintenance informatique", payerName: "Cabinet Juridique", status: "expired", reference: "MIS-2024-003" },
];

// ===== PRODUCTS =====
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock";
  origin: string;
  rating: number;
  reviews: number;
  image?: string;
}

export const products: Product[] = [
  { id: "PRD-001", name: "Tissus Wax Premium", description: "Tissu wax haute qualité, 100% coton", category: "Textile", price: 30000, stock: 45, status: "available", origin: "Bénin", rating: 4.8, reviews: 23 },
  { id: "PRD-002", name: "Chaussures Cuir Artisanal", description: "Chaussures en cuir fait main", category: "Chaussures", price: 20000, stock: 8, status: "low_stock", origin: "Bénin", rating: 4.5, reviews: 15 },
  { id: "PRD-003", name: "Crème Hydratante Bio", description: "Crème naturelle au karité", category: "Cosmétique", price: 3500, stock: 120, status: "available", origin: "Togo", rating: 4.9, reviews: 45 },
  { id: "PRD-004", name: "Savon Noir Artisanal", description: "Savon traditionnel africain", category: "Cosmétique", price: 2500, stock: 0, status: "out_of_stock", origin: "Ghana", rating: 4.7, reviews: 38 },
  { id: "PRD-005", name: "Sac Raphia Tressé", description: "Sac artisanal en raphia naturel", category: "Accessoire", price: 8000, stock: 25, status: "available", origin: "Madagascar", rating: 4.6, reviews: 12 },
  { id: "PRD-006", name: "Huile de Coco Vierge", description: "Huile de coco pressée à froid", category: "Alimentation", price: 5000, stock: 3, status: "low_stock", origin: "Bénin", rating: 4.8, reviews: 30 },
];

// ===== VOUCHERS =====
export interface Voucher {
  id: string;
  value: number;
  remainingValue: number;
  issuer: string;
  beneficiary: string;
  status: "active" | "used" | "expired" | "cancelled";
  expiryDate: string;
  createdDate: string;
  usageHistory: { date: string; amount: number; reference: string }[];
}

export const vouchers: Voucher[] = [
  { id: "BON-001", value: 50000, remainingValue: 50000, issuer: "IPPOO-SHOP", beneficiary: "Kofi D.", status: "active", expiryDate: "2026-06-30", createdDate: "2026-01-15", usageHistory: [] },
  { id: "BON-002", value: 25000, remainingValue: 10000, issuer: "Ma Boutique", beneficiary: "Amina K.", status: "active", expiryDate: "2026-03-31", createdDate: "2026-01-20", usageHistory: [{ date: "2026-02-10", amount: 15000, reference: "CMD-2024-010" }] },
  { id: "BON-003", value: 100000, remainingValue: 0, issuer: "IPPOO Promo", beneficiary: "Kofi D.", status: "used", expiryDate: "2026-02-28", createdDate: "2025-12-01", usageHistory: [{ date: "2026-01-05", amount: 60000, reference: "CMD-2024-008" }, { date: "2026-01-20", amount: 40000, reference: "CMD-2024-009" }] },
  { id: "BON-004", value: 15000, remainingValue: 15000, issuer: "Boutique Style", beneficiary: "Marie T.", status: "expired", expiryDate: "2026-01-31", createdDate: "2025-11-15", usageHistory: [] },
];

// ===== CREDITS =====
export interface Credit {
  id: string;
  amount: number;
  remainingAmount: number;
  interestRate: number;
  motif: string;
  status: "active" | "pending" | "completed" | "rejected";
  startDate: string;
  endDate: string;
  installments: { date: string; amount: number; status: TransactionStatus }[];
}

export const credits: Credit[] = [
  { id: "CRD-001", amount: 500000, remainingAmount: 350000, interestRate: 5, motif: "Achat stock textile", status: "active", startDate: "2025-12-01", endDate: "2026-06-01", installments: [{ date: "2026-01-01", amount: 50000, status: "confirmed" }, { date: "2026-02-01", amount: 50000, status: "confirmed" }, { date: "2026-03-01", amount: 50000, status: "pending" }] },
  { id: "CRD-002", amount: 200000, remainingAmount: 200000, interestRate: 3, motif: "Équipement atelier", status: "pending", startDate: "", endDate: "", installments: [] },
  { id: "CRD-003", amount: 300000, remainingAmount: 0, interestRate: 4, motif: "Fonds de roulement", status: "completed", startDate: "2025-06-01", endDate: "2025-12-01", installments: [{ date: "2025-07-01", amount: 50000, status: "confirmed" }, { date: "2025-08-01", amount: 50000, status: "confirmed" }, { date: "2025-09-01", amount: 50000, status: "confirmed" }, { date: "2025-10-01", amount: 50000, status: "confirmed" }, { date: "2025-11-01", amount: 50000, status: "confirmed" }, { date: "2025-12-01", amount: 50000, status: "confirmed" }] },
];

// ===== SAVINGS =====
export interface SavingsEntry {
  id: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  balance: number;
}

export const savingsHistory: SavingsEntry[] = [
  { id: "EP-001", date: "2026-02-20", type: "deposit", amount: 50000, balance: 450000 },
  { id: "EP-002", date: "2026-02-15", type: "deposit", amount: 30000, balance: 400000 },
  { id: "EP-003", date: "2026-02-10", type: "withdrawal", amount: 20000, balance: 370000 },
  { id: "EP-004", date: "2026-02-01", type: "deposit", amount: 100000, balance: 390000 },
  { id: "EP-005", date: "2026-01-20", type: "deposit", amount: 40000, balance: 290000 },
];

// ===== GAINS & BONUS =====
export interface GainBonus {
  id: string;
  date: string;
  type: "gain" | "bonus";
  amount: number;
  source: string;
  description: string;
  reference: string;
}

export const gainsBonus: GainBonus[] = [
  { id: "GB-001", date: "2026-02-21", type: "bonus", amount: 45000, source: "Performance", description: "Bonus performance mensuel", reference: "BON-2024-002" },
  { id: "GB-002", date: "2026-02-15", type: "gain", amount: 120000, source: "Investissement", description: "Retour projet immobilier", reference: "INV-2024-005" },
  { id: "GB-003", date: "2026-02-10", type: "bonus", amount: 15000, source: "Parrainage", description: "Bonus parrainage 3 utilisateurs", reference: "PAR-2024-001" },
  { id: "GB-004", date: "2026-02-05", type: "gain", amount: 80000, source: "Commission", description: "Commission ventes février", reference: "COM-2024-003" },
  { id: "GB-005", date: "2026-01-30", type: "bonus", amount: 25000, source: "Fidélité", description: "Bonus fidélité trimestriel", reference: "FID-2024-001" },
];

// ===== INVESTMENTS =====
export interface Investment {
  id: string;
  name: string;
  amount: number;
  returns: number;
  status: "active" | "completed" | "pending";
  startDate: string;
  endDate: string;
  type: string;
  performance: number;
}

export const investments: Investment[] = [
  { id: "INV-001", name: "Projet Solaire Cotonou", amount: 1000000, returns: 500000, status: "active", startDate: "2025-06-01", endDate: "2026-06-01", type: "Energie", performance: 50 },
  { id: "INV-002", name: "Coopérative Agricole Nord", amount: 500000, returns: 75000, status: "active", startDate: "2025-09-01", endDate: "2026-09-01", type: "Agriculture", performance: 15 },
  { id: "INV-003", name: "Immobilier Akpakpa", amount: 2000000, returns: 400000, status: "completed", startDate: "2024-12-01", endDate: "2025-12-01", type: "Immobilier", performance: 20 },
  { id: "INV-004", name: "Startup FinTech", amount: 300000, returns: 0, status: "pending", startDate: "2026-03-01", endDate: "2027-03-01", type: "Technologie", performance: 0 },
];

// ===== CAROUSEL SLIDES (10 publicités) =====
// Couleurs officielles des marques utilisées comme overlay.
export const carouselSlides = [
  {
    id: 1,
    brand: "IPPOO CASH",
    title: "Achat & Vente simplifiés",
    subtitle: "Encaissez et payez en quelques secondes, partout au Bénin",
    cta: "Commencer",
    color: "#14B85A",
    image: "https://images.unsplash.com/photo-1687422809654-579d81c29d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/pay",
  },
  {
    id: 2,
    brand: "Zem Express",
    title: "Payez votre Zem en un scan",
    subtitle: "Plus de monnaie à chercher, scannez et roulez !",
    cta: "Scanner",
    color: "#F59E0B",
    image: "https://images.unsplash.com/photo-1737455337721-61da3a90e399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/qr/scan",
  },
  {
    id: 3,
    brand: "MTN MoMo",
    title: "Rechargez via MTN Mobile Money",
    subtitle: "Crédit instantané sur IPPOO CASH avec 0% de frais ce mois-ci",
    cta: "Recharger",
    color: "#FFCC00", // jaune MTN officiel
    image: "https://images.unsplash.com/photo-1556505591-6e41aa7aedf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/wallet/recharge",
  },
  {
    id: 4,
    brand: "Moov Money",
    title: "Transférez avec Moov Money",
    subtitle: "Vers tout le réseau IPPOO CASH sans frais cachés",
    cta: "Transférer",
    color: "#005CA9", // bleu Moov officiel
    image: "https://images.unsplash.com/photo-1758876202400-64edbefc2256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/transfers",
  },
  {
    id: 5,
    brand: "Celtiis Cash",
    title: "Celtiis Cash partenaire officiel",
    subtitle: "Approvisionnez votre compte avec Celtiis en 1 clic",
    cta: "Approvisionner",
    color: "#E30613", // rouge Celtiis officiel
    image: "https://images.unsplash.com/photo-1627719172031-ab42dc849bc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/wallet/recharge",
  },
  {
    id: 6,
    brand: "Ecobank",
    title: "Liez votre compte Ecobank",
    subtitle: "Virements bancaires instantanés vers IPPOO CASH",
    cta: "Lier mon compte",
    color: "#005CA9", // bleu Ecobank officiel
    image: "https://images.unsplash.com/photo-1661332628354-3ec604f4411d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/banks",
  },
  {
    id: 7,
    brand: "UBA",
    title: "UBA × IPPOO CASH",
    subtitle: "Profitez de virements gratuits depuis votre compte UBA",
    cta: "Activer",
    color: "#C8102E", // rouge UBA officiel
    image: "https://images.unsplash.com/photo-1625708237294-8042f5d812de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/banks",
  },
  {
    id: 8,
    brand: "BROK'IN-VESTS",
    title: "Investissez dès 5 000 F CFA",
    subtitle: "Projets à fort impact avec rendement jusqu'à 12%",
    cta: "Investir",
    color: "#00A3C7",
    image: "https://images.unsplash.com/photo-1587400563263-e77a5590bfe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/investments",
  },
  {
    id: 9,
    brand: "Crédit Express",
    title: "Crédit en 24h",
    subtitle: "Boostez votre activité avec un microcrédit instantané",
    cta: "Demander",
    color: "#7C3AED",
    image: "https://images.unsplash.com/photo-1659352790409-4850b3fc2d62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/credit",
  },
  {
    id: 10,
    brand: "Épargne+",
    title: "Épargnez et gagnez jusqu'à 8%",
    subtitle: "Mettez de côté chaque jour, même 500 F CFA",
    cta: "Ouvrir un livret",
    color: "#0A4D2C",
    image: "https://images.unsplash.com/photo-1769676391614-ee47569b1c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    link: "/savings",
  },
];

// ===== COTISATIONS =====
export interface Cotisation {
  id: string;
  name: string;
  amount: number;
  period: string;
  beneficiary: string;
  status: "due" | "paid" | "overdue";
  dueDate: string;
}

export const cotisations: Cotisation[] = [
  { id: "COT-001", name: "Assurance transport", amount: 25000, period: "Février 2026", beneficiary: "AssurPlus", status: "paid", dueDate: "2026-02-28" },
  { id: "COT-002", name: "Crédit coopérative", amount: 50000, period: "Mars 2026", beneficiary: "CoopFinance", status: "due", dueDate: "2026-03-01" },
  { id: "COT-003", name: "Mutuelle santé", amount: 15000, period: "Mars 2026", beneficiary: "MutuelleBenin", status: "due", dueDate: "2026-03-05" },
  { id: "COT-004", name: "Franchise IPPOO", amount: 35000, period: "Trimestre 1", beneficiary: "IPPOO", status: "overdue", dueDate: "2026-01-31" },
];

// ===== SERVICE BILLS =====
export interface ServiceBill {
  id: string;
  service: string;
  period: string;
  amount: number;
  reference: string;
  status: "paid" | "unpaid" | "overdue";
  dueDate: string;
}

export const serviceBills: ServiceBill[] = [
  { id: "SRV-001", service: "SBEE - Électricité", period: "Janvier 2026", amount: 12000, reference: "SBEE-2026-01", status: "paid", dueDate: "2026-02-15" },
  { id: "SRV-002", service: "SONEB - Eau", period: "Janvier 2026", amount: 8500, reference: "SONEB-2026-01", status: "unpaid", dueDate: "2026-02-28" },
  { id: "SRV-003", service: "ISOCEL - Internet", period: "Février 2026", amount: 15000, reference: "ISO-2026-02", status: "unpaid", dueDate: "2026-03-05" },
  { id: "SRV-004", service: "MTN - Téléphone", period: "Février 2026", amount: 5000, reference: "MTN-2026-02", status: "paid", dueDate: "2026-02-20" },
];

// ===== DISPUTES =====
export interface Dispute {
  id: string;
  transactionRef: string;
  date: string;
  amount: number;
  description: string;
  status: "open" | "resolved" | "closed";
  messages: { date: string; from: string; text: string }[];
}

export const disputes: Dispute[] = [
  { id: "LIT-001", transactionRef: "TX-012", date: "2026-02-16", amount: 15000, description: "Paiement échoué mais montant débité", status: "open", messages: [{ date: "2026-02-16", from: "Kofi D.", text: "Le paiement a échoué mais le montant a été prélevé" }, { date: "2026-02-17", from: "Support", text: "Nous vérifions avec l'opérateur, merci de patienter" }] },
  { id: "LIT-002", transactionRef: "TX-009", date: "2026-02-18", amount: 180000, description: "Paiement mission non confirmé par le client", status: "open", messages: [{ date: "2026-02-18", from: "Kofi D.", text: "La mission est terminée mais le client ne confirme pas" }] },
];

// ===== HELPERS =====
export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " F CFA";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed": case "paid": case "completed": case "delivered": case "resolved": case "active":
      return "bg-[#14B85A]/10 text-[#0E8F45]";
    case "pending": case "due": case "shipped":
      return "bg-[#00D4FF]/10 text-[#00A3CC]";
    case "cancelled": case "failed": case "overdue": case "rejected": case "expired": case "out_of_stock":
      return "bg-[#EF4444]/10 text-[#DC2626]";
    case "refunded": case "open":
      return "bg-[#8B5CF6]/10 text-[#7C3AED]";
    case "low_stock": case "used":
      return "bg-[#F59E0B]/10 text-[#D97706]";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé", failed: "Échoué",
    refunded: "Remboursé", paid: "Payé", unpaid: "Non payé", overdue: "En retard",
    active: "Actif", completed: "Soldé", rejected: "Refusé", expired: "Expiré",
    delivered: "Livré", shipped: "Expédié", open: "Ouvert", resolved: "Résolu",
    closed: "Fermé", due: "À payer", used: "Utilisé", available: "Disponible",
    low_stock: "Stock faible", out_of_stock: "Rupture"
  };
  return labels[status] || status;
}