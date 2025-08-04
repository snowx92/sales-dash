/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
// import { SubscriptionService } from '@/lib/api/stores/subscriptions/SubscriptionService'
import { toast } from 'sonner';
// const subscriptionService = new SubscriptionService();

interface StoreData {
  id: string;
  storeName: string;
  storeLogo: string;
  planName: string;
  currentOrders: number;
  ordersLimit: number;
}

export interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeData?: StoreData;
  onSubscriptionComplete?: () => Promise<void>;
}

const PLAN_PRICES = {
  starter: 300,
  plus: 500,
  pro: 700
};

const DURATION_MULTIPLIERS = {
  month: 1,
  quartar: 3,
  year: 12
};

const DURATION_LABELS = {
  month: 'month',
  quartar: 'quartar',
  year: 'year'
};

const DEFAULT_STORE_DATA: StoreData = {
  id: '',
  storeName: 'Loading...',
  storeLogo: '/logo.png',
  planName: 'Loading...',
  currentOrders: 0,
  ordersLimit: 0,
};

export function MerchantModal({ isOpen, onClose, storeData = DEFAULT_STORE_DATA, onSubscriptionComplete }: MerchantModalProps) {
  const [planType, setPlanType] = useState("")
  const [duration, setDuration] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  // Using sonner toast directly

  useEffect(() => {
    if (planType && duration) {
      const basePrice = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
      const multiplier = DURATION_MULTIPLIERS[duration as keyof typeof DURATION_MULTIPLIERS];
      if (basePrice && multiplier) {
        setAmount((basePrice * multiplier).toString());
      }
    }
  }, [planType, duration]);

  if (!isOpen) return null;

  const handleAddSubscription = async () => {
    // Validate inputs
    if (!planType || !duration || !amount) {
      toast.error('Validation Error: Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Invalid Amount: Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError("");

    const subscriptionData = {
      planId: planType,
      durationId: duration,
      paidAmount: numericAmount
    };

    try {
      // await subscriptionService.createSubscription(storeData.id, subscriptionData);
      
      // Show success toast
      toast(
        <>
          <div className="font-bold">Subscription Created (Static Mode)</div>
          <div>
            Successfully subscribed to {planType} plan for {DURATION_LABELS[duration as keyof typeof DURATION_LABELS]} duration with amount ${numericAmount}
          </div>
        </>
      );

      // Then refresh the data before closing the modal
      if (onSubscriptionComplete) {
        try {
          await onSubscriptionComplete();
        } catch (refreshError) {
          toast(
            <div>
              <div className="font-bold text-red-700">Refresh Failed</div>
              <div>Store list could not be refreshed. Please reload the page.</div>
            </div>
          );
        }
      }

      // Finally close the modal
      onClose();
      
    } catch (err) {
      // Show error toast and keep modal open
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast(
        <div>
          <div className="font-bold text-red-700">Subscription Failed</div>
          <div>Failed to create subscription. Please try again.</div>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
            {storeData.storeName}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src={storeData.storeLogo || '/logo.png'}
              alt="Store Logo"
              width={120}
              height={120}
              className="rounded-full border-4 border-purple-100 shadow-lg"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Current Plan</p>
            <p className="text-lg font-semibold text-gray-800">{storeData.planName}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Order Usage</span>
            <span className="font-medium text-gray-800">
              {storeData.currentOrders} / {storeData.ordersLimit}
            </span>
          </div>
          <Progress 
            value={(storeData.currentOrders / storeData.ordersLimit) * 100} 
            className="h-2 rounded-full bg-gray-100"
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Plan
            </label>
            <Select 
              onValueChange={setPlanType}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">StartUp Plan</SelectItem>
                <SelectItem value="plus" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Plus Plan</SelectItem>
                <SelectItem value="pro" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Pro Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <Select 
              onValueChange={setDuration}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Monthly</SelectItem>
                <SelectItem value="quartar" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Quarterly</SelectItem>
                <SelectItem value="year" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <Input
              type="number"
              className="bg-gray-50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button 
          onClick={handleAddSubscription}
          className="w-full mt-8 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-white py-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !planType || !duration || !amount}
        >
          {isSubmitting ? 'Processing...' : 'Subscribe Now'}
        </Button>
      </div>
    </div>
  )
}

