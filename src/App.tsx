import React from "react";
import { useHisabStore } from "@/src/store/useHisabStore";
import { Dashboard } from "@/src/components/Dashboard";
import { CustomerList } from "@/src/components/CustomerList";
import { TransactionList } from "@/src/components/TransactionList";
import { BottomNavigation } from "@/src/components/BottomNavigation";
import { AddTransaction } from "@/src/components/AddTransaction";
import { LoginScreen } from "@/src/components/LoginScreen";
import { Toaster } from "@/src/components/ui/sonner";
import { RotateCcw, Store, Smartphone } from "lucide-react";

export default function App() {
  const { isAuthenticated, activeTab, resetToDemoData } = useHisabStore();

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-200/70 flex justify-center selection:bg-emerald-200">
      {/* Mobile-first centered frame on tablet/desktop */}
      <div className="w-full max-w-md bg-stone-100 min-h-screen relative flex flex-col shadow-2xl md:border-x md:border-stone-300">
        {/* Main dynamic screen */}
        <main className="flex-1">
          {activeTab === "home" && <Dashboard />}
          {activeTab === "records" && <TransactionList />}
          {activeTab === "customers" && <CustomerList />}
        </main>

        {/* Global Add Transaction Dialog (triggered by bottom nav + button or cards) */}
        <AddTransaction />

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavigation />

        {/* Subtle helper footer for desktop testers */}
        <footer className="hidden md:flex items-center justify-between px-4 py-2 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-stone-400" />
            <span>মোবাইল-ফার্স্ট ইন্টারফেস</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm("আপনি কি ডেমো ডাটা রিসেট করতে চান?")) {
                resetToDemoData();
              }
            }}
            className="hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            ডেমো ডাটা রিসেট
          </button>
        </footer>
      </div>

      {/* Global Toast notifications */}
      <Toaster />
    </div>
  );
}
