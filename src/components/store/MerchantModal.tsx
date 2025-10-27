/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SubscriptionService } from '@/lib/api/stores/subscriptions/SubscriptionService'
import { storesActionsApi } from '@/lib/api/stores/actions/storesActions'
import { toast } from 'sonner';
import { Link, Copy } from 'lucide-react';

const subscriptionService = new SubscriptionService();

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
  half: 6,
  year: 12
};

const DURATION_LABELS = {
  month: 'month',
  quartar: 'quartar',
  half: '6 months',
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
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [error, setError] = useState("")
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
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
    console.log("[Subscription Modal] Starting subscription process...");
    
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

    console.log("[Subscription Modal] Validation passed:", { planType, duration, numericAmount });

    setIsSubmitting(true);
    setError("");

    try {
      // Create subscription request
      const subscriptionData = {
        planId: planType, // e.g., "starter", "plus", "pro"
        durationId: duration, // e.g., "month", "quartar", "year"
        paidAmount: numericAmount
      };

      console.log("[Subscription] Creating subscription:", subscriptionData);
      
      // Call the subscription API
      await subscriptionService.createSubscription(storeData.id, subscriptionData);
      
      // Show success toast
      toast.success(
        `Successfully subscribed to ${planType} plan for ${DURATION_LABELS[duration as keyof typeof DURATION_LABELS]} duration with amount ${numericAmount} EGP`
      );

      // Then refresh the data before closing the modal
      if (onSubscriptionComplete) {
        try {
          await onSubscriptionComplete();
        } catch {
          toast.error("Store list could not be refreshed. Please reload the page.");
        }
      }

      // Finally close the modal
      onClose();
      
    } catch (err) {
      // Show error toast and keep modal open
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to create subscription: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    console.log("[Payment Link] Starting payment link generation...");

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

    console.log("[Payment Link] Validation passed:", { planType, duration, numericAmount });

    setIsGeneratingLink(true);
    setError("");
    setPaymentLink(null);

    try {
      // Create payment link request
      const paymentData = {
        planId: planType as 'pro' | 'starter' | 'plus',
        durationId: duration as 'month' | 'quarter' | 'half' | 'year',
        paidAmount: numericAmount
      };

      console.log("[Payment Link] Generating link:", paymentData);

      // Call the payment link API
      const response = await storesActionsApi.generatePaymentLink(storeData.id, paymentData);

      if (response && response.data?.paymentLink) {
        // If a paymentLink is present, accept it even if the gateway flagged success=false.
        // Many gateways return a link but mark 'success' false for non-fatal reasons
        // (e.g., trxId not created yet). Prefer returning the link to the user and
        // show a warning so they can still proceed.
        setPaymentLink(response.data.paymentLink);
        if (response.data.success === false) {
          toast.success('Payment link generated (gateway returned partial success). Please verify transaction status.');
          console.warn('[Payment Link] Gateway reported success=false, trxId:', response.data.trxId);
        } else {
          toast.success('Payment link generated successfully!');
        }
        console.log("[Payment Link] Link:", response.data.paymentLink);
        console.log("[Payment Link] Transaction ID:", response.data.trxId);
      } else {
        throw new Error('Failed to generate payment link');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to generate payment link: ${errorMessage}`);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast.success('Payment link copied to clipboard!');
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
              <SelectTrigger className="w-full bg-white text-gray-900 border border-gray-300">
                <SelectValue placeholder="Choose a plan" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
              <SelectTrigger className="w-full bg-white text-gray-900 border border-gray-300">
                <SelectValue placeholder="Select duration" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="month" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Monthly</SelectItem>
                <SelectItem value="quartar" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Quarterly (3 months)</SelectItem>
                <SelectItem value="half" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Half Year (6 months)</SelectItem>
                <SelectItem value="year" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Yearly (12 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <Input
              type="number"
              className="bg-white text-gray-900 border border-gray-300 placeholder:text-gray-500"
              placeholder="Enter amount"
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

        {/* Payment Link Display */}
        {paymentLink && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Payment Link Generated</span>
              <button
                onClick={handleCopyPaymentLink}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <div className="text-xs text-green-700 break-all bg-white p-2 rounded border border-green-200">
              {paymentLink}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={handleAddSubscription}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-white py-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isGeneratingLink || !planType || !duration || !amount}
          >
            {isSubmitting ? 'Processing...' : 'Subscribe Now'}
          </Button>

          <Button
            onClick={handleGeneratePaymentLink}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSubmitting || isGeneratingLink || !planType || !duration || !amount}
          >
            <Link className="h-4 w-4" />
            {isGeneratingLink ? 'Generating...' : 'Generate Link'}
          </Button>
        </div>
      </div>
    </div>
  )
}

