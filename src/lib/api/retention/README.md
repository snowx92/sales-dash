# Retention Service

This module provides a complete solution for managing ended subscriptions and retention feedback in the sales dashboard.

## API Endpoints

### GET `/retention`
Fetches ended subscriptions with pagination and filtering options.

**Query Parameters:**
- `limit` (number): Items per page
- `pageNo` (number): Page number (1-based)
- `priority` (string): Filter by priority (HIGH, MEDIUM, LOW)
- `search` (string): Search query

**Example:**
```
GET {{salesUrl}}/retention?limit=10&pageNo=1&priority=HIGH
```

### POST `/retention/:id/feedback`
Submit feedback for retention.

**Request Body:**
```json
{
  "feedback": "Customer needs better onboarding",
  "priority": "HIGH"
}
```

**Note:** All monetary values in the application are displayed in EGP (Egyptian Pounds).

## Usage

### Basic Service Usage

```typescript
import { retentionService } from '@/lib/api/retention/retentionService';

// Get first page of ended subscriptions
const data = await retentionService.getRetentionPage(1, 10);

// Filter by priority
const highPriorityItems = await retentionService.getRetentionByPriority('HIGH');

// Search retention data
const searchResults = await retentionService.searchRetention('customer email');

// Submit feedback
await retentionService.submitFeedback({
  id: "store-123",  // Use the id field from API response
  feedback: "Need to improve onboarding process",
  priority: "HIGH"
});
```

### Using the React Hook

```typescript
import { useRetention } from '@/lib/hooks/useRetention';

function RetentionComponent() {
  const {
    items,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    nextPage,
    previousPage,
    filterByPriority,
    searchRetention,
    submitFeedback
  } = useRetention({
    initialLimit: 10,
    autoFetch: true
  });

  // Component implementation...
}
```

## Types

### EndedSubscriptionItem
```typescript
interface EndedSubscriptionItem {
  id: string;                // Unique identifier for API operations
  name: string;              // Customer name
  storeName: string;         // Store name
  merchantId: string;        // Merchant identifier
  email: string;             // Customer email
  impact: number;            // Impact score
  attemps: number;           // Number of contact attempts
  expiredAt: string | null;  // Expiration date
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  renewCounts: number;       // Previous renewal count
  link: string;              // Store link
  feedbacks: string[];       // Previous feedbacks
}
```

### EndedSubscriptionsData
```typescript
interface EndedSubscriptionsData {
  items: EndedSubscriptionItem[];
  pageItems: number;         // Items on current page
  totalItems: number;        // Total items across all pages
  isLastPage: boolean;       // Is this the last page?
  nextPageNumber: number;    // Next page number
  currentPage: number;       // Current page number
  totalPages: number;        // Total number of pages
  docsReaded: number;        // Documents read count
}
```

## Hook Features

The `useRetention` hook provides:

- ✅ **Automatic data fetching** with configurable options
- ✅ **Pagination management** (next, previous, go to page)
- ✅ **Priority filtering** (HIGH, MEDIUM, LOW)
- ✅ **Search functionality**
- ✅ **Feedback submission** with loading states
- ✅ **Error handling** with retry mechanisms
- ✅ **Loading states** for better UX
- ✅ **Automatic refresh** after feedback submission

## Component Example

See `@/components/retention/RetentionExample.tsx` for a complete implementation example that demonstrates:

- Data fetching and display
- Pagination controls
- Priority filtering
- Search functionality
- Feedback submission form
- Error handling and loading states

## API Response Structure

### Successful Response
```json
{
  "status": 200,
  "message": "Ended subscriptions fetched successfully",
  "data": {
    "items": [...],
    "pageItems": 10,
    "totalItems": 45,
    "isLastPage": false,
    "nextPageNumber": 2,
    "currentPage": 1,
    "totalPages": 5,
    "docsReaded": 10
  }
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Invalid request parameters",
  "data": null
}
```

## Best Practices

1. **Use the hook for React components** - It provides better state management
2. **Handle loading states** - Show appropriate loading indicators
3. **Implement error boundaries** - Gracefully handle API failures
4. **Debounce search inputs** - Avoid excessive API calls
5. **Cache results when appropriate** - Reduce API load
6. **Provide feedback confirmation** - Show success/error messages to users
