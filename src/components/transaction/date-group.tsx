"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { TransactionCard } from "@/components/transaction/transaction-card"
// import type { DailyTransactions } from "../../lib/api/Subscribtions/types" // Commented out API types
import { Button } from "@/components/transaction/ui/button"
import { Card, CardContent, CardHeader } from "@/components/transaction/ui/card"

// Simple date formatting function
const formatDisplayDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

// Frontend-only type definition for daily transactions
interface DailyTransactions {
  date: string;
  totalAmount: number;
  transactions: Array<{
    id: string;
    currency: string;
    createdAt: {
      seconds?: number;
      _nanoseconds: number;
    };
    amount: number;
    status: string;
    paymentMethod: string;
    [key: string]: any;
  }>;
}

interface DateGroupProps {
  day: DailyTransactions
}

export function DateGroup({ day }: DateGroupProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card className="overflow-hidden border-0 shadow-xl shadow-indigo-100/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between py-5 px-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/30">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{formatDisplayDate(day.date)}</h2>
            <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span className="font-medium text-indigo-600">{day.transactions.length} transactions</span>
                              <span className="text-gray-500">•</span>
              <span className="font-medium">
                Total:{" "}
                <span className="text-emerald-600">
                  {day.totalAmount.toLocaleString()} {day.transactions[0]?.currency}
                </span>
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 bg-white shadow-md hover:bg-indigo-50 transition-all duration-200"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <ChevronUp size={18} className="text-indigo-600" />
          ) : (
            <ChevronDown size={18} className="text-indigo-600" />
          )}
        </Button>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="px-0 py-0 divide-y divide-indigo-100/30 bg-white">
              {day.transactions.map((transaction, index) => {
                // Ensure createdAt has both seconds and _nanoseconds
                const fixedTransaction = {
                  ...transaction,
                  createdAt: {
                    seconds: transaction.createdAt.seconds ?? 0,
                    _nanoseconds: transaction.createdAt._nanoseconds,
                  },
                };
                return (
                  <motion.div
                    key={`${transaction.id}-${transaction.createdAt._nanoseconds}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <TransactionCard transaction={fixedTransaction} />
                  </motion.div>
                );
              })}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

