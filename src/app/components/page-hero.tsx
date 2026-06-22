import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface PageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  color?: string;
}

export function PageHero({ icon: Icon, title, subtitle, color = "#14B85A" }: PageHeroProps) {
  return (
    <motion.div
      className="flex items-center gap-3 pt-1"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
        style={{ backgroundColor: `${color}15` }}
        initial={{ scale: 0.6, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
        whileHover={{ scale: 1.08, rotate: 4 }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-2xl"
          style={{ backgroundColor: color, opacity: 0.2 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <Icon size={22} style={{ color, position: "relative", zIndex: 1 }} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <motion.h1
          className="text-[#0F172A] truncate"
          style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.15 }}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-[#6B7280] text-[13px] truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
