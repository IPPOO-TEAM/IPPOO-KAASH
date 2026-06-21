import { toast } from "sonner";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, MessageSquare, X, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Variant = "info" | "success" | "warning" | "error" | "otp";

const VARIANT: Record<Variant, { icon: LucideIcon; color: string; tint: string }> = {
  info: { icon: Info, color: "#3B82F6", tint: "#3B82F61A" },
  success: { icon: CheckCircle2, color: "#14B85A", tint: "#14B85A1A" },
  warning: { icon: AlertTriangle, color: "#F59E0B", tint: "#F59E0B1A" },
  error: { icon: AlertCircle, color: "#EF4444", tint: "#EF44441A" },
  otp: { icon: MessageSquare, color: "#00D4FF", tint: "#00D4FF1A" },
};

function Card({ variant, title, message, onClose }: { variant: Variant; title: string; message?: string; onClose: () => void }) {
  const { icon: Icon, color, tint } = VARIANT[variant];
  return (
    <div className="w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 p-3 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[14px] text-[#0F172A]" style={{ fontWeight: 600 }}>{title}</p>
        {message && <p className="text-[12.5px] text-[#6B7280] mt-0.5 break-words">{message}</p>}
      </div>
      <button onClick={onClose} className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50">
        <X size={14} />
      </button>
    </div>
  );
}

function show(variant: Variant, title: string, message?: string, duration = 4500) {
  return toast.custom((id) => (
    <Card variant={variant} title={title} message={message} onClose={() => toast.dismiss(id)} />
  ), { duration });
}

function ActionCard({ title, message, actionLabel, onAction, onClose }: { title: string; message?: string; actionLabel: string; onAction: () => void; onClose: () => void }) {
  return (
    <div className="w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 p-3 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#00D4FF1A" }}>
        <Download size={18} style={{ color: "#00D4FF" }} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[14px] text-[#0F172A]" style={{ fontWeight: 600 }}>{title}</p>
        {message && <p className="text-[12.5px] text-[#6B7280] mt-0.5 break-words">{message}</p>}
        <button
          onClick={onAction}
          className="mt-2 px-3 h-8 rounded-lg bg-[#00D4FF] text-white text-[12px]"
          style={{ fontWeight: 600 }}
        >
          {actionLabel}
        </button>
      </div>
      <button onClick={onClose} className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50">
        <X size={14} />
      </button>
    </div>
  );
}

export const notify = {
  install: (title: string, message: string, actionLabel: string, onAction: () => void) =>
    toast.custom((id) => (
      <ActionCard
        title={title}
        message={message}
        actionLabel={actionLabel}
        onAction={() => { toast.dismiss(id); onAction(); }}
        onClose={() => toast.dismiss(id)}
      />
    ), { duration: 15000 }),
  info: (title: string, message?: string) => show("info", title, message),
  success: (title: string, message?: string) => show("success", title, message),
  warning: (title: string, message?: string) => show("warning", title, message),
  error: (title: string, message?: string) => show("error", title, message),
  otp: (code: string, phone?: string) => show("otp", `Code SMS : ${code}`, phone ? `Envoyé au +229 ${phone}` : "Mode sandbox — utilisez ce code pour vous connecter", 12000),
};
