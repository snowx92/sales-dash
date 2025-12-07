/* eslint-disable @next/next/no-img-element */
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, Globe, Box, Eye, Calendar, Clock, LogIn, BarChart, Key, EyeOff, MapPin, Building2, XCircle, CreditCard, User, Wallet, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
// import logo from "@/lib/images/logo.png";
// import { Timestamp } from "@/lib/api/services/commonTypes";
// import { Category } from "@/lib/api/stores/types";

// Local interfaces for static data
interface Timestamp {
  _seconds: number;
}

interface Category {
  id: number;
  icon: string;
  name: string;
}
import { LucideIcon } from "lucide-react";
import { storesActionsApi } from "@/lib/api/stores/actions/storesActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MerchantModal } from "./MerchantModal";

export interface MerchantCardProps {
  id: string;
  storeName: string;
  storeLogo: string;
  planName: string;
  isTrial: boolean;
  isExpired: boolean;
  storeUsername: string;
  totalOrders: number;
  totalEmployees: number;
  totalCustomers: number;
  websiteLink: string;
  planExpirationDate: string;
  websiteVisits: number;
  products: number;
  status: string;
  category: Category | null;
  defaultCountry: string;
  defaultCurrency: string;
  renewEnabled: boolean;
  localMarkets: string[];
  hiddenOrders: number;
  assignedSales?: {
    id: string;
    avatar: string;
    name: string;
  };
  createdAt: Timestamp;
  vPayBalance: number;
  isBeta: boolean;
  isWebsiteExpired: boolean;
  finishedSetup: boolean;
}

// Function to generate a unique color based on a string value with opacity and a matching text color
export const getUniqueColor = (
  value: string,
  opacity: number = 0.8
): { backgroundColor: string; textColor: string } => {
  // Handle specific cases for "Completed" and "Failed"
  if (value === "Completed") {
    return {
      backgroundColor: `rgba(76, 175, 80, ${opacity})`, // Green color with opacity
      textColor: `rgb(235, 253, 240)`, // Darker green for text
    };
  }
  if (value === "Failed") {
    return {
      backgroundColor: `rgba(244, 67, 54, ${opacity})`, // Red color with opacity
      textColor: `rgb(250, 206, 213)`, // Darker red for text
    };
  }

  // Simple hash function to convert a string to a number
  const hash = value.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Generate a color using the hash
  const hue = hash % 360; // Ensure hue is within the 0-359 range
  const backgroundColor = `hsla(${hue}, 70%, 80%, ${opacity})`;

  // Generate a darker shade of the background color for the text
  const textColor = `hsla(${hue}, 70%, 20%, 1)`; // Darker version of the background color

  return { backgroundColor, textColor };
};

export function MerchantCard({
  id,
  storeName,
  storeLogo,
  planName,
  isTrial,
  isExpired,
  storeUsername,
  totalOrders,
  totalEmployees,
  totalCustomers,
  websiteLink,
  planExpirationDate,
  websiteVisits,
  products,
  status,
  category,
  defaultCountry,
  defaultCurrency,
  renewEnabled,
  localMarkets,
  hiddenOrders,
  assignedSales,
  createdAt,
  vPayBalance,
  isBeta,
  isWebsiteExpired,
  finishedSetup,
}: MerchantCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasHiddenOrders = hiddenOrders > 0;
  const isExpiringSoon = !isExpired && new Date(planExpirationDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Calculate days until expiration
  const daysUntilExpiration = Math.ceil((new Date(planExpirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Calculate days since creation
  const daysSinceCreation = Math.ceil((Date.now() - new Date(createdAt._seconds * 1000).getTime()) / (1000 * 60 * 60 * 24));

  const handleForcePasswordReset = () => {
    setShowPasswordResetModal(true);
  };

  const handlePasswordResetSubmit = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please enter and confirm the new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await storesActionsApi.forcePasswordReset(id, newPassword);
      
      if (response && response.status === 200) {
        toast.success("Password reset successfully");
        setShowPasswordResetModal(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Failed to reset password");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLoginToStore = async () => {
    try {
      const token = await storesActionsApi.getStoreCredentials(id);
      console.log("[Login] API Response:", token);
      
      if (token && typeof token === 'string') {
        // The token is returned directly
        window.open(`https://dashboard.vondera.app/auth/login?token=${token}`, "_blank");
        toast.success("Successfully opened store dashboard!");
      } else {
        toast.error("Failed to get store login token");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login to store");
    }
  };

  const handleSubscribeStore = () => {
    setShowSubscriptionModal(true);
  };

  const actions = [
    { icon: LogIn, label: "Login to Store", onClick: handleLoginToStore, color: "green" },
    { icon: CreditCard, label: "Subscribe Store", onClick: handleSubscribeStore, color: "blue" },
    { icon: Key, label: "Force Reset Password", onClick: handleForcePasswordReset, color: "indigo" },
    { icon: BarChart, label: "Analytics", onClick: () => window.open(`/dashboard/merchants/analytics/${id}`, "_blank"), color: "purple" },
  ];

  const getStatusConfig = (status: string, planName: string) => {
    if (planName.toLowerCase() === "free") {
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Unsubscribed" };
    }
    switch (status.toLowerCase()) {
      case "subscribed":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Active" };
      case "stopped":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Inactive" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
    }
  };

  const statusConfig = getStatusConfig(status, planName);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card className="relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.01]">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-purple-50/30" />
          
          {/* Hidden Orders Badge */}
          {hasHiddenOrders && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Eye className="w-3 h-3 mr-1" />
                {hiddenOrders}
              </span>
            </div>
          )}

          {/* Actions Dropdown */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ActionDropdown actions={actions} />
          </div>

          <CardContent className="p-0 relative">
            {/* Header Section */}
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Store Logo */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl ring-2 ring-white shadow-md overflow-hidden bg-white">
                    <img
                      src={imageError ? "/logo.png" : storeLogo}
                      alt={storeName}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                  {/* Status Indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    statusConfig.label === "Active" ? "bg-green-500" : statusConfig.label === "Inactive" ? "bg-red-500" : "bg-gray-400"
                  }`} />
                </div>

                {/* Store Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{storeName}</h3>
                      <p className="text-xs text-gray-500 font-medium">@{storeUsername}</p>
                    </div>
                  </div>

                  {/* Status and Plan Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      {statusConfig.label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Building2 className="w-3 h-3 mr-1" />
                      {isTrial ? "Trial" : planName}
                    </span>
                    {isExpired && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Expired
                      </span>
                    )}
                    {renewEnabled && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Auto
                      </span>
                    )}
                    {isExpiringSoon && !isExpired && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse">
                        <Clock className="w-3 h-3 mr-1" />
                        Soon
                      </span>
                    )}
                    {isBeta && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Beta
                      </span>
                    )}
                    {isWebsiteExpired && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <Globe className="w-3 h-3 mr-1" />
                        Web Expired
                      </span>
                    )}
                  </div>

                  {/* Store Status Info */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {/* Setup Status */}
                    {finishedSetup ? (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="font-medium">Setup Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium">Setup Pending</span>
                      </div>
                    )}

                    {/* Days since creation */}
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{daysSinceCreation} days old</span>
                    </div>

                    {/* Days until expiration or expired */}
                    {isExpired ? (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 animate-pulse">
                        <XCircle className="w-3 h-3" />
                        <span className="font-medium">Plan Expired</span>
                      </div>
                    ) : daysUntilExpiration > 0 && daysUntilExpiration <= 7 ? (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-200">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{daysUntilExpiration} days left</span>
                      </div>
                    ) : daysUntilExpiration > 0 ? (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{daysUntilExpiration} days left</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - More Compact */}
            <div className="px-4 pb-3">
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                <StatCard icon={ShoppingBag} value={totalOrders} label="Orders" color="blue" />
                <StatCard icon={Box} value={products} label="Products" color="purple" />
                <StatCard icon={Eye} value={websiteVisits} label="Visits" color="green" />
                <StatCard icon={User} value={totalCustomers} label="Customers" color="pink" />
                <StatCard icon={Users} value={totalEmployees} label="Team" color="orange" />
                <StatCard icon={MapPin} value={localMarkets.length} label="Markets" color="indigo" />
              </div>
            </div>

            {/* Footer Info - Condensed */}
            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <InfoItem
                  icon={Calendar}
                  label="Created"
                  value={createdAt ? new Date(createdAt._seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                />
                <InfoItem
                  icon={Clock}
                  label="Expires"
                  value={new Date(planExpirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  highlight={isExpiringSoon || isExpired}
                />
                <InfoItem
                  icon={Globe}
                  label="Location"
                  value={`${defaultCountry} • ${defaultCurrency}`}
                />
                <InfoItem
                  icon={Wallet}
                  label="VPay"
                  value={`${vPayBalance.toFixed(2)} EGP`}
                  highlight={vPayBalance > 0}
                />
              </div>

              {/* Category, Assigned Sales, and Website - Compact Row */}
              <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-200 gap-2">
                <div className="flex items-center space-x-2">
                  {category && (
                    <div className="flex items-center space-x-1.5 px-2 py-1 bg-white rounded-md border border-gray-200 shadow-sm">
                      <img src={category.icon} alt={category.name} className="w-3 h-3" />
                      <span className="text-xs font-medium text-gray-700">{category.name}</span>
                    </div>
                  )}
                  
                  {/* Assigned Sales Tag */}
                  <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-md border shadow-sm ${
                    assignedSales 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    {assignedSales && assignedSales.avatar ? (
                      <img 
                        src={assignedSales.avatar} 
                        alt={assignedSales.name}
                        className="w-3 h-3 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">
                      {assignedSales ? assignedSales.name : 'Not Assigned'}
                    </span>
                  </div>
                </div>
                
                <a 
                  href={websiteLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition-colors duration-200 text-xs font-medium"
                >
                  <Globe className="w-3 h-3" />
                  <span>Visit</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reset Store Password</h3>
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Enter a new password for this store. The merchant will need to use this password to log in.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordResetSubmit}
                disabled={isResettingPassword}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Subscription Modal */}
      <MerchantModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        storeData={{
          id,
          storeName,
          storeLogo,
          planName,
        }}
        onSubscriptionComplete={async () => {
          // Refresh store data after subscription
          toast.success("Store subscription updated successfully!");
          // You can add a callback here to refresh the merchants list if needed
          // For example: window.location.reload(); or call a refresh function
        }}
      />
    </>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'indigo' | 'pink';
}) {
  const colorConfig = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  };

  const config = colorConfig[color];

  return (
    <div className={`p-2 rounded-lg border ${config.bg} ${config.border} transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center space-x-1.5">
        <Icon className={`w-3 h-3 ${config.text} flex-shrink-0`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{value.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  // Determine color based on label and highlight
  const getHighlightColor = () => {
    if (!highlight) return { icon: 'text-gray-500', text: 'text-gray-900' };

    if (label === 'Expires') {
      return { icon: 'text-red-500', text: 'text-red-600' };
    }
    if (label === 'VPay') {
      return { icon: 'text-emerald-500', text: 'text-emerald-600' };
    }
    return { icon: 'text-blue-500', text: 'text-blue-600' };
  };

  const colors = getHighlightColor();

  return (
    <div className="flex items-center space-x-1.5">
      <Icon className={`w-3 h-3 flex-shrink-0 ${colors.icon}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-xs font-semibold truncate ${colors.text}`}>
          {value}
        </p>
      </div>
    </div>
  );
}