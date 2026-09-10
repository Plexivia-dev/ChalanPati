import React, { useState, useId } from "react";
import { 
  ReceiptText, 
  Calendar, 
  Trash2, 
  Share2, 
  Printer, 
  X, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Search
} from "lucide-react";
import { useHisabStore } from "@/src/store/useHisabStore";
import { RecordFilterPeriod, Transaction } from "@/src/types";
import { formatTaka, formatBengaliDate, formatBengaliTime, toBengaliNumber } from "@/src/utils/formatters";
import { TransactionCard } from "./TransactionCard";
import { MonthlySummaryReport } from "./MonthlySummaryReport";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

export const TransactionList: React.FC = () => {
  const { 
    customers, 
    getFilteredTransactions, 
    getMonthlySummaries,
    deleteTransaction,
    businessName 
  } = useHisabStore();

  const [period, setPeriod] = useState<RecordFilterPeriod>("today");
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  const customDateInputId = useId();
  const searchTransactionsInputId = useId();

  const monthlySummaries = getMonthlySummaries();

  // Get transactions for selected filter
  const rawTransactions = getFilteredTransactions(period, customDate);

  // Search filter & Month card filter if clicked
  const filteredTransactions = rawTransactions.filter((tx) => {
    // If a monthly card is clicked for specific month filtering
    if (selectedMonthKey) {
      const txMonthKey = tx.createdAt.slice(0, 7); // e.g. "2026-09"
      if (txMonthKey !== selectedMonthKey) return false;
    }

    if (!searchTerm.trim()) return true;
    const cust = customers.find((c) => c.id === tx.customerId);
    const q = searchTerm.toLowerCase();
    return (
      (cust && cust.name.toLowerCase().includes(q)) ||
      (tx.note && tx.note.toLowerCase().includes(q))
    );
  });

  // Calculate selected-period totals
  const periodTotals = filteredTransactions.reduce(
    (acc, tx) => {
      acc.totalSales += tx.saleAmount;
      acc.totalPaid += tx.paidAmount;
      acc.totalDue += tx.dueAmount;
      return acc;
    },
    { totalSales: 0, totalPaid: 0, totalDue: 0 }
  );

  const selectedCustomer = selectedTransaction
    ? customers.find((c) => c.id === selectedTransaction.customerId)
    : undefined;

  const handleDelete = (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত এই হিসাব চালানটি মুছে ফেলতে চান? এটি মুছে ফেললে যাবতীয় মোট হিসাব সমন্বয় করা হবে।")) {
      deleteTransaction(id);
      setSelectedTransaction(null);
      toast.success("চালানটি সফলভাবে মুছে ফেলা হয়েছে");
    }
  };

  const handleShareVoucher = () => {
    if (!selectedTransaction || !selectedCustomer) return;
    const shareText = `*${businessName}*\nতারিখ: ${formatBengaliDate(selectedTransaction.createdAt)}\nক্রেতা: ${selectedCustomer.name}\nমোট বিক্রি: ${formatTaka(selectedTransaction.saleAmount)}\nনগদ জমা: ${formatTaka(selectedTransaction.paidAmount)}\nবাকি: ${formatTaka(selectedTransaction.dueAmount)}\nবিবরণ: ${selectedTransaction.note || 'চালান'}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      toast.success("রশিদের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!");
    } else {
      toast.info("রশিদ প্রস্তুত আছে");
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <header className="bg-white px-4 pt-4 pb-3 border-b border-stone-200 sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                হিসাবের রেকর্ড
              </h1>
              <p className="text-xs text-stone-500">
                দৈনিক ও মাসিক চালানের রেজিস্টার
              </p>
            </div>
          </div>
        </div>

        {/* Filters bar: আজ | এই মাস | সব সময় | তারিখ নির্বাচন */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setPeriod("today")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              period === "today"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            আজ
          </button>

          <button
            onClick={() => setPeriod("this_month")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              period === "this_month"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            এই মাস
          </button>

          <button
            onClick={() => setPeriod("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              period === "all"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            সব সময়
          </button>

          <button
            onClick={() => setPeriod("custom")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
              period === "custom"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            তারিখ নির্বাচন
          </button>
        </div>

        {/* Custom Date Input Picker when period === 'custom' */}
        {period === "custom" && (
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-2">
            <label htmlFor={customDateInputId} className="text-xs font-bold text-stone-700 whitespace-nowrap">
              তারিখ:
            </label>
            <Input
              id={customDateInputId}
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="h-10 text-sm bg-stone-50"
            />
          </div>
        )}

        {/* Search within records */}
        <div className="relative mt-2.5">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <Input
            id={searchTransactionsInputId}
            type="text"
            placeholder="কাস্টমার বা বিবরণ দিয়ে চালান খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-stone-50 border-stone-300"
          />
        </div>
      </header>

      <div className="px-4 space-y-3.5">
        {/* MONTHLY SUMMARY REPORT CARDS (শীর্ষে মাসভিত্তিক সারসংক্ষেপ রিপোর্ট কার্ড) */}
        <MonthlySummaryReport
          summaries={monthlySummaries}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={(key) => setSelectedMonthKey(key)}
        />

        {/* SELECTED-PERIOD TOTALS (শীর্ষ সারসংক্ষেপ) */}
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-stone-500 flex items-center justify-between">
            <span>
              {selectedMonthKey ? (
                <span className="text-emerald-800 font-bold">
                  নির্বাচিত মাসের হিসাব: {monthlySummaries.find(m => m.monthKey === selectedMonthKey)?.monthNameBengali}
                </span>
              ) : (
                `নির্বাচিত সময়কালের হিসাব (${
                  period === "today"
                    ? "আজ"
                    : period === "this_month"
                    ? "চলতি মাস"
                    : period === "all"
                    ? "সর্বমোট"
                    : formatBengaliDate(customDate)
                })`
              )}
            </span>
            <span className="text-stone-700 font-bold">
              {toBengaliNumber(filteredTransactions.length)} টি চালান
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            {/* মোট বিক্রি */}
            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60">
              <span className="text-[11px] font-semibold text-amber-800 block">
                মোট বিক্রি
              </span>
              <span className="text-base font-black text-amber-900 mt-0.5 block">
                {formatTaka(periodTotals.totalSales)}
              </span>
            </div>

            {/* মোট আদায় */}
            <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
              <span className="text-[11px] font-semibold text-emerald-800 block">
                মোট আদায়
              </span>
              <span className="text-base font-black text-emerald-700 mt-0.5 block">
                {formatTaka(periodTotals.totalPaid)}
              </span>
            </div>

            {/* মোট বাকি */}
            <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200/60">
              <span className="text-[11px] font-semibold text-rose-800 block">
                মোট বাকি
              </span>
              <span className="text-base font-black text-rose-600 mt-0.5 block">
                {formatTaka(periodTotals.totalDue)}
              </span>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
              <span>চালানের তালিকা ({toBengaliNumber(filteredTransactions.length)} টি)</span>
              <span>চালানে চাপ দিলে এডিট ফর্ম খুলবে</span>
            </div>
            {filteredTransactions.map((tx) => {
              const customer = customers.find((c) => c.id === tx.customerId);
              return (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  customer={customer}
                  onClick={() => setSelectedTransaction(tx)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            <ReceiptText className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold">কোনো চালানের রেকর্ড পাওয়া যায়নি</p>
            <p className="text-xs text-stone-400 mt-1">
              ফিল্টার পরিবর্তন করুন অথবা নতুন হিসাব লিখুন
            </p>
          </div>
        )}
      </div>

      {/* PRE-FILLED EDIT TRANSACTION DIALOG (স্বয়ংক্রিয় বাকি হিসাবসহ এডিট ফর্ম) */}
      <EditTransactionDialog
        transaction={selectedTransaction}
        customer={selectedCustomer}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onSaveSuccess={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
