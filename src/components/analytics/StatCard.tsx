// StatCard.tsx
import { LucideIcon } from "lucide-react"
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

