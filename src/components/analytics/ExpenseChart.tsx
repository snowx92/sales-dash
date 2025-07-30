"use client";

import { motion } from "framer-motion";

// Define ExpenseData type inline since the import doesn't exist
interface ExpenseData {
  name: string;
  totalAmount: number;
  count: number;
}

// Define a color mapping for expense categories
const EXPENSE_COLORS: Record<string, { color: string, icon: string }> = {
  "Servers": { color: "#10B981", icon: "🖥️" },
  "Marketing": { color: "#F59E0B", icon: "📢" },
  "Payroll": { color: "#3B82F6", icon: "👥" },
  "Advance": { color: "#8B5CF6", icon: "💰" },
  "Others": { color: "#6B7280", icon: "🔄" },
  "Events": { color: "#EC4899", icon: "🎉" },
  "Office": { color: "#14B8A6", icon: "🏢" },
  "Refund": { color: "#EF4444", icon: "💸" },
  // Fallback for any new categories
  "default": { color: "#6B7280", icon: "📊" }
};

interface ExpenseChartItem {
  name: string;
  value: number;
  color: string;
  icon: string;
  count: number;
}

interface ExpenseChartProps {
  data?: ExpenseData[];
  title?: string;
  staticData?: ExpenseChartItem[];
}

export default function ExpenseChart({ data, staticData, title = "Monthly Expenses Breakdown" }: ExpenseChartProps) {
  console.log('ExpenseChart - Raw data:', data);
  console.log('ExpenseChart - Static data:', staticData);
  
  // Transform API data to chart format if provided, otherwise use static data
  const chartData: ExpenseChartItem[] = data 
    ? data
        .filter(item => item.totalAmount > 0) // Only show items with values
        .map(item => ({
          name: item.name,
          value: item.totalAmount,
          count: item.count,
          ...(EXPENSE_COLORS[item.name] || EXPENSE_COLORS.default)
        }))
    : staticData || [];
  
  console.log('ExpenseChart - Processed chart data:', chartData);
  
  // If no data available, show a message
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-purple-800">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No expense data available for this period</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(item => item.value));
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-800">{title}</h3>
          <span className="text-sm text-gray-500 font-medium">
            Total: {totalValue.toLocaleString()} Egp
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {/* Chart Area */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-64 mb-6">
          {chartData.map((expense, index) => {
            const barHeight = (expense.value / maxValue) * 100;
            return (
              <div key={expense.name} className="flex flex-col items-center gap-2 flex-1">
                {/* Value Label */}
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  {(expense.value / 1000).toFixed(1)}k Egp
                </div>
                
                {/* Bar Container */}
                <div className="relative w-full max-w-16 h-48 bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-end">
                  <motion.div
                    className="w-full rounded-lg shadow-sm relative"
                    style={{ 
                      backgroundColor: expense.color,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                  >
                    {/* Icon at the top of bar */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm"
                        style={{ backgroundColor: expense.color }}
                      >
                        {expense.icon}
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Category Label with Color */}
                <div 
                  className="text-xs font-bold text-center px-2 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: expense.color }}
                >
                  {expense.name}
                </div>
                
                {/* Percentage and Count */}
                <div className="text-xs text-gray-500 font-medium text-center">
                  {((expense.value / totalValue) * 100).toFixed(1)}%
                  {expense.count > 0 && <span className="block">{expense.count} entries</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 