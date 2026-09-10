import React from "react";
import { Calendar, TrendingUp, Wallet, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { MonthlySummary } from "@/src/types";
import { formatTaka, toBengaliNumber } from "@/src/utils/formatters";

interface MonthlySummaryReportProps {
  summaries: MonthlySummary[];
  selectedMonthKey?: string | null;
  onSelectMonth?: (monthKey: string | null) => void;
}

export const MonthlySummaryReport: React.FC<MonthlySummaryReportProps> = ({
  summaries,
  selectedMonthKey,
  onSelectMonth,
}) => {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            মাসিক সারসংক্ষেপ রিপোর্ট (মাসভিত্তিক হিসাব)
          </h2>
        </div>
        {selectedMonthKey && onSelectMonth && (
          <button
            onClick={() => onSelectMonth(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            সব মাস দেখুন
          </button>
        )}
      </div>

      {/* Monthly Cards: Horizontal scrollable on mobile or wrapped */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin pt-0.5">
        {summaries.map((month) => {
          const isSelected = selectedMonthKey === month.monthKey;
          return (
            <div
              key={month.monthKey}
              onClick={() => onSelectMonth && onSelectMonth(isSelected ? null : month.monthKey)}
              className={`min-w-[260px] flex-1 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white border-stone-200 hover:border-stone-300 shadow-xs active:bg-stone-50"
              }`}
            >
              {/* Card Header: Month Title & Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-stone-900">
                    {month.monthNameBengali}
                  </span>
                  {month.isCurrentMonth && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      চলতি মাস
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-stone-500">
                  {toBengaliNumber(month.transactionCount)} টি চালান
                </span>
              </div>

              {/* Card Financials 3-Column Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
                {/* মোট বিক্রি */}
                <div className="p-1.5 bg-amber-50/70 rounded-xl border border-amber-200/50">
                  <span className="text-[10px] font-semibold text-amber-800 block">
                    মোট বিক্রি
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-900 mt-0.5 block">
                    {formatTaka(month.totalSales)}
                  </span>
                </div>

                {/* মোট আদায় */}
                <div className="p-1.5 bg-emerald-50/70 rounded-xl border border-emerald-200/50">
                  <span className="text-[10px] font-semibold text-emerald-800 block">
                    মোট আদায়
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5 block">
                    {formatTaka(month.totalPaid)}
                  </span>
                </div>

                {/* মোট বাকি */}
                <div className="p-1.5 bg-rose-50/70 rounded-xl border border-rose-200/50">
                  <span className="text-[10px] font-semibold text-rose-800 block">
                    মোট বাকি
                  </span>
                  <span className="text-xs sm:text-sm font-black text-rose-600 mt-0.5 block">
                    {formatTaka(month.totalDue)}
                  </span>
                </div>
              </div>

              {/* Status Hint */}
              <div className="mt-2.5 pt-1.5 border-t border-stone-100/80 flex items-center justify-between text-[10px] text-stone-400">
                <span>
                  {month.totalDue === 0 ? "সব টাকা পরিশোধিত" : "বকেয়া বাকি আছে"}
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  {isSelected ? "ফিল্টার চালু আছে ✓" : "চালান ফিল্টার করুন →"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
