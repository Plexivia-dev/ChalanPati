import React, { useState, useId } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  ChevronRight, 
  Phone, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Filter,
  MessageSquare
} from "lucide-react";
import { useHisabStore } from "@/src/store/useHisabStore";
import { formatTaka, toBengaliNumber } from "@/src/utils/formatters";
import { sendWhatsAppDueReminder } from "@/src/utils/whatsapp";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { CustomerDetails } from "./CustomerDetails";

export const CustomerList: React.FC = () => {
  const { 
    getCustomerSummaries, 
    addCustomer, 
    customerFilterOutstandingOnly, 
    setCustomerFilterOutstandingOnly,
    selectedCustomerIdForDetail,
    setSelectedCustomerIdForDetail,
    businessName
  } = useHisabStore();

  const customerSummaries = getCustomerSummaries();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "due" | "paid">(
    customerFilterOutstandingOnly ? "due" : "all"
  );
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // New customer modal form states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNote, setNewNote] = useState("");

  const searchInputId = useId();
  const newNameId = useId();
  const newPhoneId = useId();
  const newAddressId = useId();
  const newNoteId = useId();

  // If a customer is selected for detail view, render CustomerDetails
  if (selectedCustomerIdForDetail) {
    return (
      <CustomerDetails
        customerId={selectedCustomerIdForDetail}
        onBack={() => setSelectedCustomerIdForDetail(null)}
      />
    );
  }

  // Filter customers by search and status
  const filteredCustomers = customerSummaries.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === "due") {
      return c.currentDue > 0;
    }
    if (activeFilter === "paid") {
      return c.currentDue === 0;
    }

    return true;
  });

  const totalOutstandingDue = customerSummaries.reduce((sum, c) => sum + c.currentDue, 0);
  const totalCustomersWithDue = customerSummaries.filter((c) => c.currentDue > 0).length;

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("কাস্টমারের নাম প্রদান করুন");
      return;
    }

    const created = addCustomer({
      name: newName,
      phone: newPhone,
      address: newAddress,
      note: newNote,
    });

    toast.success(`কাস্টমার "${created.name}" সফলভাবে যোগ হয়েছে!`);
    setIsAddCustomerOpen(false);
    setNewName("");
    setNewPhone("");
    setNewAddress("");
    setNewNote("");
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <header className="bg-white px-4 pt-4 pb-3 border-b border-stone-200 sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                কাস্টমার খাতা
              </h1>
              <p className="text-xs text-stone-500">
                মোট কাস্টমার: {toBengaliNumber(customerSummaries.length)} জন
              </p>
            </div>
          </div>

          <Button
            id="btn-add-customer-modal-open"
            onClick={() => setIsAddCustomerOpen(true)}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-9 px-3 rounded-xl gap-1"
          >
            <UserPlus className="w-4 h-4" />
            + নতুন কাস্টমার
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <Input
            id={searchInputId}
            type="text"
            placeholder="কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 text-sm bg-stone-50 border-stone-300 focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => {
              setActiveFilter("all");
              setCustomerFilterOutstandingOnly(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            সকল কাস্টমার ({toBengaliNumber(customerSummaries.length)})
          </button>

          <button
            onClick={() => {
              setActiveFilter("due");
              setCustomerFilterOutstandingOnly(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeFilter === "due"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            বাকি আছে ({toBengaliNumber(totalCustomersWithDue)})
          </button>

          <button
            onClick={() => {
              setActiveFilter("paid");
              setCustomerFilterOutstandingOnly(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeFilter === "paid"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            পরিশোধিত
          </button>
        </div>
      </header>

      <div className="px-4 space-y-3">
        {/* Outstanding Banner if filter is 'due' */}
        {activeFilter === "due" && (
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <div>
                <span className="text-xs text-rose-800 font-bold block">
                  মোট বাজারে বকেয়া
                </span>
                <span className="text-xs text-rose-700">
                  {toBengaliNumber(totalCustomersWithDue)} জন কাস্টমারের কাছে বাকি
                </span>
              </div>
            </div>
            <div className="text-xl font-black text-rose-700">
              {formatTaka(totalOutstandingDue)}
            </div>
          </div>
        )}

        {/* CUSTOMER CARDS LIST */}
        {filteredCustomers.length > 0 ? (
          <div className="space-y-2.5">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerIdForDetail(cust.id)}
                className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-400 active:bg-stone-50 transition-all cursor-pointer group"
              >
                {/* Header: Name & Due status */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {cust.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      {cust.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {cust.phone}
                        </span>
                      )}
                      {cust.address && (
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {cust.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-stone-400 block">
                      বর্তমান বাকি
                    </span>
                    <span
                      className={`text-lg font-black ${
                        cust.currentDue > 0 ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {formatTaka(cust.currentDue)}
                    </span>
                  </div>
                </div>

                {/* Numbers row: মোট ব্যবসা | মোট দিয়েছে | তাগাদা বাটন */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-stone-400 block text-[11px]">মোট ব্যবসা</span>
                      <span className="font-bold text-stone-800">
                        {formatTaka(cust.totalSales)}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">মোট দিয়েছে</span>
                      <span className="font-bold text-emerald-700">
                        {formatTaka(cust.totalPaid)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {cust.currentDue > 0 && (
                      <button
                        type="button"
                        title="হোয়াটসঅ্যাপে বকেয়া তাগাদা পাঠান"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendWhatsAppDueReminder({
                            customerName: cust.name,
                            phone: cust.phone,
                            currentDue: cust.currentDue,
                            businessName,
                          });
                          toast.success(`${cust.name}-কে হোয়াটসঅ্যাপে তাগাদা লিংক খোলা হয়েছে`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-700" />
                        তাগাদা
                      </button>
                    )}
                    <span className="text-xs font-semibold text-emerald-700 group-hover:underline flex items-center gap-0.5">
                      বিস্তারিত &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            <Users className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold">কোনো কাস্টমার পাওয়া যায়নি</p>
            <p className="text-xs text-stone-400 mt-1">
              {searchTerm ? "অন্য নাম বা ফোন নম্বর দিয়ে চেষ্টা করুন" : "নতুন কাস্টমার যোগ করুন"}
            </p>
            <Button
              onClick={() => setIsAddCustomerOpen(true)}
              variant="outline"
              size="sm"
              className="mt-3 text-emerald-700 border-emerald-600"
            >
              + নতুন কাস্টমার যোগ করুন
            </Button>
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW CUSTOMER */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-md w-full bg-white p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-700" />
              নতুন কাস্টমার যোগ করুন
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCustomer} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label htmlFor={newNameId} className="text-xs font-bold text-stone-700">
                কাস্টমার বা দোকানের নাম *
              </label>
              <Input
                id={newNameId}
                placeholder="যেমন: রহিম স্টোর / বাণিজ্যালয়"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-11 text-base font-medium"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={newPhoneId} className="text-xs font-bold text-stone-700">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <Input
                id={newPhoneId}
                type="tel"
                placeholder="017xxxxxxxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={newAddressId} className="text-xs font-bold text-stone-700">
                ঠিকানা বা আড়তের স্থান (ঐচ্ছিক)
              </label>
              <Input
                id={newAddressId}
                placeholder="যেমন: কাওরান বাজার, দোকান নং ১২"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={newNoteId} className="text-xs font-bold text-stone-700">
                বিশেষ নোট (ঐচ্ছিক)
              </label>
              <Input
                id={newNoteId}
                placeholder="যেমন: নিয়মিত জিরা ও দারুচিনি ক্রেতা"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="h-11 text-sm"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCustomerOpen(false)}
                className="flex-1 h-12 text-sm font-semibold"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
