"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CreditCardIcon, BarChart2 } from "lucide-react"
import type { StoreWithBalance } from "@/lib/api/vpay/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pagination } from "@/components/tables/Pagination"

interface ActiveWalletsProps {
  wallets: StoreWithBalance[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function ActiveWallets({ 
  wallets, 
  currentPage, 
  totalItems,
  onPageChange,
  isLoading = false 
}: ActiveWalletsProps) {
  console.log('ActiveWallets - Received wallets:', wallets)

  const formatBalance = (balance: number | undefined) => {
    if (typeof balance === 'undefined' || balance === null) return '0 Egp'
    return `${Math.floor(balance).toLocaleString()} Egp`
  }

  const renderStoreCard = (store: StoreWithBalance, index: number) => {
    console.log(`Rendering store card ${index}:`, store)
    
    if (!store) {
      console.log(`Store at index ${index} is null or undefined`)
      return null
    }

    const analyticsUrl = `/dashboard/merchants/analytics/${store.id}`

    return (
      <motion.div
        key={store.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all overflow-hidden"
        whileHover={{ scale: 1.01, y: -5 }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={analyticsUrl}
                className="relative cursor-pointer"
                title="View Store Analytics"
              >
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors">
                  <Image
                    src={store.logo || "/store-placeholder.png"}
                    alt={`${store.name || 'Store'} logo`}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                    onError={(e) => {
                      console.error('Failed to load store logo:', store.logo)
                      e.currentTarget.src = "/store-placeholder.png"
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CreditCardIcon className="h-3 w-3 text-white" />
                </div>
              </Link>
              <div>
                <Link href={analyticsUrl}>
                  <h3 className="font-semibold text-gray-900 text-lg hover:text-purple-700 transition-colors cursor-pointer">
                    {store.name || 'Unnamed Store'}
                  </h3>
                </Link>
                <div className="flex flex-wrap gap-2 mt-1">
                  {store.plan && (
                    <span key={`${store.id}-plan`} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {store.plan.planName || 'No Plan'}
                    </span>
                  )}
                  <span key={`${store.id}-merchant`} className="text-gray-500 text-xs">ID: {store.merchantId || 'N/A'}</span>
                  <span key={`${store.id}-country`} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {store.defaultCountry || 'No Country'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-purple-800 text-2xl">
                {formatBalance(store.vPayBalance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Available Balance</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              {store.category && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    {store.category.icon ? (
                      <Image
                        src={store.category.icon}
                        alt={store.category.name || 'Category icon'}
                        width={12}
                        height={12}
                        className="object-contain"
                        onError={(e) => {
                          console.error('Failed to load category icon:', store.category.icon)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-3 h-3 bg-purple-300 rounded-full" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{store.category.name || 'Uncategorized'}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <Link 
                  href={analyticsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs text-white">
                    <BarChart2 className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </Link>

                <Link 
                  href={`/dashboard/merchants/${store.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700 text-xs text-white">
                    Transaction History
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2 w-full bg-gradient-to-r from-purple-100 to-purple-200"></div>
      </motion.div>
    );
  };

  // Early return with loading state if wallets is undefined
  if (typeof wallets === 'undefined') {
    console.log('Wallets is undefined')
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Stores</h2>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading stores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Stores</h2>

      {!wallets || wallets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No active stores found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {wallets.map((store, index) => renderStoreCard(store, index))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={5}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  )
}

