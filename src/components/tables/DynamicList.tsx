import Image from "next/image"
import logo from '@/lib/images/logo.png';
import { Users, ShoppingBag, Calendar, DollarSign, Package, Store } from "lucide-react"
import { motion } from "framer-motion"

interface ListItem {
  id: string
  name: string
  image: string
  secondaryText: string
  tertiaryText: string
  sales: number
  count: number
  extraInfo?: string
}

interface DynamicListProps {
  items: ListItem[]
  type: "stores" | "products"
}

export default function DynamicList({ items, type }: DynamicListProps) {
  const showScrollbar = type === "products" || items.length > 5

  return (
    <div className={`${showScrollbar ? "max-h-[550px] overflow-y-auto custom-scrollbar" : ""}`}>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-12 w-12 relative rounded-full overflow-hidden border-2 border-gray-100">
                <Image src={logo} alt={item.name} fill style={{ objectFit: "cover" }} />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 flex items-center">
                  {type === "stores" ? (
                    <Store className="w-4 h-4 mr-1 text-blue-500" />
                  ) : (
                    <Package className="w-4 h-4 mr-1 text-blue-500" />
                  )}
                  {item.secondaryText}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{item.sales.toLocaleString()} EGP</p>
                <p className="text-sm text-gray-500 flex items-center justify-end">
                  {type === "stores" ? <ShoppingBag className="w-4 h-4 mr-1" /> : <Package className="w-4 h-4 mr-1" />}
                  {item.count} {type === "stores" ? "orders" : "units"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <p className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-600" />
                {item.tertiaryText}
              </p>
              {type === "stores" ? (
                <p className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-600" />
                  {item.extraInfo}
                </p>
              ) : (
                <p className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-600" />
                  {item.extraInfo}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}


