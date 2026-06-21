import { useState } from "react";
import { NavLink, useParams } from "react-router";
import { Package, Truck, CreditCard, ChevronRight, Download, FileText, Clock, CheckCircle } from "lucide-react";
import { orders, formatCFA, formatDate, getStatusColor, getStatusLabel } from "../data/mock-data";
import { PageHero } from "./page-hero";
import { EmptyState, NoResultsIllustration } from "./illustrations";
import { useT } from "../i18n/language-context";

// ===== PAGE 17: SUIVI DES COMMANDES =====
export function OrdersPage() {
  const t = useT();
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  const filtered = filter === "all" ? orders : orders.filter(o => o.paymentStatus === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 space-y-5">
      <PageHero icon={Package} title={t("orders.title")} subtitle={t("orders.subtitle")} color="#3B82F6" />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "all" as const, label: t("orders.filter.all") },
          { key: "pending" as const, label: t("orders.filter.pending") },
          { key: "confirmed" as const, label: t("orders.filter.paid") },
          { key: "cancelled" as const, label: t("orders.filter.cancelled") },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all ${filter === f.key ? "bg-[#14B85A] text-white" : "bg-white text-[#6B7280]"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <NavLink
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-2xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex justify-between mb-2">
              <span className="text-[14px]" style={{ fontWeight: 600 }}>{order.id}</span>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(order.paymentStatus)}`}>
                  {getStatusLabel(order.paymentStatus)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(order.deliveryStatus)}`}>
                  {getStatusLabel(order.deliveryStatus)}
                </span>
              </div>
            </div>
            <p className="text-[13px] text-[#6B7280]">{order.items.map(i => `${i.name} x${i.qty}`).join(", ")}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] text-[#6B7280]">{order.seller} → {order.buyer} | {formatDate(order.date)}</span>
              <span className="text-[16px]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCFA(order.total)}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ===== PAGE 18: DETAIL COMMANDE =====
export function OrderDetailPage() {
  const t = useT();
  const { id } = useParams();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <EmptyState
          illustration={<NoResultsIllustration size={150} />}
          title={t("orders.notFound")}
          subtitle={t("orders.notFoundSub")}
          action={<NavLink to="/orders" className="px-5 h-11 inline-flex items-center rounded-2xl bg-[#00D4FF] text-white text-[13px]" style={{ fontWeight: 600 }}>{t("orders.back")}</NavLink>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 lg:px-6 py-5 space-y-5">
      <NavLink to="/orders" className="text-[14px] text-[#6B7280] hover:text-[#1F2937]">{t("orders.backLink")}</NavLink>

      <PageHero icon={Package} title={t("orders.titleWithId", { id: order.id })} subtitle={formatDate(order.date)} color="#3B82F6" />

      {/* Items */}
      <div className="bg-white rounded-2xl p-5" >
        <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("orders.items")}</h2>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-[14px] py-2 border-b border-gray-50">
              <div>
                <p style={{ fontWeight: 500 }}>{item.name}</p>
                <p className="text-[12px] text-[#6B7280]">{t("orders.qty", { qty: item.qty, price: formatCFA(item.price) })}</p>
              </div>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCFA(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <span style={{ fontWeight: 700 }}>{t("common.total")}</span>
            <span style={{ fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatCFA(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Statuts */}
      <div className="bg-white rounded-2xl p-5 space-y-3" >
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{t("orders.statuses")}</h2>
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B7280]">{t("orders.payment")}</span>
          <span className={`px-3 py-1 rounded-full text-[12px] ${getStatusColor(order.paymentStatus)}`}>{getStatusLabel(order.paymentStatus)}</span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B7280]">{t("orders.delivery")}</span>
          <span className={`px-3 py-1 rounded-full text-[12px] ${getStatusColor(order.deliveryStatus)}`}>{getStatusLabel(order.deliveryStatus)}</span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B7280]">{t("orders.seller")}</span>
          <span style={{ fontWeight: 500 }}>{order.seller}</span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B7280]">{t("orders.buyer")}</span>
          <span style={{ fontWeight: 500 }}>{order.buyer}</span>
        </div>
        {order.transactionRef && (
          <NavLink to={`/transactions/${order.transactionRef}`} className="flex items-center justify-between text-[14px] text-[#00D4FF] p-2 bg-[#00D4FF]/5 rounded-xl">
            <span>{t("orders.linkedPayment")}</span>
            <ChevronRight size={14} />
          </NavLink>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="h-12 bg-white border rounded-xl text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50" style={{ fontWeight: 600 }}>
          <Download size={16} /> {t("orders.invoice")}
        </button>
        {order.paymentStatus === "pending" && (
          <button className="h-12 bg-[#00D4FF] text-white rounded-xl text-[13px] flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            <CreditCard size={16} /> {t("orders.pay")}
          </button>
        )}
      </div>
    </div>
  );
}
