import React from "react";
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  PlusCircle, 
  Calendar, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  Store,
  ChevronRight,
  LogOut,
  Users
} from "lucide-react";
import { useHisabStore } from "@/src/store/useHisabStore";
import { SummaryCard } from "./SummaryCard";
import { SalesTrendChart } from "./SalesTrendChart";
import { formatTaka, getTodayDateBangla, formatBengaliDate, toBengaliNumber } from "@/src/utils/formatters";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

export const Dashboard: React.FC = () => {
  const { 
    businessName, 
    getDashboardSummary, 
    getLast7DaysSales,
    setActiveTab, 
    openAddTransactionModal,
    setCustomerFilterOutstandingOnly,
    transactions,
    customers,
    logout
  } = useHisabStore();

  const summary = getDashboardSummary();
  const last7DaysSales = getLast7DaysSales();

  // Navigate to outstanding customers
  const handleNavigateToOutstandingCustomers = () => {
    setCustomerFilterOutstandingOnly(true);
    useHisabStore.getState().setSelectedCustomerIdForDetail(null);
    setActiveTab("customers");
  };

  // Recent 3 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4 pb-24">
      {/* TOP HEADER */}
      <header className="bg-white px-4 pt-4 pb-3 border-b border-stone-200/80 rounded-b-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                {businessName}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                পাইকারি মসলা আড়ৎ
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="লগআউট"
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Date & Greeting */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{getTodayDateBangla()}</span>
          </div>
          <span className="text-stone-500">আসসালামু আলাইকুম!</span>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* MAIN 3 SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* মোট বিক্রি */}
          <SummaryCard
            id="card-total-sales"
            title="মোট বিক্রি"
            amount={summary.totalSales}
            subtitle="সর্বমোট ব্যবসার হিসাব"
            icon={TrendingUp}
            variant="sales"
            onClick={() => setActiveTab("records")}
            interactiveHint="রেকর্ড দেখুন"
          />

          {/* নগদ আদায় */}
          <SummaryCard
            id="card-total-paid"
            title="নগদ আদায়"
            amount={summary.totalPaid}
            subtitle="ক্যাশ জমার হিসাব"
            icon={Wallet}
            variant="paid"
            onClick={() => setActiveTab("records")}
            interactiveHint="রেকর্ড দেখুন"
          />

          {/* মোট বাকি - Interactive: Navigates to Outstanding Customer List */}
          <SummaryCard
            id="card-total-due"
            title="মোট বাকি (বকেয়া)"
            amount={summary.totalDue}
            subtitle="বাজারে পাওনা টাকা"
            icon={AlertCircle}
            variant="due"
            onClick={handleNavigateToOutstandingCustomers}
            interactiveHint="কার কাছে বাকি দেখুন"
          />
        </div>

        {/* TODAY'S ACTIVITY (আজকের হিসাব) */}
        <Card className="border-stone-200 shadow-xs overflow-hidden">
          <div className="bg-stone-50/90 px-4 py-3 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-stone-800">
                আজকের দিনের হিসাব
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              আজকে চালান: {toBengaliNumber(summary.todayTransactionCount)} টি
            </span>
          </div>

          <CardContent className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* আজকের চালান */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
              <span className="text-xs text-stone-500 font-medium block">
                আজকের চালান
              </span>
              <span className="text-xl font-bold text-stone-800 mt-0.5 block">
                {toBengaliNumber(summary.todayTransactionCount)} টি
              </span>
            </div>

            {/* আজকের বিক্রি */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60">
              <span className="text-xs text-amber-800 font-medium block">
                আজকের বিক্রি
              </span>
              <span className="text-xl font-bold text-amber-900 mt-0.5 block">
                {formatTaka(summary.todaySales)}
              </span>
            </div>

            {/* আজকের আদায় */}
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
              <span className="text-xs text-emerald-800 font-medium block">
                আজকের আদায়
              </span>
              <span className="text-xl font-bold text-emerald-900 mt-0.5 block">
                {formatTaka(summary.todayPaid)}
              </span>
            </div>

            {/* আজকের নতুন বাকি */}
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/60">
              <span className="text-xs text-rose-800 font-medium block">
                আজকের নতুন বাকি
              </span>
              <span className="text-xl font-bold text-rose-800 mt-0.5 block">
                {formatTaka(summary.todayDue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 7-DAY SALES TREND LINE CHART (RECHARTS) */}
        <SalesTrendChart data={last7DaysSales} />

        {/* QUICK SHORTCUT ACTION BAR */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            id="btn-quick-add-hisab"
            type="button"
            onClick={() => openAddTransactionModal()}
            className="h-13 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            + নতুন হিসাব লিখুন
          </Button>

          <Button
            id="btn-quick-view-due-customers"
            type="button"
            variant="outline"
            onClick={handleNavigateToOutstandingCustomers}
            className="h-13 font-bold border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
          >
            <Users className="w-4 h-4 text-rose-600" />
            বকেয়া কাস্টমার তালিকা
          </Button>
        </div>

        {/* RECENT INVOICES / TRANSACTIONS PREVIEW */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              সর্বশেষ কয়েকটি চালান
            </h3>
            <button
              onClick={() => setActiveTab("records")}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              সব রেকর্ড &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cust = customers.find((c) => c.id === tx.customerId);
              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTab("records")}
                  className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-stone-900">
                      {cust?.name || "কাস্টমার"}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {formatBengaliDate(tx.createdAt)} {tx.note && `• ${tx.note}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-stone-900">
                      বিক্রি: {formatTaka(tx.saleAmount)}
                    </div>
                    <div className="text-xs font-medium text-stone-500 mt-0.5">
                      জমা: <span className="text-emerald-700 font-semibold">{formatTaka(tx.paidAmount)}</span>
                      {tx.dueAmount > 0 ? (
                        <span className="ml-1.5 text-rose-600 font-bold">
                          • বাকি {formatTaka(tx.dueAmount)}
                        </span>
                      ) : (
                        <span className="ml-1.5 text-emerald-700 font-semibold">
                          • পরিশোধিত
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
