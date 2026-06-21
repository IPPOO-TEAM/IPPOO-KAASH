import { motion } from "motion/react";
import type { ReactNode } from "react";

interface IllustrationProps {
  size?: number;
  className?: string;
}

interface EmptyStateProps {
  illustration: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ illustration, title, subtitle, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center py-10 px-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4">{illustration}</div>
      <h3 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{title}</h3>
      {subtitle && <p className="text-[13px] text-[#6B7280] mt-1.5 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export function EmptyInboxIllustration({ size = 160, className = "" }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 200 170"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <motion.ellipse cx="100" cy="148" rx="65" ry="7" fill="#0F172A" opacity="0.06"
        animate={{ rx: [65, 58, 65] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="45" y="55" width="110" height="80" rx="12" fill="#E0F2FE" />
        <path d="M45 67 L100 100 L155 67" stroke="#00D4FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="45" y="55" width="110" height="80" rx="12" stroke="#00D4FF" strokeWidth="2" fill="none" />
      </motion.g>
      <motion.circle cx="60" cy="40" r="5" fill="#14B85A" opacity="0.6"
        animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="145" cy="35" r="4" fill="#F59E0B" opacity="0.6"
        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }} />
    </motion.svg>
  );
}

export function NoResultsIllustration({ size = 160, className = "" }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 200 170"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <motion.ellipse cx="100" cy="148" rx="60" ry="6" fill="#0F172A" opacity="0.06"
        animate={{ rx: [60, 54, 60] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <motion.g animate={{ rotate: [0, -6, 0, 6, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: "100px 90px" }}>
        <circle cx="88" cy="78" r="34" stroke="#14B85A" strokeWidth="6" fill="#F0FDF4" />
        <line x1="113" y1="103" x2="138" y2="128" stroke="#14B85A" strokeWidth="7" strokeLinecap="round" />
        <motion.path d="M76 78 L100 78 M88 66 L88 90"
          stroke="#0E8F45" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
      </motion.g>
    </motion.svg>
  );
}

export function EmptyWalletIllustration({ size = 160, className = "" }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 200 170"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <motion.ellipse
        cx="100"
        cy="150"
        rx="70"
        ry="8"
        fill="#0F172A"
        opacity="0.06"
        animate={{ rx: [70, 64, 70] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="40" y="55" width="120" height="80" rx="14" fill="#14B85A" />
        <rect x="40" y="55" width="120" height="20" rx="14" fill="#0E8F45" />
        <circle cx="135" cy="100" r="10" fill="#FFFFFF" opacity="0.95" />
        <circle cx="135" cy="100" r="4" fill="#14B85A" />
        <rect x="55" y="85" width="38" height="6" rx="3" fill="#FFFFFF" opacity="0.6" />
        <rect x="55" y="98" width="58" height="5" rx="2.5" fill="#FFFFFF" opacity="0.4" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 40px" }}
      >
        <circle cx="50" cy="40" r="14" fill="#F59E0B" />
        <text x="50" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">F</text>
      </motion.g>
      <motion.g
        animate={{ y: [0, -8, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        style={{ transformOrigin: "155px 32px" }}
      >
        <circle cx="155" cy="32" r="11" fill="#00D4FF" />
        <text x="155" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">F</text>
      </motion.g>
    </motion.svg>
  );
}

export function FinanceGrowthIllustration({ size = 200, className = "" }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 240 168"
      fill="none"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14B85A" />
          <stop offset="100%" stopColor="#0E8F45" />
        </linearGradient>
      </defs>
      <line x1="20" y1="140" x2="220" y2="140" stroke="#E5E7EB" strokeWidth="2" />
      {[
        { x: 35, h: 40, d: 0 },
        { x: 75, h: 65, d: 0.1 },
        { x: 115, h: 55, d: 0.2 },
        { x: 155, h: 90, d: 0.3 },
        { x: 195, h: 110, d: 0.4 },
      ].map((b, i) => (
        <motion.rect
          key={i}
          x={b.x}
          width="22"
          rx="4"
          fill="url(#grad-bar)"
          initial={{ height: 0, y: 140 }}
          animate={{ height: b.h, y: 140 - b.h }}
          transition={{ duration: 0.6, delay: b.d, ease: "easeOut" }}
        />
      ))}
      <motion.path
        d="M46 100 Q86 75 126 85 T206 30"
        stroke="#00D4FF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay: 0.4, ease: "easeInOut" }}
      />
      <motion.circle
        cx="206"
        cy="30"
        r="6"
        fill="#00D4FF"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ duration: 0.5, delay: 1.6 }}
      />
    </motion.svg>
  );
}
