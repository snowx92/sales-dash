/**
 * Calculate merchant health status based on plan, activity, and engagement
 */

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface MerchantHealthResult {
  status: HealthStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  reasons: string[];
}

export function calculateMerchantHealth(merchant: {
  plan?: {
    isExpired?: boolean;
    expireDate?: string;
  };
  counters?: {
    orders?: number;
    products?: number;
    visits?: number;
  };
  isExpired?: boolean;
}): MerchantHealthResult {
  const reasons: string[] = [];
  let score = 100; // Start healthy, deduct points

  // Check expiration
  if (merchant.isExpired || merchant.plan?.isExpired) {
    score -= 50;
    reasons.push('Subscription expired');
  } else if (merchant.plan?.expireDate) {
    const expiryDate = new Date(merchant.plan.expireDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) {
      score -= 30;
      reasons.push(`Expires in ${daysUntilExpiry} days`);
    } else if (daysUntilExpiry <= 30) {
      score -= 15;
      reasons.push(`Expires in ${daysUntilExpiry} days`);
    }
  }

  // Check activity
  const orders = merchant.counters?.orders || 0;
  const products = merchant.counters?.products || 0;
  const visits = merchant.counters?.visits || 0;

  if (orders === 0 && products === 0) {
    score -= 25;
    reasons.push('No orders or products');
  } else if (orders < 5) {
    score -= 10;
    reasons.push('Low order count');
  }

  if (visits === 0) {
    score -= 15;
    reasons.push('No website visits');
  }

  // Determine status
  let status: HealthStatus;
  if (score >= 70) {
    status = 'healthy';
  } else if (score >= 40) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  const statusConfig = {
    healthy: {
      label: 'Healthy',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
    warning: {
      label: 'At Risk',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
    },
    critical: {
      label: 'Critical',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
  };

  return {
    status,
    ...statusConfig[status],
    reasons,
  };
}
