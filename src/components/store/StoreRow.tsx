import { TableCell, TableRow } from "@/components/ui/table"

interface StoreRowProps {
  store: {
    id: number
    storeName: string
    createdAt: string
    totalOrders: number
    websiteVisits: number
    totalProducts: number
    planName: string
    subscriptionStatus: string
  }
  onSelect: (id: number) => void
}

export function StoreRow({ store, onSelect }: StoreRowProps) {
  return (
    <TableRow onClick={() => onSelect(store.id)} className="cursor-pointer hover:bg-gray-100">
      <TableCell>{store.storeName}</TableCell>
      <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>{store.totalOrders}</TableCell>
      <TableCell>{store.websiteVisits}</TableCell>
      <TableCell>{store.totalProducts}</TableCell>
      <TableCell>{store.planName}</TableCell>
      <TableCell>{store.subscriptionStatus}</TableCell>
    </TableRow>
  )
}

