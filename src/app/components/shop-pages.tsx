import { useState, useEffect, useMemo } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { Package, AlertTriangle, Star, Search, Plus, Edit, Trash2, Save } from "lucide-react";
import { formatCFA, getStatusColor, getStatusLabel } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { EmptyState, NoResultsIllustration } from "./illustrations";
import { useT } from "../i18n/language-context";
import { api, type ApiProduct } from "../api/client";
import { useAuth } from "../auth/auth-context";

function useProducts() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.listProducts()
      .then(({ products }) => { if (!cancelled) setProducts(products); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, reloadKey]);

  return { products, loading, error, reload: () => setReloadKey(k => k + 1) };
}

// ===== PAGE 23: GESTION INVENTAIRE =====
export function ShopInventoryPage() {
  const t = useT();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "low_stock" | "out_of_stock">("all");
  const [showForm, setShowForm] = useState(false);
  const { products, loading, reload } = useProducts();

  const filtered = useMemo(() => products.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (searchTerm) return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return true;
  }), [products, filter, searchTerm]);

  const lowStockCount = products.filter(p => p.status === "low_stock").length;
  const outOfStockCount = products.filter(p => p.status === "out_of_stock").length;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Package} title={t("shop.title")} subtitle={t("shop.subtitle", { count: products.length, low: lowStockCount })} color="#F59E0B" />

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex gap-3">
          {lowStockCount > 0 && (
            <div className="flex-1 bg-[#F59E0B]/10 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#D97706]" />
              <span className="text-[12px] text-[#D97706]">{t("shop.lowStock", { count: lowStockCount })}</span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="flex-1 bg-[#EF4444]/10 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#EF4444]" />
              <span className="text-[12px] text-[#EF4444]">{t("shop.outOfStock", { count: outOfStockCount })}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t("shop.searchPlaceholder")} className="w-full h-11 bg-white rounded-xl pl-9 pr-4 outline-none focus:ring-2 focus:ring-[#00D4FF] text-[13px]" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="h-11 bg-white rounded-xl px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]">
          <option value="all">{t("shop.filter.all")}</option>
          <option value="available">{t("shop.filter.available")}</option>
          <option value="low_stock">{t("shop.filter.low")}</option>
          <option value="out_of_stock">{t("shop.filter.out")}</option>
        </select>
        <button onClick={() => setShowForm(s => !s)} className="h-11 px-3 bg-[#14B85A] text-white rounded-xl flex items-center gap-1" style={{ fontWeight: 600 }}>
          <Plus size={16} />
        </button>
      </div>

      {showForm && <ProductForm onCreated={() => { setShowForm(false); reload(); }} onCancel={() => setShowForm(false)} />}

      {loading && products.length === 0 ? (
        <p className="text-[13px] text-[#6B7280] text-center py-8">…</p>
      ) : filtered.length === 0 ? (
        <EmptyState illustration={<NoResultsIllustration size={150} />} title={t("shop.notFound")} subtitle={t("shop.notFoundSub")} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(product => (
            <NavLink key={product.id} to={`/shop/${product.id}`} className="bg-white rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[14px]" style={{ fontWeight: 600 }}>{product.name}</p>
                  <p className="text-[12px] text-[#6B7280]">{product.category}{product.origin ? ` | ${product.origin}` : ""}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(product.status)}`}>
                  {getStatusLabel(product.status)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[16px] text-[#00D4FF]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(product.price)}</span>
                <span className="text-[12px] text-[#6B7280]">{t("shop.stockLabel", { stock: product.stock })}</span>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({ initial, onCreated, onCancel, onUpdated }: {
  initial?: ApiProduct;
  onCreated?: () => void;
  onUpdated?: (p: ApiProduct) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? ""));
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const p = Number(price);
    const s = Number(stock);
    if (!name.trim() || !category.trim()) { setError("Nom et catégorie requis"); return; }
    if (!Number.isFinite(p) || p < 0) { setError("Prix invalide"); return; }
    if (!Number.isInteger(s) || s < 0) { setError("Stock invalide"); return; }
    setBusy(true);
    try {
      if (initial) {
        const { product } = await api.updateProduct(initial.id, { name, category, price: p, stock: s, origin, description });
        onUpdated?.(product);
      } else {
        await api.createProduct({ name, category, price: p, stock: s, origin, description });
        onCreated?.();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 space-y-3">
      <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{initial ? t("shop.editSheet") : t("shop.title")}</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder={t("shop.field.price")?.replace("Prix", "Nom du produit") || "Nom"} className="w-full h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]" />
      <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Catégorie" className="w-full h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]" />
      <div className="grid grid-cols-2 gap-2">
        <input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="Prix (FCFA)" className="h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]" />
        <input value={stock} onChange={e => setStock(e.target.value)} type="number" placeholder="Stock" className="h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]" />
      </div>
      <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Origine" className="w-full h-11 bg-gray-50 rounded-xl px-4 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full bg-gray-50 rounded-xl px-4 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#00D4FF]" />
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} onClick={submit} className="flex-1 h-11 bg-[#14B85A] text-white rounded-xl text-[13px] flex items-center justify-center gap-2 disabled:opacity-60" style={{ fontWeight: 600 }}>
          <Save size={16} /> {busy ? t("common.loading") : t("common.save")}
        </button>
        <button disabled={busy} onClick={onCancel} className="flex-1 h-11 bg-white border rounded-xl text-[13px] text-[#6B7280]" style={{ fontWeight: 600 }}>
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}

// ===== PAGE 24: FICHE PRODUIT =====
export function ProductDetailPage() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api.getProduct(id)
      .then(({ product }) => { if (!cancelled) setProduct(product); })
      .catch(() => { if (!cancelled) setProduct(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="max-w-md mx-auto px-4 py-8 text-[13px] text-[#6B7280]">{t("common.loading")}</div>;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <EmptyState
          illustration={<NoResultsIllustration size={150} />}
          title={t("shop.notFound")}
          subtitle={t("shop.notFoundSub")}
          action={<NavLink to="/shop" className="px-5 h-11 inline-flex items-center rounded-2xl bg-[#00D4FF] text-white text-[13px]" style={{ fontWeight: 600 }}>{t("shop.backToShop")}</NavLink>}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Supprimer ce produit ?")) return;
    setBusy(true);
    try {
      await api.deleteProduct(product.id);
      navigate("/shop");
    } catch {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/shop" className="text-[14px] text-[#6B7280]">{t("shop.backLink")}</NavLink>

      {editing ? (
        <ProductForm
          initial={product}
          onCancel={() => setEditing(false)}
          onUpdated={(p) => { setProduct(p); setEditing(false); }}
        />
      ) : (
        <div className="bg-white rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{product.name}</h1>
              <p className="text-[13px] text-[#6B7280]">{product.category}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[12px] ${getStatusColor(product.status)}`}>
              {getStatusLabel(product.status)}
            </span>
          </div>
          {product.description && <p className="text-[14px] text-[#1F2937] mb-4">{product.description}</p>}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("shop.field.price"), value: formatCFA(product.price) },
              { label: t("shop.field.stock"), value: t("shop.field.stockUnits", { stock: product.stock }) },
              { label: t("shop.field.origin"), value: product.origin || "-" },
              { label: t("shop.field.category"), value: product.category },
            ].map(item => (
              <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[11px] text-[#6B7280]">{item.label}</p>
                <p className="text-[14px]" style={{ fontWeight: 600 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!editing && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setEditing(true)} className="h-12 bg-white border rounded-2xl flex items-center justify-center gap-2 text-[#6B7280] hover:bg-gray-50" style={{ fontWeight: 600 }}>
            <Edit size={16} /> {t("shop.editSheet")}
          </button>
          <button disabled={busy} onClick={handleDelete} className="h-12 bg-[#EF4444] text-white rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60" style={{ fontWeight: 600 }}>
            <Trash2 size={16} /> {t("common.cancel") === "Annuler" ? "Supprimer" : t("common.cancel")}
          </button>
        </div>
      )}
    </div>
  );
}

// ===== PAGE 25: NOTES ET AVIS =====
export function ReviewsPage() {
  const t = useT();
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("reviews.title")}</h1>

      <div className="flex bg-white rounded-2xl p-1">
        <button className="flex-1 py-2.5 bg-[#00D4FF] text-white rounded-xl text-[13px]" style={{ fontWeight: 600 }}>{t("reviews.tab.received")}</button>
        <button className="flex-1 py-2.5 text-[#6B7280] rounded-xl text-[13px]" style={{ fontWeight: 600 }}>{t("reviews.tab.given")}</button>
      </div>

      <EmptyState
        illustration={<NoResultsIllustration size={150} />}
        title={t("reviews.title")}
        subtitle={t("tx.empty.title")}
      />
    </div>
  );
}
