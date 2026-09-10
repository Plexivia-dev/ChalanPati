import React, { useState, useEffect, useId } from "react";
import { 
  X, 
  Search, 
  UserPlus, 
  Check, 
  Calculator, 
  FileText, 
  Banknote, 
  AlertCircle,
  Sparkles,
  Phone,
  MapPin
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { useHisabStore } from "@/src/store/useHisabStore";
import { formatTaka } from "@/src/utils/formatters";
import { toast } from "sonner";

export const AddTransaction: React.FC = () => {
  const { 
    isAddModalOpen, 
    closeAddTransactionModal, 
    customers, 
    addTransaction, 
    addCustomer,
    preselectedCustomerId,
    getCustomerSummaries
  } = useHisabStore();

  const customerSummaries = getCustomerSummaries();

  // Form states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [saleAmountInput, setSaleAmountInput] = useState("");
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // New customer inline mode
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const searchInputId = useId();
  const newCustomerNameId = useId();
  const newCustomerPhoneId = useId();
  const newCustomerAddressId = useId();
  const saleAmountId = useId();
  const paidAmountId = useId();
  const noteInputId = useId();

  // Reset or initialize on open
  useEffect(() => {
    if (isAddModalOpen) {
      setError(null);
      if (preselectedCustomerId) {
        setSelectedCustomerId(preselectedCustomerId);
      } else {
        setSelectedCustomerId(null);
      }
      setSearchTerm("");
      setSaleAmountInput("");
      setPaidAmountInput("");
      setNote("");
      setIsCreatingNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
    }
  }, [isAddModalOpen, preselectedCustomerId]);

  const selectedCustomer = customerSummaries.find((c) => c.id === selectedCustomerId);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  // Numeric values
  const saleAmount = parseFloat(saleAmountInput) || 0;
  const paidAmount = parseFloat(paidAmountInput) || 0;
  const calculatedDue = Math.max(0, saleAmount - paidAmount);

  // Validation
  let validationError: string | null = null;
  if (paidAmount > saleAmount) {
    validationError = "পরিশোধিত টাকা বিক্রির মোট টাকার চেয়ে বেশি হতে পারবে না";
  }

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("অনুগ্রহ করে একজন কাস্টমার নির্বাচন করুন");
      return;
    }

    if (saleAmount <= 0) {
      setError("বিক্রির পরিমাণ অবশ্যই ০ এর বেশি হতে হবে");
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

    const res = addTransaction({
      customerId: selectedCustomerId,
      saleAmount,
      paidAmount,
      note,
    });

    if (res.success) {
      toast.success("নতুন হিসাব সফলভাবে যোগ হয়েছে!", {
        description: `${selectedCustomer?.name || "কাস্টমার"} - বিক্রি: ${formatTaka(saleAmount)}, বাকি: ${formatTaka(calculatedDue)}`,
      });
      closeAddTransactionModal();
    } else {
      setError(res.error || "হিসাব সংরক্ষণে ত্রুটি হয়েছে");
    }
  };

  const handleCreateCustomerAndSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      setError("কাস্টমারের নাম লিখুন");
      return;
    }

    const newCust = addCustomer({
      name: newCustomerName,
      phone: newCustomerPhone,
      address: newCustomerAddress,
    });

    setSelectedCustomerId(newCust.id);
    setIsCreatingNewCustomer(false);
    toast.success(`কাস্টমার "${newCust.name}" যোগ করা হয়েছে`);
  };

  const spiceSuggestions = [
    "এলাচ চালান",
    "দারুচিনি লট",
    "জিরা বস্তা",
    "লবঙ্গ ও গোলমরিচ",
    "হলুদ ও শুকনা মরিচ",
    "তেজপাতা চালান",
  ];

  return (
    <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && closeAddTransactionModal()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-stone-50 border-stone-300">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-700/80 rounded-xl">
                <Calculator className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  নতুন হিসাব লিখুন
                </DialogTitle>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  বিক্রি ও নগদ জমার সহজ হিসাব
                </p>
              </div>
            </div>
            <button
              onClick={closeAddTransactionModal}
              className="rounded-lg p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CUSTOMER SELECTION */}
          {!selectedCustomer ? (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor={searchInputId} className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-emerald-700" />
                  ১. কাস্টমার খুঁজুন বা নির্বাচন করুন
                </label>
                {!isCreatingNewCustomer && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreatingNewCustomer(true);
                      setNewCustomerName(searchTerm);
                    }}
                    className="text-xs text-emerald-700 font-bold hover:bg-emerald-50 h-8 px-2"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    নতুন কাস্টমার
                  </Button>
                )}
              </div>

              {!isCreatingNewCustomer ? (
                <>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
                    <Input
                      id={searchInputId}
                      type="text"
                      placeholder="কাস্টমারের নাম বা মোবাইল লিখুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-11 text-sm bg-stone-50 border-stone-300"
                    />
                  </div>

                  {/* Customer Search Results */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl bg-white">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((cust) => {
                        const summary = customerSummaries.find((c) => c.id === cust.id);
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(cust.id);
                              setError(null);
                            }}
                            className="w-full text-left p-3 hover:bg-emerald-50/60 active:bg-emerald-100/50 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-bold text-sm text-stone-900 group-hover:text-emerald-800">
                                {cust.name}
                              </div>
                              <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                                {cust.phone && <span>{cust.phone}</span>}
                                {cust.address && <span className="truncate max-w-[140px]">{cust.address}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-stone-400 block">বর্তমান বাকি</span>
                              <span className={`text-xs font-bold ${summary && summary.currentDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {formatTaka(summary?.currentDue || 0)}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-stone-500 mb-2">
                          "{searchTerm}" নামে কোনো কাস্টমার পাওয়া যায়নি
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCreatingNewCustomer(true);
                            setNewCustomerName(searchTerm);
                          }}
                          className="text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          “{searchTerm || 'নতুন কাস্টমার'}” যোগ করুন
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* INLINE ADD CUSTOMER */
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" />
                      নতুন কাস্টমার তথ্য পূরণ করুন
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCustomer(false)}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      বাতিল
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={newCustomerNameId} className="text-xs font-semibold text-stone-700">নাম *</label>
                    <Input
                      id={newCustomerNameId}
                      placeholder="কাস্টমারের পূর্ণ নাম বা দোকানের নাম"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="h-10 text-sm bg-white"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor={newCustomerPhoneId} className="text-xs font-semibold text-stone-700">ফোন (ঐচ্ছিক)</label>
                      <Input
                        id={newCustomerPhoneId}
                        placeholder="017xxxxxxxx"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="h-10 text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={newCustomerAddressId} className="text-xs font-semibold text-stone-700">ঠিকানা/বাজার</label>
                      <Input
                        id={newCustomerAddressId}
                        placeholder="আড়ৎ বা ঠিকানা"
                        value={newCustomerAddress}
                        onChange={(e) => setNewCustomerAddress(e.target.value)}
                        className="h-10 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCreateCustomerAndSelect}
                    className="w-full h-10 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white mt-1"
                  >
                    কাস্টমার যোগ করে নির্বাচন করুন
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* SELECTED CUSTOMER BADGE */
            <div className="bg-emerald-50 border-2 border-emerald-600/30 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-800">নির্বাচিত কাস্টমার:</div>
                <div className="text-base font-bold text-stone-900">{selectedCustomer.name}</div>
                <div className="text-xs text-stone-600 flex items-center gap-2 mt-0.5">
                  {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                  <span>বর্তমান বকেয়া: <b className="text-rose-600">{formatTaka(selectedCustomer.currentDue)}</b></span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomerId(null)}
                className="text-xs h-8 px-2.5 bg-white text-stone-700 border-stone-300"
              >
                পরিবর্তন
              </Button>
            </div>
          )}

          {/* STEP 2 & 3: AMOUNTS ENTRY */}
          <form onSubmit={handleSaveTransaction} className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5">
              {/* SALE AMOUNT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={saleAmountId} className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    ২. বিক্রির পরিমাণ (টাকা) *
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
                    id={saleAmountId}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="যেমন: ১০০০০০"
                    value={saleAmountInput}
                    onChange={(e) => {
                      setSaleAmountInput(e.target.value);
                      setError(null);
                    }}
                    className="pl-8 text-xl font-bold h-13 text-stone-900 border-stone-300 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* PAID AMOUNT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={paidAmountId} className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-700" />
                    ৩. আজ কত টাকা দিয়েছে (নগদ জমা) *
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
                    id={paidAmountId}
                    type="number"
                    min="0"
                    max={saleAmount || undefined}
                    step="any"
                    placeholder="যেমন: ৬০০০০"
                    value={paidAmountInput}
                    onChange={(e) => {
                      setPaidAmountInput(e.target.value);
                      setError(null);
                    }}
                    className="pl-8 text-xl font-bold h-13 text-emerald-800 border-stone-300 focus:border-emerald-600"
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

              {/* AUTOMATICALLY CALCULATED DUE AMOUNT - READ ONLY */}
              <div className="p-3.5 bg-rose-50/90 rounded-xl border border-rose-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 block">
                    স্বয়ংক্রিয় বাকি (Due Amount):
                  </span>
                  <span className="text-[11px] text-rose-700">
                    বিক্রি − জমা = নতুন বাকি
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-700 tracking-tight">
                  {formatTaka(calculatedDue)}
                </div>
              </div>
            </div>

            {/* STEP 4: OPTIONAL NOTE */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <label htmlFor={noteInputId} className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                বিবরণ বা চালানের নোট (ঐচ্ছিক)
              </label>
              <Input
                id={noteInputId}
                type="text"
                placeholder="যেমন: গুয়াতেমালা এলাচ ২৫ কেজি চালান"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11 text-sm bg-stone-50 border-stone-300"
              />

              {/* Quick Spice suggestions chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {spiceSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNote((prev) => (prev ? `${prev}, ${item}` : item))}
                    className="text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* CONFIRM & SAVE BUTTON */}
            <Button
              type="submit"
              disabled={!selectedCustomerId || saleAmount <= 0 || !!validationError}
              className="w-full h-14 text-lg font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              হিসাব সংরক্ষণ করুন
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
