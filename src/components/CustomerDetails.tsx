import React, { useState } from "react";
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  PlusCircle, 
  ReceiptText, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  AlertCircle,
  FileText,
  MessageSquare,
  Edit3
} from "lucide-react";
import { useHisabStore } from "@/src/store/useHisabStore";
import { formatTaka, formatBengaliDate, formatBengaliTime, toBengaliNumber } from "@/src/utils/formatters";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { sendWhatsAppDueReminder } from "@/src/utils/whatsapp";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { Transaction } from "@/src/types";
import { toast } from "sonner";

interface CustomerDetailsProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId, onBack }) => {
  const { 
    getCustomerById, 
    getTransactionsForCustomer, 
    openAddTransactionModal,
    businessName 
  } = useHisabStore();

  const [selectedTxToEdit, setSelectedTxToEdit] = useState<Transaction | null>(null);

  const customer = getCustomerById(customerId);
  const transactions = getTransactionsForCustomer(customerId);

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-stone-500">কাস্টমার খুঁজে পাওয়া যায়নি</p>
        <Button onClick={onBack} variant="outline" className="mt-3">
          ফিরে যান
        </Button>
      </div>
    );
  }

  const handleSendWhatsApp = () => {
    if (customer.currentDue <= 0) {
      toast.info(`${customer.name} এর কোনো বকেয়া বাকি নেই।`);
      return;
    }

    sendWhatsAppDueReminder({
      customerName: customer.name,
      phone: customer.phone,
      currentDue: customer.currentDue,
      businessName,
    });
    toast.success("হোয়াটসঅ্যাপ তাগাদা উইন্ডো খোলা হয়েছে!");
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header with Back button */}
      <div className="bg-white px-4 py-3 border-b border-stone-200 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-stone-900 leading-tight">
              {customer.name}
            </h1>
            <p className="text-xs text-stone-500">কাস্টমার হিসাব খাতা</p>
          </div>
        </div>

        <Button
          onClick={() => openAddTransactionModal(customer.id)}
          size="sm"
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-9 px-3 rounded-xl gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          + হিসাব লিখুন
        </Button>
      </div>

      <div className="px-4 space-y-4">
        {/* Customer Profile & Info Card */}
        <Card className="border-stone-200 shadow-xs overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {customer.name}
                </h2>
                {customer.address && (
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {customer.address}
                  </p>
                )}
                {customer.note && (
                  <p className="text-xs text-stone-500 italic mt-0.5">
                    "{customer.note}"
                  </p>
                )}
              </div>

              {customer.currentDue > 0 ? (
                <Badge variant="destructive" className="font-bold text-xs">
                  বাকি আছে
                </Badge>
              ) : (
                <Badge variant="success" className="font-bold text-xs">
                  পরিশোধিত
                </Badge>
              )}
            </div>

            {/* Phone & Contact Buttons */}
            {customer.phone && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${customer.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    কল
                  </a>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    হোয়াটসঅ্যাপ
                  </button>
                </div>
              </div>
            )}

            {/* OUTSTANDING BALANCE WHATSAPP ALERT (বকেয়া তাগাদা পাঠানোর বাটন) */}
            {customer.currentDue > 0 && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2 mt-2">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    হোয়াটসঅ্যাপে বকেয়া তাগাদা
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    বকেয়া {formatTaka(customer.currentDue)} সহ বার্তা লিংক খুলুন
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8.5 px-3 text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  তাগাদা পাঠান
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FINANCIAL SUMMARY 3-BOX */}
        <div className="grid grid-cols-3 gap-2">
          {/* মোট ব্যবসা / Total Sales */}
          <div className="p-3 bg-white rounded-2xl border border-stone-200 text-center shadow-xs">
            <span className="text-xs font-semibold text-stone-500 block">
              মোট ব্যবসা
            </span>
            <span className="text-base sm:text-lg font-black text-stone-900 mt-1 block">
              {formatTaka(customer.totalSales)}
            </span>
          </div>

          {/* মোট দিয়েছে / Total Paid */}
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-center shadow-xs">
            <span className="text-xs font-semibold text-emerald-800 block">
              মোট দিয়েছে
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-700 mt-1 block">
              {formatTaka(customer.totalPaid)}
            </span>
          </div>

          {/* বর্তমান বাকি / Current Due */}
          <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200/80 text-center shadow-xs">
            <span className="text-xs font-semibold text-rose-800 block">
              বর্তমান বাকি
            </span>
            <span className="text-base sm:text-lg font-black text-rose-600 mt-1 block">
              {formatTaka(customer.currentDue)}
            </span>
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <ReceiptText className="w-4 h-4 text-emerald-700" />
              হিসাবের ইতিহাস ({toBengaliNumber(transactions.length)} টি চালান)
            </h3>
            <span className="text-[11px] text-stone-400">
              চালানে চাপ দিয়ে এডিট করুন
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxToEdit(tx)}
                  className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors cursor-pointer active:bg-stone-50"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 pb-1.5 border-b border-stone-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {formatBengaliDate(tx.createdAt)} ({formatBengaliTime(tx.createdAt)})
                    </span>
                    <div className="flex items-center gap-2">
                      {tx.dueAmount > 0 ? (
                        <span className="text-rose-600 font-bold">
                          বাকি: {formatTaka(tx.dueAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          সম্পূর্ণ পরিশোধিত
                        </span>
                      )}
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        এডিট
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div>
                      <span className="text-[11px] text-stone-400 block">বিক্রি</span>
                      <span className="text-sm font-bold text-stone-800">
                        {formatTaka(tx.saleAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block">দিয়েছে</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {formatTaka(tx.paidAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block">বাকি</span>
                      <span className={`text-sm font-bold ${tx.dueAmount > 0 ? 'text-rose-600' : 'text-stone-400'}`}>
                        {formatTaka(tx.dueAmount)}
                      </span>
                    </div>
                  </div>

                  {tx.note && (
                    <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{tx.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
              <ReceiptText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm">এই কাস্টমারের কোনো হিসাব রেকর্ড পাওয়া যায়নি</p>
              <Button
                onClick={() => openAddTransactionModal(customer.id)}
                variant="outline"
                size="sm"
                className="mt-3 text-emerald-700 border-emerald-600"
              >
                প্রথম হিসাব যোগ করুন
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT TRANSACTION MODAL */}
      <EditTransactionDialog
        transaction={selectedTxToEdit}
        customer={customer}
        open={!!selectedTxToEdit}
        onClose={() => setSelectedTxToEdit(null)}
        onSaveSuccess={() => setSelectedTxToEdit(null)}
      />
    </div>
  );
};
