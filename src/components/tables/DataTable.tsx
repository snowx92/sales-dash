import React from 'react';
import { getUniqueColor } from '../../helpers/helpers'; // Import the helper function

interface DataTableProps {
  data: {
    id: string;
    store?: string;
    amount?: number; // amount is optional for subscription data
    status?: string; // status is optional for subscription data
    paymentProvider?: string; // paymentProvider is optional for subscription data
    planName?: string; // Only for subscription data
    planPeriod?: string; // Only for subscription data
    discount?: number; // Only for subscription data
    date?: string; // Only for transactions
    [key: string]: string | number | undefined; // Allow for additional dynamic fields
  }[];
}

export default function DataTable({ data }: DataTableProps) {
  const columns = data.length && 'planName' in data[0]
    ? [ // Define columns for Subscription Data
        { name: "ID", key: "id" },
        { name: "Store", key: "store" },
        { name: "Plan Name", key: "planName" },
        { name: "Money", key: "amount" },
        { name: "Plan Period", key: "planPeriod" },
        { name: "Type", key: "type" }, // Added type column
        { name: "Discount", key: "discount" },
      ]
    : [ // Define columns for Transaction Data
        { name: "ID", key: "id" },
        { name: "Date", key: "date" },
        { name: "Store", key: "store" },
        { name: "Amount", key: "amount" },
        { name: "Payment Provider", key: "paymentProvider" },
        { name: "Identifier", key: "identifier" }, // Added identifier column
        { name: "Status", key: "status" },
      ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {/* Handle specific formatting for 'amount', 'paymentProvider', 'status', 'planName', 'discount', 'planPeriod' */}
                  {column.key === "amount"
                    ? `$${(item[column.key] as number)?.toFixed(2) ?? 0}`
                    : column.key === "paymentProvider"
                    ? (
                      <span
                        style={{
                          backgroundColor: getUniqueColor(item[column.key] as string).backgroundColor,
                          color: getUniqueColor(item[column.key] as string).textColor,
                        }}
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {item[column.key]}
                      </span>
                    )
                    : column.key === "status"
                    ? (
                      <span
                        style={{
                          backgroundColor: getUniqueColor(item[column.key] as string).backgroundColor,
                          color: getUniqueColor(item[column.key] as string).textColor,
                        }}
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {item[column.key]}
                      </span> 
                    )
                    : column.key === "planName"
                    ? (
                      <span
                        style={{
                          backgroundColor: getUniqueColor(item[column.key] as string).backgroundColor,
                          color: getUniqueColor(item[column.key] as string).textColor,
                        }}
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {item[column.key]}
                      </span>
                    )
                    : column.key === "discount"
                    ? (
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (item[column.key] as number) > 20
                            ? "bg-green-100 text-green-800"
                            : (item[column.key] as number) > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item[column.key]}%
                      </span>
                    )
                    : column.key === "planPeriod"
                    ? (
                      <span
                        style={{
                          backgroundColor: getUniqueColor(item[column.key] as string).backgroundColor,
                          color: getUniqueColor(item[column.key] as string).textColor,
                        }}
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {item[column.key]}
                      </span>
                    )
                    : column.key === "type"
                    ? (
                      <span
                        style={{
                          backgroundColor: getUniqueColor(item[column.key] as string).backgroundColor,
                          color: getUniqueColor(item[column.key] as string).textColor,
                        }}
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {item[column.key]}
                      </span>
                    )
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}