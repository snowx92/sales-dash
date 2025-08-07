import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Simple color helper function
const getUniqueColor = (value: string) => {
  // Simple hash-based color generation
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return {
    backgroundColor: `hsl(${hue}, 70%, 90%)`,
    textColor: `hsl(${hue}, 70%, 30%)`
  };
};
interface Payment {
  id: string;
  date: string;
  amount: number;
  planName: string;
  planPeriod: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Period</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.date}</TableCell>
            <TableCell>
              <span
                style={{
                  backgroundColor: getUniqueColor(payment.planName)
                    .backgroundColor,
                  color: getUniqueColor(payment.planName).textColor,
                }}
                className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {payment.planName}
              </span>
            </TableCell>
            <TableCell>
              <span className="px-3 py-1  bg-fuchsia-300 text-fuchsia-700 inline-flex text-xs leading-5 font-semibold rounded-full">
                {payment.amount.toFixed(2)} EGP
              </span>
            </TableCell>
            <TableCell>
              <span
                style={{
                  backgroundColor: getUniqueColor(payment.planPeriod)
                    .backgroundColor,
                  color: getUniqueColor(payment.planPeriod).textColor,
                }}
                className="px-3 py-1  inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {payment.planPeriod}  
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
