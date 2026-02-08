// StatCard.tsx
import { LucideIcon } from "lucide-react"

interface SubValue {
  value: number;
  label: string;
  color: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  color: string;
  subValue?: SubValue;
  transactionCount?: string;
  bgColor?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  subValue,
  transactionCount,
}: StatCardProps) {
  // Format number to remove decimals
  const formatNumber = (num: number | string) => {
    return typeof num === 'number' ? Math.floor(num).toLocaleString() : num;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      {/* Header: title + change badge */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
        {change !== undefined && change !== 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change > 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {change > 0 ? '+' : ''}{Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Value */}
      <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatNumber(value)}</h3>

      {/* Sub value */}
      {subValue && (
        <p className="text-sm text-slate-500 mt-1">
          {subValue.label}: {formatNumber(subValue.value)}
        </p>
      )}

      {/* Transaction count */}
      {transactionCount && (
        <p className="text-xs text-slate-400 mt-1">
          {transactionCount} transactions
        </p>
      )}

      {/* Accent bar */}
      <div className="mt-4 h-0.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '30%' }} />
      </div>
    </div>
  );
}
