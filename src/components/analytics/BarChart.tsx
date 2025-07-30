"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BarChartProps {
  data: {
    id: number
    name: string
    icon: string
    storesCount: number
  }[]
}

export default function BarChart({ data }: BarChartProps) {
  // Sort data by storesCount in descending order
  const sortedData = [...data].sort((a, b) => b.storesCount - a.storesCount)
  
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.storesCount))

  // Calculate total stores
  const totalStores = data.reduce((sum, item) => sum + item.storesCount, 0)

  return (
    <Card className="bg-white border rounded-xl shadow-sm">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-800 text-lg font-medium">
            Store Categories
          </CardTitle>
          <span className="text-sm text-gray-500 font-medium">
            Total: {totalStores.toLocaleString()} stores
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {sortedData.map((item, index) => {
            const percentage = (item.storesCount / maxValue) * 100
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 p-2 flex items-center justify-center">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-violet-600 font-semibold">
                        {item.storesCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative mt-2">
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <motion.div
                        className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-violet-500 shadow-lg transform -translate-y-1/2"
                        initial={{ x: "-100%" }}
                        animate={{ x: `${percentage - 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-50" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


