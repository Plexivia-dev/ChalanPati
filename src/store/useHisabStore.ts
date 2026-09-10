import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Customer, Transaction, ActiveTab, RecordFilterPeriod, DashboardSummary, CustomerWithSummary, MonthlySummary } from "@/src/types";
import { INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, DEFAULT_BUSINESS_NAME } from "@/src/data/seedData";
import { calculateDashboardSummary, calculateCustomerSummaries, calculateDue, validateAmounts, calculateMonthlySummaries, calculateLast7DaysSales } from "@/src/utils/calculations";
import { isToday, isThisMonth } from "@/src/utils/formatters";

interface HisabState {
  // Auth state
  isAuthenticated: boolean;
  businessName: string;
  ownerPin: string;
  
  // Navigation & UI state
  activeTab: ActiveTab;
  isAddModalOpen: boolean;
  preselectedCustomerId: string | null;
  customerFilterOutstandingOnly: boolean;
  selectedCustomerIdForDetail: string | null;

  // Data state
  customers: Customer[];
  transactions: Transaction[];

  // Actions
  login: (name: string, pin: string) => boolean;
  logout: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  openAddTransactionModal: (customerId?: string) => void;
  closeAddTransactionModal: () => void;
  setSelectedCustomerIdForDetail: (customerId: string | null) => void;
  setCustomerFilterOutstandingOnly: (onlyOutstanding: boolean) => void;

  addCustomer: (data: { name: string; phone?: string; address?: string; note?: string }) => Customer;
  addTransaction: (data: { customerId: string; saleAmount: number; paidAmount: number; note?: string }) => { success: boolean; error?: string; transaction?: Transaction };
  updateTransaction: (id: string, data: { saleAmount: number; paidAmount: number; note?: string }) => { success: boolean; error?: string; transaction?: Transaction };
  deleteTransaction: (id: string) => void;
  resetToDemoData: () => void;

  // Derived selectors
  getDashboardSummary: () => DashboardSummary;
  getCustomerSummaries: () => CustomerWithSummary[];
  getCustomerById: (id: string) => CustomerWithSummary | undefined;
  getTransactionsForCustomer: (customerId: string) => Transaction[];
  getFilteredTransactions: (period: RecordFilterPeriod, customDate?: string) => Transaction[];
  getMonthlySummaries: () => MonthlySummary[];
  getLast7DaysSales: () => Array<{
    dateStr: string;
    dayName: string;
    label: string;
    fullDate: string;
    sales: number;
    paid: number;
    due: number;
    txCount: number;
  }>;
}

export const useHisabStore = create<HisabState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true, // Default to logged in for immediate demo usability, can logout anytime
      businessName: DEFAULT_BUSINESS_NAME,
      ownerPin: "1234",
      activeTab: "home",
      isAddModalOpen: false,
      preselectedCustomerId: null,
      customerFilterOutstandingOnly: false,
      selectedCustomerIdForDetail: null,

      customers: INITIAL_CUSTOMERS,
      transactions: INITIAL_TRANSACTIONS,

      login: (name: string, pin: string) => {
        // Simple demo authentication
        const safeName = name.trim() || DEFAULT_BUSINESS_NAME;
        set({
          isAuthenticated: true,
          businessName: safeName,
          ownerPin: pin || "1234",
        });
        return true;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      setActiveTab: (tab: ActiveTab) => {
        set({ activeTab: tab });
      },

      openAddTransactionModal: (customerId?: string) => {
        set({
          isAddModalOpen: true,
          preselectedCustomerId: customerId || null,
        });
      },

      closeAddTransactionModal: () => {
        set({
          isAddModalOpen: false,
          preselectedCustomerId: null,
        });
      },

      setSelectedCustomerIdForDetail: (customerId: string | null) => {
        set({ selectedCustomerIdForDetail: customerId });
      },

      setCustomerFilterOutstandingOnly: (onlyOutstanding: boolean) => {
        set({ customerFilterOutstandingOnly: onlyOutstanding });
      },

      addCustomer: (data) => {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: data.name.trim(),
          phone: data.phone?.trim() || undefined,
          address: data.address?.trim() || undefined,
          note: data.note?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          customers: [newCustomer, ...state.customers],
        }));

        return newCustomer;
      },

      addTransaction: (data) => {
        const { valid, error } = validateAmounts(data.saleAmount, data.paidAmount);
        if (!valid) {
          return { success: false, error };
        }

        // Check customer exists
        const customer = get().customers.find((c) => c.id === data.customerId);
        if (!customer) {
          return { success: false, error: 'কাস্টমার খুঁজে পাওয়া যায়নি' };
        }

        const dueAmount = calculateDue(data.saleAmount, data.paidAmount);

        const newTx: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          customerId: data.customerId,
          saleAmount: Math.round(data.saleAmount),
          paidAmount: Math.round(data.paidAmount),
          dueAmount: Math.round(dueAmount),
          note: data.note?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTx, ...state.transactions],
          isAddModalOpen: false,
          preselectedCustomerId: null,
        }));

        return { success: true, transaction: newTx };
      },

      updateTransaction: (id, data) => {
        const { valid, error } = validateAmounts(data.saleAmount, data.paidAmount);
        if (!valid) {
          return { success: false, error };
        }

        const existing = get().transactions.find((t) => t.id === id);
        if (!existing) {
          return { success: false, error: 'হিসাব চালানটি খুঁজে পাওয়া যায়নি' };
        }

        const dueAmount = calculateDue(data.saleAmount, data.paidAmount);

        const updatedTx: Transaction = {
          ...existing,
          saleAmount: Math.round(data.saleAmount),
          paidAmount: Math.round(data.paidAmount),
          dueAmount: Math.round(dueAmount),
          note: data.note !== undefined ? data.note.trim() : existing.note,
        };

        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? updatedTx : t)),
        }));

        return { success: true, transaction: updatedTx };
      },

      deleteTransaction: (id: string) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      resetToDemoData: () => {
        set({
          customers: INITIAL_CUSTOMERS,
          transactions: INITIAL_TRANSACTIONS,
          businessName: DEFAULT_BUSINESS_NAME,
        });
      },

      getDashboardSummary: () => {
        return calculateDashboardSummary(get().transactions);
      },

      getCustomerSummaries: () => {
        return calculateCustomerSummaries(get().customers, get().transactions);
      },

      getCustomerById: (id: string) => {
        const list = calculateCustomerSummaries(get().customers, get().transactions);
        return list.find((c) => c.id === id);
      },

      getTransactionsForCustomer: (customerId: string) => {
        return get()
          .transactions.filter((t) => t.customerId === customerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getFilteredTransactions: (period: RecordFilterPeriod, customDate?: string) => {
        const all = [...get().transactions].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (period === 'today') {
          return all.filter((t) => isToday(t.createdAt));
        }

        if (period === 'this_month') {
          return all.filter((t) => isThisMonth(t.createdAt));
        }

        if (period === 'custom' && customDate) {
          return all.filter((t) => {
            const txDate = new Date(t.createdAt).toISOString().split('T')[0];
            return txDate === customDate;
          });
        }

        return all;
      },

      getMonthlySummaries: () => {
        return calculateMonthlySummaries(get().transactions);
      },

      getLast7DaysSales: () => {
        return calculateLast7DaysSales(get().transactions);
      },
    }),
    {
      name: "bengali-wholesale-hisab-storage-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
