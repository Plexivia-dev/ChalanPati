import { Customer, Transaction } from "@/src/types";

export const DEFAULT_BUSINESS_NAME = "মেসার্স হাজী বাণিজ্যালয়";
export const DEFAULT_BUSINESS_TAGLINE = "আমদানিকারক ও পাইকারি মসলা আড়ৎ, মৌলভীবাজার";

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "রহিম স্টোর (কাওরান বাজার)",
    phone: "01711-234567",
    address: "দোকান নং ১২, কাওরান বাজার আড়ৎ, ঢাকা",
    note: "নিয়মিত এলাচ ও জিরা পাইকারি ক্রেতা",
    createdAt: "2026-08-01T08:30:00.000Z",
  },
  {
    id: "cust-2",
    name: "কাশেম ব্রাদার্স ট্রেডার্স",
    phone: "01819-876543",
    address: "বাবুবাজার মসলা পট্টি, ঢাকা",
    note: "দারুচিনি ও লবঙ্গ লট ক্রেতা",
    createdAt: "2026-08-05T09:00:00.000Z",
  },
  {
    id: "cust-3",
    name: "সততা এন্টারপ্রাইজ",
    phone: "01720-112233",
    address: "খাতুনগঞ্জ, কোতোয়ালী, চট্টগ্রাম",
    note: "বড় পার্টি, প্রতি সপ্তাহে চালান নেয়",
    createdAt: "2026-08-10T10:15:00.000Z",
  },
  {
    id: "cust-4",
    name: "মায়ের দোয়া জেনারেল স্টোর",
    phone: "01677-555666",
    address: "বাদামতলী ঘাট রোড, ঢাকা",
    note: "গোলমরিচ ও তেজপাতা নিয়মিত সরবরাহ",
    createdAt: "2026-08-15T11:45:00.000Z",
  },
  {
    id: "cust-5",
    name: "বিসমিল্লাহ মসলা বিতান",
    phone: "01812-334455",
    address: "সাহেব বাজার, বোয়ালিয়া, রাজশাহী",
    note: "চালান পরিশোধে সাধারণত দেরি হয় না",
    createdAt: "2026-08-20T12:00:00.000Z",
  },
  {
    id: "cust-6",
    name: "ভাই ভাই ট্রেডিং",
    phone: "01911-987654",
    address: "চকবাজার প্রধান সড়ক, কুমিল্লা",
    note: "হলুদ ও ধনিয়া বড় চালান ক্রেতা",
    createdAt: "2026-08-22T14:30:00.000Z",
  },
];

// Helper to construct ISO dates for today and recent days
const now = new Date();
const getRecentISO = (daysAgo: number, hoursOffset: number = 10) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hoursOffset, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Today's transactions
  {
    id: "tx-101",
    customerId: "cust-1",
    saleAmount: 125000,
    paidAmount: 85000,
    dueAmount: 40000,
    note: "গুয়াতেমালা সবুজ এলাচ ৫০ কেজি চালান",
    createdAt: getRecentISO(0, 9),
  },
  {
    id: "tx-102",
    customerId: "cust-3",
    saleAmount: 240000,
    paidAmount: 150000,
    dueAmount: 90000,
    note: "ভারতীয় জিরা ২০ বস্তা ও গোলমরিচ ৫ বস্তা",
    createdAt: getRecentISO(0, 11),
  },
  {
    id: "tx-103",
    customerId: "cust-4",
    saleAmount: 65000,
    paidAmount: 65000,
    dueAmount: 0,
    note: "তেজপাতা ও আস্ত শুকনা মরিচ চালান (সম্পূর্ণ নগদ পরিশোধ)",
    createdAt: getRecentISO(0, 14),
  },
  // Past days in this month
  {
    id: "tx-104",
    customerId: "cust-2",
    saleAmount: 180000,
    paidAmount: 100000,
    dueAmount: 80000,
    note: "ভিয়েতনাম দারুচিনি পাইকারি ১০০ কেজি",
    createdAt: getRecentISO(2, 10),
  },
  {
    id: "tx-105",
    customerId: "cust-5",
    saleAmount: 95000,
    paidAmount: 95000,
    dueAmount: 0,
    note: "মাদাগাস্কার লবঙ্গ ২০ কেজি (নগদ বিল)",
    createdAt: getRecentISO(4, 15),
  },
  {
    id: "tx-106",
    customerId: "cust-6",
    saleAmount: 140000,
    paidAmount: 80000,
    dueAmount: 60000,
    note: "প্রিমিয়াম হলুদ ও ধনিয়া লট",
    createdAt: getRecentISO(6, 12),
  },
  {
    id: "tx-107",
    customerId: "cust-1",
    saleAmount: 210000,
    paidAmount: 160000,
    dueAmount: 50000,
    note: "ইরানি জাফরান ও এলাচ প্যাকেজ",
    createdAt: getRecentISO(12, 11),
  },
  {
    id: "tx-108",
    customerId: "cust-3",
    saleAmount: 320000,
    paidAmount: 250000,
    dueAmount: 70000,
    note: "আমদানি মসলা পাইকারি কন্টেইনার চালান",
    createdAt: getRecentISO(18, 16),
  },
];
