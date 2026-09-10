import React from "react";
import { LucideIcon } from "lucide-react";
import { formatTaka } from "@/src/utils/formatters";

interface SummaryCardProps {
  id: string;
  title: string;
  amount: number;
  subtitle?: string;
  icon: LucideIcon;
  variant: "sales" | "paid" | "due";
  onClick?: () => void;
  interactiveHint?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  id,
  title,
  amount,
  subtitle,
  icon: Icon,
  variant,
  onClick,
  interactiveHint,
}) => {
  const styles = {
    sales: {
      card: "bg-white border-stone-200 hover:border-amber-400/80 active:bg-amber-50/30",
      iconBg: "bg-amber-100/80 text-amber-800",
      amountColor: "text-stone-900",
      pill: "bg-amber-50 text-amber-800 border-amber-200/60",
    },
    paid: {
      card: "bg-white border-stone-200 hover:border-emerald-400/80 active:bg-emerald-50/30",
      iconBg: "bg-emerald-100/80 text-emerald-800",
      amountColor: "text-emerald-700",
      pill: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    },
    due: {
      card: "bg-white border-stone-200 hover:border-rose-300 active:bg-rose-50/30 ring-1 ring-rose-200/50",
      iconBg: "bg-rose-100/80 text-rose-700",
      amountColor: "text-rose-600",
      pill: "bg-rose-50 text-rose-700 border-rose-200/60",
    },
  }[variant];

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 shadow-xs flex flex-col justify-between relative overflow-hidden group ${
        styles.card
      } ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm sm:text-base font-semibold text-stone-600">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-1">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${styles.amountColor}`}>
          {formatTaka(amount)}
        </div>
      </div>

      {(subtitle || interactiveHint) && (
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>{subtitle || "হিসাব খাতা"}</span>
          {interactiveHint && (
            <span className="font-semibold text-emerald-700 group-hover:underline flex items-center gap-0.5">
              {interactiveHint} &rarr;
            </span>
          )}
        </div>
      )}
    </button>
  );
};
