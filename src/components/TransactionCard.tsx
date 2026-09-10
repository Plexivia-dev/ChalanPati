import React from "react";
import { Calendar, User, FileText, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Transaction, Customer } from "@/src/types";
import { formatTaka, formatBengaliDate, formatBengaliTime } from "@/src/utils/formatters";

interface TransactionCardProps {
  transaction: Transaction;
  customer?: Customer;
  onClick: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  customer,
  onClick,
}) => {
  const isPaidInFull = transaction.dueAmount === 0;

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-300 active:bg-stone-50 transition-all cursor-pointer group space-y-2.5"
    >
      {/* Top row: Date & Status Badge */}
      <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
        <div className="flex items-center gap-1.5 font-medium text-stone-600">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>{formatBengaliDate(transaction.createdAt)}</span>
          <span className="text-stone-300">•</span>
          <span>{formatBengaliTime(transaction.createdAt)}</span>
        </div>

        <div>
          {isPaidInFull ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3" />
              নগদ পরিশোধ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-rose-200/60">
              <AlertCircle className="w-3 h-3" />
              বাকি আছে
            </span>
          )}
        </div>
      </div>

      {/* Customer Name & Note */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors">
            {customer?.name || "অজানা কাস্টমার"}
          </h4>
          {transaction.note && (
            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-400 shrink-0" />
              {transaction.note}
            </p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* Financial Table Row: বিক্রি | দিয়েছে | বাকি */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100/90 text-center">
        <div className="bg-stone-50/70 p-2 rounded-xl">
          <span className="text-[11px] font-semibold text-stone-400 block">বিক্রি</span>
          <span className="text-sm font-bold text-stone-900 block mt-0.5">
            {formatTaka(transaction.saleAmount)}
          </span>
        </div>

        <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100/60">
          <span className="text-[11px] font-semibold text-emerald-800 block">দিয়েছে</span>
          <span className="text-sm font-bold text-emerald-700 block mt-0.5">
            {formatTaka(transaction.paidAmount)}
          </span>
        </div>

        <div className={`p-2 rounded-xl border ${transaction.dueAmount > 0 ? 'bg-rose-50/60 border-rose-100/60' : 'bg-stone-50 border-stone-100'}`}>
          <span className="text-[11px] font-semibold text-rose-800 block">বাকি</span>
          <span className={`text-sm font-bold block mt-0.5 ${transaction.dueAmount > 0 ? 'text-rose-600' : 'text-stone-400'}`}>
            {formatTaka(transaction.dueAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
