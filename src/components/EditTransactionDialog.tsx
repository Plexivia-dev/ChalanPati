import React, { useState, useEffect, useId } from "react";
import { 
  X, 
  Edit3, 
  Banknote, 
  Check, 
  FileText, 
  AlertCircle, 
  Calendar, 
  User, 
  Calculator,
  Share2,
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Transaction, Customer } from "@/src/types";
import { useHisabStore } from "@/src/store/useHisabStore";
import { formatTaka, formatBengaliDate, formatBengaliTime } from "@/src/utils/formatters";
import { toast } from "sonner";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  customer?: Customer;
  open: boolean;
  onClose: () => void;
  onSaveSuccess?: (updated: Transaction) => void;
}

export const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  transaction,
  customer,
  open,
  onClose,
  onSaveSuccess,
}) => {
  const { updateTransaction, deleteTransaction, businessName } = useHisabStore();

  const [saleAmountInput, setSaleAmountInput] = useState("");
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const editSaleAmountId = useId();
  const editPaidAmountId = useId();
  const editNoteId = useId();

  // Populate when transaction changes
  useEffect(() => {
    if (transaction && open) {
      setSaleAmountInput(transaction.saleAmount.toString());
      setPaidAmountInput(transaction.paidAmount.toString());
      setNoteInput(transaction.note || "");
      setError(null);
    }
  }, [transaction, open]);

  if (!transaction) return null;

  // Real-time automatic recalculation
  const saleAmount = parseFloat(saleAmountInput) || 0;
  const paidAmount = parseFloat(paidAmountInput) || 0;
  const calculatedDue = Math.max(0, saleAmount - paidAmount);

  let validationError: string | null = null;
  if (paidAmount > saleAmount) {
    validationError = "নগদ জমা বিক্রির মোট টাকার চেয়ে বেশি হতে পারবে না";
  } else if (saleAmount <= 0 && saleAmountInput !== "") {
    validationError = "বিক্রির পরিমাণ অবশ্যই ০ এর বেশি হতে হবে";
  }

  const handleDelete = () => {
    if (window.confirm("আপনি কি নিশ্চিত এই হিসাব চালানটি মুছে ফেলতে চান? এটি মুছে ফেললে যাবতীয় মোট হিসাব সমন্বয় করা হবে।")) {
      deleteTransaction(transaction.id);
      toast.success("চালানটি সফলভাবে মুছে ফেলা হয়েছে");
      onClose();
    }
  };

  const handleShareVoucher = () => {
    const custName = customer?.name || "সম্মানিত ক্রেতা";
    const shareText = `*${businessName}*\nতারিখ: ${formatBengaliDate(transaction.createdAt)}\nক্রেতা: ${custName}\nমোট বিক্রি: ${formatTaka(saleAmount)}\nনগদ জমা: ${formatTaka(paidAmount)}\nবাকি: ${formatTaka(calculatedDue)}\nবিবরণ: ${noteInput || 'চালান'}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      toast.success("রশিদের হিসাব বিবরণী ক্লিপবোর্ডে কপি করা হয়েছে!");
    } else {
      toast.info("রশিদ বিবরণী প্রস্তুত");
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (saleAmount <= 0) {
      setError("বিক্রির পরিমাণ ০ এর বেশি হতে হবে");
      return;
    }

    if (paidAmount < 0) {
      setError("পরিশোধিত টাকা ঋণাত্মক হতে পারবে না");
      return;
    }

    if (paidAmount > saleAmount) {
      setError("পরিশোধিত টাকা বিক্রির পরিমাণের চেয়ে বেশি হতে পারবে না");
      return;
    }

    const res = updateTransaction(transaction.id, {
      saleAmount,
      paidAmount,
      note: noteInput,
    });

    if (res.success && res.transaction) {
      toast.success("চালান হিসাব সফলভাবে আপডেট করা হয়েছে!", {
        description: `নতুন বাকি: ${formatTaka(calculatedDue)}`,
      });
      if (onSaveSuccess) {
        onSaveSuccess(res.transaction);
      }
      onClose();
    } else {
      setError(res.error || "হিসাব আপডেট করতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-stone-50 border-stone-300 rounded-2xl">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-700 rounded-xl">
                <Edit3 className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  হিসাব চালান সংশোধন করুন
                </DialogTitle>
                <p className="text-xs text-emerald-100/90">
                  চালান নং: #{transaction.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Customer & Date Info banner */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                {customer?.name || "কাস্টমার"}
              </span>
              <span className="text-stone-500 font-normal">
                {formatBengaliDate(transaction.createdAt)} ({formatBengaliTime(transaction.createdAt)})
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5">
              {/* SALE AMOUNT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={editSaleAmountId}
                    className="text-xs font-bold text-stone-800 flex items-center gap-1.5"
                  >
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    বিক্রির পরিমাণ (টাকা) *
                  </label>
                  {saleAmount > 0 && (
                    <span className="text-xs font-semibold text-stone-600">
                      {formatTaka(saleAmount)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-lg font-bold text-stone-400">৳</span>
                  <Input
                    id={editSaleAmountId}
                    type="number"
                    min="0"
                    step="any"
                    value={saleAmountInput}
                    onChange={(e) => {
                      setSaleAmountInput(e.target.value);
                      setError(null);
                    }}
                    className="pl-8 text-xl font-bold h-12 text-stone-900 border-stone-300 focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* PAID AMOUNT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={editPaidAmountId}
                    className="text-xs font-bold text-stone-800 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-700" />
                    আজ নগদ কত টাকা দিয়েছে *
                  </label>
                  {paidAmount > 0 && (
                    <span className="text-xs font-semibold text-emerald-700">
                      {formatTaka(paidAmount)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-lg font-bold text-stone-400">৳</span>
                  <Input
                    id={editPaidAmountId}
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmountInput}
                    onChange={(e) => {
                      setPaidAmountInput(e.target.value);
                      setError(null);
                    }}
                    className="pl-8 text-xl font-bold h-12 text-emerald-800 border-stone-300 focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Quick Payment Ratio Buttons */}
                {saleAmount > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setPaidAmountInput(saleAmount.toString())}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                    >
                      সম্পূর্ণ নগদ (১০০%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmountInput((saleAmount * 0.5).toString())}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
                    >
                      ৫০% দিয়েছে
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmountInput("0")}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
                    >
                      বাকি (০ টাকা)
                    </button>
                  </div>
                )}

                {validationError && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    {validationError}
                  </p>
                )}
              </div>

              {/* AUTOMATICALLY RECALCULATED DUE AMOUNT */}
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 block">
                    সংশোধিত বাকি (স্বয়ংক্রিয় হিসাব):
                  </span>
                  <span className="text-[10px] text-rose-700">
                    বিক্রি − জমা = বর্তমান চালানের বাকি
                  </span>
                </div>
                <div className="text-xl font-black text-rose-700">
                  {formatTaka(calculatedDue)}
                </div>
              </div>
            </div>

            {/* Note / Goods details */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-1.5">
              <label htmlFor={editNoteId} className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                পণ্যের বিবরণ বা চালান নোট
              </label>
              <Input
                id={editNoteId}
                type="text"
                placeholder="যেমন: দারুচিনি ২০ কেজি চালান"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="h-10 text-sm bg-stone-50 border-stone-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-12 text-sm font-semibold border-stone-300"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={saleAmount <= 0 || !!validationError}
                className="h-12 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs disabled:opacity-50"
              >
                সংরক্ষণ করুন
              </Button>
            </div>

            {/* Secondary Utility Buttons: Copy & Delete */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <button
                type="button"
                onClick={handleShareVoucher}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-800 hover:bg-emerald-50 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                রশিদ কপি করুন
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                চালান মুছুন
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
