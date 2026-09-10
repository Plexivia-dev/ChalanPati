export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  note?: string;
  createdAt: string; // ISO string
}

export interface Transaction {
  id: string;
  customerId: string;
  saleAmount: number;
  paidAmount: number;
  dueAmount: number; // saleAmount - paidAmount
  note?: string;
  createdAt: string; // ISO string
}

export interface CustomerWithSummary extends Customer {
  totalSales: number;
  totalPaid: number;
  currentDue: number;
  transactionCount: number;
  lastTransactionDate?: string;
}

export interface DashboardSummary {
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  todaySales: number;
  todayPaid: number;
  todayDue: number;
  todayTransactionCount: number;
}

export type RecordFilterPeriod = 'today' | 'this_month' | 'all' | 'custom';

export type ActiveTab = 'home' | 'records' | 'customers' | 'add_transaction';

export interface MonthlySummary {
  monthKey: string; // e.g. "2026-09"
  monthNameBengali: string; // e.g. "সেপ্টেম্বর ২০২৬"
  year: number;
  month: number; // 0-11
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  transactionCount: number;
  isCurrentMonth: boolean;
}
