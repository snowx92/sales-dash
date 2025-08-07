# Store Profile API

This module provides API services for accessing store profile data, including analytics, orders, payment history, VPay transactions, and charts.

## Usage

```typescript
import { profileService } from '@/lib/api/stores/profile';

// Get store analytics
const analytics = await profileService.getStoreAnalytics('storeId');

// Get store orders with pagination
const orders = await profileService.getStoreOrders('storeId', { pageNo: 1, limit: 10 });

// Get payment history with pagination
const payments = await profileService.getPaymentHistory('storeId', { pageNo: 1, limit: 10 });

// Get VPay transactions with pagination
const transactions = await profileService.getVPayTransactions('storeId', { pageNo: 1, limit: 10 });

// Get charts data with date range
const charts = await profileService.getCharts('storeId', { from: '2025-01-01', to: '2025-01-02' });
```

## Available Methods

- `getStoreAnalytics(storeId: string)`: Get store analytics data
- `getStoreOrders(storeId: string, params: GetOrdersParams)`: Get paginated store orders
- `getPaymentHistory(storeId: string, params: GetPaymentHistoryParams)`: Get paginated payment history
- `getVPayTransactions(storeId: string, params: GetVPayTransactionsParams)`: Get paginated VPay transactions
- `getCharts(storeId: string, params: GetChartsParams)`: Get charts data for a specific date range

## Response Types

The module exports the following response types:

- `StoreAnalyticsResponse`: Store analytics data
- `OrdersResponse`: Paginated orders data
- `PaymentHistoryResponse`: Paginated payment history data
- `VPayTransactionsResponse`: Paginated VPay transactions data
- `ChartsData`: Charts data including counters and time series charts 