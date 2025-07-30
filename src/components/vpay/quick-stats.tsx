"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, CreditCard, Wallet, ArrowDown, ArrowUp } from "lucide-react"

interface QuickStatsProps {
  totalPayouts: number
  totalWallets: number
}

export default function QuickStats({ totalPayouts, totalWallets }: QuickStatsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" variants={item}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">Total Payouts</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalPayouts.toLocaleString()} Egp</h3>
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>8.2% from last month</span>
            </div>
          </div>
          <div className="bg-purple-100 p-2 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" variants={item}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">Active Wallets</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalWallets.toLocaleString()} Egp</h3>
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>12.4% from last month</span>
            </div>
          </div>
          <div className="bg-purple-100 p-2 rounded-lg">
            <Wallet className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" variants={item}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">Total Transactions</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">183 Egp</h3>
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>3.1% from last month</span>
            </div>
          </div>
          <div className="bg-purple-100 p-2 rounded-lg">
            <ArrowUpRight className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

