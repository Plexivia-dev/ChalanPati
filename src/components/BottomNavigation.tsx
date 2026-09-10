import React from "react";
import { Home, ReceiptText, Plus, Users } from "lucide-react";
import { useHisabStore } from "@/src/store/useHisabStore";
import { ActiveTab } from "@/src/types";

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, openAddTransactionModal } = useHisabStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "home", label: "হোম", icon: Home },
    { id: "records", label: "রেকর্ড", icon: ReceiptText },
    { id: "customers", label: "কাস্টমার", icon: Users },
  ];

  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Left item: হোম */}
        <button
          id="nav-btn-home"
          type="button"
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === "home" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Home className={`h-5 w-5 mb-0.5 ${activeTab === "home" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-xs tracking-tight">হোম</span>
        </button>

        {/* Left-center item: রেকর্ড */}
        <button
          id="nav-btn-records"
          type="button"
          onClick={() => setActiveTab("records")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === "records" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <ReceiptText className={`h-5 w-5 mb-0.5 ${activeTab === "records" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-xs tracking-tight">রেকর্ড</span>
        </button>

        {/* Prominent Center Action: + হিসাব */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            id="nav-btn-add-transaction"
            type="button"
            onClick={() => openAddTransactionModal()}
            className="group relative flex flex-col items-center justify-center focus:outline-none"
            aria-label="নতুন হিসাব যোগ করুন"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 border-4 border-stone-100 group-hover:bg-emerald-700 group-active:scale-95 transition-all duration-150">
              <Plus className="h-7 w-7 stroke-[3]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 mt-1 tracking-tight">
              + হিসাব
            </span>
          </button>
        </div>

        {/* Right item: কাস্টমার */}
        <button
          id="nav-btn-customers"
          type="button"
          onClick={() => {
            useHisabStore.getState().setSelectedCustomerIdForDetail(null);
            setActiveTab("customers");
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === "customers" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users className={`h-5 w-5 mb-0.5 ${activeTab === "customers" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-xs tracking-tight">কাস্টমার</span>
        </button>
      </div>
    </nav>
  );
};
