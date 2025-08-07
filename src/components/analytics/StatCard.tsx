// StatCard.tsx
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
  color,
  subValue,
  transactionCount,
  bgColor = "bg-gray-100"
}: StatCardProps) {
  // Format number to remove decimals
  const formatNumber = (num: number | string) => {
    return typeof num === 'number' ? Math.floor(num).toLocaleString() : num;
  };

  // Get change indicator component
  const getChangeIndicator = () => {
    if (change === undefined || change === 0) return null;
    
    const isPositive = change > 0;
    const ArrowIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";
    
    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
        <ArrowIcon className="h-4 w-4" />
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="mt-2">
              <h3 className="text-2xl font-semibold text-purple-900">{formatNumber(value)}</h3>
              {subValue && (
                <p className={subValue.color}>
                  {subValue.label}: {formatNumber(subValue.value)}
                </p>
              )}
              {transactionCount && (
                <p className="text-sm text-gray-500">
                  Transactions: {transactionCount}
                </p>
              )}
              {getChangeIndicator()}
            </div>
          </div>
          <div className={`p-3 rounded-full ${bgColor} bg-opacity-15`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

