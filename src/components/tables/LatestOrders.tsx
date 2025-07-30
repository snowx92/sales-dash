import React from 'react';
import { getStatusColor } from '../../helpers/helpers';



interface Order {
  id: string;
  productsCount: number;
  customerName: string;
  totalPrice: string;
  date: string;
  governorate: string;
  status: string;
}

interface OrdersData {
  columns: string[];
  rows: Order[];
}

const LatestOrders = ({ ordersData }: { ordersData: OrdersData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Latest Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {ordersData.columns.map((column, index) => (
                <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ordersData.rows.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{order.productsCount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{order.customerName}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.totalPrice}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600" dir="rtl">{order.governorate}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestOrders;