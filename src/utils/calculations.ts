import { Customer, Transaction, CustomerWithSummary, DashboardSummary, MonthlySummary } from "@/src/types";
import { isToday, getBengaliMonthYear, BENGALI_DAYS_SHORT, formatBengaliDate, toBengaliNumber } from "./formatters";

/**
 * Validates sale and paid amount according to wholesale hisab business rules:
 * - Sale amount >= 0
 * - Paid amount >= 0
 * - Paid amount cannot exceed sale amount
 */
export function validateAmounts(saleAmount: number, paidAmount: number): { valid: boolean; error?: string } {
  if (isNaN(saleAmount) || saleAmount < 0) {
    return { valid: false, error: 'বিক্রির পরিমাণ সঠিক নয় (ঋণাত্মক বা খালি হতে পারবে না)' };
  }
  if (isNaN(paidAmount) || paidAmount < 0) {
    return { valid: false, error: 'পরিশোধিত টাকা ঋণাত্মক হতে পারবে না' };
  }
  if (paidAmount > saleAmount) {
    return { valid: false, error: 'নগদ জমা বিক্রির পরিমাণের চেয়ে বেশি হতে পারবে না' };
  }
  return { valid: true };
}

/**
 * Calculate due amount for a single transaction
 */
export function calculateDue(saleAmount: number, paidAmount: number): number {
  const safeSale = Math.max(0, saleAmount || 0);
  const safePaid = Math.max(0, paidAmount || 0);
  return Math.max(0, safeSale - safePaid);
}

/**
 * Calculates dashboard financial metrics from raw transactions
 * Financial Accuracy Rule:
 * Total Sales = Sum(transaction.saleAmount)
 * Total Paid = Sum(transaction.paidAmount)
 * Total Due = Total Sales - Total Paid
 */
export function calculateDashboardSummary(transactions: Transaction[]): DashboardSummary {
  let totalSales = 0;
  let totalPaid = 0;
  let todaySales = 0;
  let todayPaid = 0;
  let todayTransactionCount = 0;

  for (const t of transactions) {
    const sale = Math.max(0, t.saleAmount || 0);
    const paid = Math.max(0, t.paidAmount || 0);

    totalSales += sale;
    totalPaid += paid;

    if (isToday(t.createdAt)) {
      todaySales += sale;
      todayPaid += paid;
      todayTransactionCount += 1;
    }
  }

  const totalDue = Math.max(0, totalSales - totalPaid);
  const todayDue = Math.max(0, todaySales - todayPaid);

  return {
    totalSales,
    totalPaid,
    totalDue,
    todaySales,
    todayPaid,
    todayDue,
    todayTransactionCount,
  };
}

/**
 * Computes customer summaries with real-time financial accuracy derived from transactions
 */
export function calculateCustomerSummaries(
  customers: Customer[],
  transactions: Transaction[]
): CustomerWithSummary[] {
  // Map of customerId to aggregated transactions
  const customerMap = new Map<string, { totalSales: number; totalPaid: number; count: number; lastDate?: string }>();

  for (const t of transactions) {
    const current = customerMap.get(t.customerId) || { totalSales: 0, totalPaid: 0, count: 0 };
    current.totalSales += Math.max(0, t.saleAmount || 0);
    current.totalPaid += Math.max(0, t.paidAmount || 0);
    current.count += 1;

    if (!current.lastDate || new Date(t.createdAt) > new Date(current.lastDate)) {
      current.lastDate = t.createdAt;
    }

    customerMap.set(t.customerId, current);
  }

  return customers.map((c) => {
    const agg = customerMap.get(c.id) || { totalSales: 0, totalPaid: 0, count: 0, lastDate: undefined };
    const currentDue = Math.max(0, agg.totalSales - agg.totalPaid);

    return {
      ...c,
      totalSales: agg.totalSales,
      totalPaid: agg.totalPaid,
      currentDue,
      transactionCount: agg.count,
      lastTransactionDate: agg.lastDate,
    };
  });
}

/**
 * Calculates monthly summary report grouped by year-month
 */
export function calculateMonthlySummaries(transactions: Transaction[]): MonthlySummary[] {
  const map = new Map<string, {
    year: number;
    month: number;
    totalSales: number;
    totalPaid: number;
    totalDue: number;
    count: number;
  }>();

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Ensure current month exists in map even if 0 transactions
  map.set(currentKey, {
    year: now.getFullYear(),
    month: now.getMonth(),
    totalSales: 0,
    totalPaid: 0,
    totalDue: 0,
    count: 0,
  });

  for (const t of transactions) {
    const d = new Date(t.createdAt);
    if (isNaN(d.getTime())) continue;
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    const existing = map.get(key) || {
      year,
      month,
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0,
      count: 0,
    };

    const sale = Math.max(0, t.saleAmount || 0);
    const paid = Math.max(0, t.paidAmount || 0);
    const due = Math.max(0, t.dueAmount !== undefined ? t.dueAmount : (sale - paid));

    existing.totalSales += sale;
    existing.totalPaid += paid;
    existing.totalDue += due;
    existing.count += 1;

    map.set(key, existing);
  }

  // Sort descending by month key (latest month first)
  const sortedKeys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map((key) => {
    const item = map.get(key)!;
    return {
      monthKey: key,
      monthNameBengali: getBengaliMonthYear(item.year, item.month),
      year: item.year,
      month: item.month,
      totalSales: item.totalSales,
      totalPaid: item.totalPaid,
      totalDue: item.totalDue,
      transactionCount: item.count,
      isCurrentMonth: key === currentKey,
    };
  });
}

/**
 * Calculates daily sales for the last 7 days (including today)
 */
export function calculateLast7DaysSales(transactions: Transaction[]): Array<{
  dateStr: string;
  dayName: string;
  label: string;
  fullDate: string;
  sales: number;
  paid: number;
  due: number;
  txCount: number;
}> {
  const result: Array<{
    dateStr: string;
    dayName: string;
    label: string;
    fullDate: string;
    sales: number;
    paid: number;
    due: number;
    txCount: number;
  }> = [];

  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayName = BENGALI_DAYS_SHORT[d.getDay()];
    const label = `${dayName} (${toBengaliNumber(d.getDate())})`;
    const fullDate = formatBengaliDate(d.toISOString());

    // Aggregate sales for this day
    let sales = 0;
    let paid = 0;
    let due = 0;
    let txCount = 0;

    for (const t of transactions) {
      const txDate = new Date(t.createdAt);
      if (isNaN(txDate.getTime())) continue;
      const txYear = txDate.getFullYear();
      const txMonth = String(txDate.getMonth() + 1).padStart(2, '0');
      const txDay = String(txDate.getDate()).padStart(2, '0');
      const txDateStr = `${txYear}-${txMonth}-${txDay}`;

      if (txDateStr === dateStr) {
        const s = Math.max(0, t.saleAmount || 0);
        const p = Math.max(0, t.paidAmount || 0);
        sales += s;
        paid += p;
        due += Math.max(0, t.dueAmount !== undefined ? t.dueAmount : s - p);
        txCount += 1;
      }
    }

    result.push({
      dateStr,
      dayName,
      label,
      fullDate,
      sales,
      paid,
      due,
      txCount,
    });
  }

  return result;
}
