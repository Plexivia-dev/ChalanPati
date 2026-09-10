import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { formatTaka, toBengaliNumber } from "@/src/utils/formatters";

interface SalesDayData {
  dateStr: string;
  dayName: string;
  label: string;
  fullDate: string;
  sales: number;
  paid: number;
  due: number;
  txCount: number;
}

interface SalesTrendChartProps {
  data: SalesDayData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SalesDayData }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="bg-stone-900 text-white p-2.5 rounded-xl shadow-lg border border-stone-800 text-xs space-y-1 z-50">
        <div className="font-bold text-stone-200 border-b border-stone-800 pb-1 flex items-center justify-between gap-3">
          <span>{item.fullDate}</span>
          <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.2 rounded">
            {toBengaliNumber(item.txCount)} টি চালান
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-0.5">
          <span className="text-stone-400">মোট বিক্রি:</span>
          <span className="font-black text-emerald-400 text-sm">
            {formatTaka(item.sales)}
          </span>
        </div>
        {item.paid > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-stone-400">নগদ আদায়:</span>
            <span className="font-bold text-stone-300">
              {formatTaka(item.paid)}
            </span>
          </div>
        )}
        {item.due > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-rose-400">বাকি:</span>
            <span className="font-bold text-rose-300">
              {formatTaka(item.due)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  // Calculate total 7-day sales
  const total7DaySales = data.reduce((acc, curr) => acc + curr.sales, 0);

  // Custom Y-axis formatter to show in thousands or compact Bengali
  const formatYAxis = (value: number) => {
    if (value === 0) return "০";
    if (value >= 100000) {
      return `${toBengaliNumber((value / 100000).toFixed(1))} লাখ`;
    }
    if (value >= 1000) {
      return `${toBengaliNumber(Math.round(value / 1000))}হাজার`;
    }
    return toBengaliNumber(value);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-stone-900 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>গত ৭ দিনের বিক্রির ধারা</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            দৈনিক মোট পাইকারি বিক্রির গ্রাফ চিত্র
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-stone-400 block">
            ৭ দিনে মোট বিক্রি
          </span>
          <span className="text-sm font-black text-emerald-700">
            {formatTaka(total7DaySales)}
          </span>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: -14, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f0eb" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#e7e5e4" }}
              tick={{ fill: "#78716c", fontSize: 11, fontWeight: 600 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a8a29e", fontSize: 10 }}
              tickFormatter={formatYAxis}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#047857"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#047857",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#047857",
                stroke: "#ffffff",
                strokeWidth: 2.5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom helper info */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
          সবুজ রেখা: দৈনিক বিক্রির ওঠানামা
        </span>
        <span>গ্রাফের বিন্দুতে চাপ দিয়ে বিস্তারিত দেখুন</span>
      </div>
    </div>
  );
};
