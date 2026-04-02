import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: "accent" | "amber" | "mint";
}

const colorMap = {
  accent: {
    bg: "bg-accent/10",
    border: "border-accent/20",
    icon: "text-accent",
    glow: "shadow-[0_0_20px_rgba(108,99,255,0.15)]",
  },
  amber: {
    bg: "bg-brand-amber/10",
    border: "border-brand-amber/20",
    icon: "text-brand-amber",
    glow: "shadow-[0_0_20px_rgba(245,166,35,0.15)]",
  },
  mint: {
    bg: "bg-brand-mint/10",
    border: "border-brand-mint/20",
    icon: "text-brand-mint",
    glow: "shadow-[0_0_20px_rgba(61,214,160,0.15)]",
  },
};

export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "accent",
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`p-6 rounded-2xl bg-surface border border-white/5 hover:border-white/10 transition-colors ${colors.glow}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-brand-mint bg-brand-mint/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </motion.div>
  );
}
