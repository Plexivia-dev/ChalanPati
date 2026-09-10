import React, { useState } from "react";
import { Store, KeyRound, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { useHisabStore } from "@/src/store/useHisabStore";
import { DEFAULT_BUSINESS_NAME } from "@/src/data/seedData";
import { toast } from "sonner";

export const LoginScreen: React.FC = () => {
  const { login, businessName } = useHisabStore();
  const [name, setName] = useState(businessName || DEFAULT_BUSINESS_NAME);
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("অনুগ্রহ করে আপনার ব্যবসার নাম লিখুন");
      return;
    }
    if (!pin.trim()) {
      setError("অনুগ্রহ করে আপনার ৪ ডিজিটের পিন লিখুন");
      return;
    }

    login(name, pin);
    toast.success("সফলভাবে লগইন হয়েছে!", {
      description: `স্বাগতম, ${name}`,
    });
  };

  const fillDemoCreds = () => {
    setName(DEFAULT_BUSINESS_NAME);
    setPin("1234");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-900/20 mb-3">
            <Store className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            ডিজিটাল হিসাব খাতা
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium mt-1">
            পাইকারি মসলা ব্যবসার সহজ ও নির্ভুল খাতা
          </p>
        </div>

        <Card className="shadow-md border-stone-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-stone-900 font-bold">
              দোকানের লগইন
            </CardTitle>
            <CardDescription className="text-stone-500 text-sm">
              আপনার ব্যবসার নাম ও পিন দিয়ে প্রবেশ করুন
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="login-business-name"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-1.5"
                >
                  <Store className="w-4 h-4 text-emerald-700" />
                  ব্যবসার নাম / ইউজারনেম
                </label>
                <Input
                  id="login-business-name"
                  type="text"
                  placeholder="যেমন: মেসার্স হাজী বাণিজ্যালয়"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  className="h-13 text-base font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-pin"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  গোপন পিন (PIN)
                </label>
                <Input
                  id="login-pin"
                  type="password"
                  placeholder="পিন লিখুন (ডেমো: 1234)"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  className="h-13 text-base font-semibold tracking-widest"
                />
              </div>

              <Button
                id="btn-login-submit"
                type="submit"
                className="w-full h-13 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm mt-2"
              >
                লগইন করুন
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>

              {/* Quick Demo Helper */}
              <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={fillDemoCreds}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-stone-600 hover:text-emerald-700 font-semibold py-1.5 px-3 rounded-lg bg-stone-50 border border-stone-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  ডেমো অ্যাকাউন্ট তথ্য বসান
                </button>
                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>তথ্য আপনার ফোনে নিরাপদে সংরক্ষিত থাকে</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
