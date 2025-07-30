import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, Package, Users, Truck, Building2, 
  CreditCard, Store, Calendar, Clock, 
  PersonStanding, Star, AlertCircle,
  CreditCard as VisaIcon, CheckCircle2, Tag, UserCircle,
  AlertTriangle
} from "lucide-react";
import { isWithinInterval, differenceInDays } from 'date-fns';
import { MerchantModal } from './MerchantModal';



export interface StoreInfoPanelProps {
  storeData: {
    id: string;
    name: string;
    logo: string;
    isActive: boolean;
    finishedSetup: boolean;
    createDate: string;
    lastActiveTime: string;
    planName: string;
    isTrial: boolean;
    renewEnabled: boolean;
    connectedvisa: boolean;
    hiddenOrders: boolean;
    lastSubscriptionDate: string;
    expirePlanDate: string;
    createdFrom: string;
    mainCountry: string;
    currency: string;
    businessPhone: string;
    businessAddress: string;
    storeCategory: {
      name: string;
      icon: string;
    };
    owner: {
      name: string;
      phone: string;
      email: string;
      profilePic: string;
      isOnline: boolean;
    };
    metrics: {
      totalProducts: number;
      totalCategories: number;
      totalEmployees: number;
      totalCouriers: number;
      totalStorefronts: number;
      totalCustomer: number;
      activePaymentGateway: string;
      Courier: string;
    };
    achievements: {
      streak: number;
      totalSpent: string;
      isTop50: boolean;
      isHot: boolean;
    };
  }
}
  
const StoreInfoPanel: React.FC<StoreInfoPanelProps> = ({ storeData }) => {
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);


  const getStatusLabel = () => {
    // If it's a trial plan, show Free Trial
    if (storeData.planName === "Free" && storeData.isTrial) {
      return (
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          <Star className="w-4 h-4" />
          <span>Free Trial</span>
        </div>
      );
    }

    // If plan is not free and renew is enabled, show Subscribe
    if (storeData.planName !== "Free" && storeData.renewEnabled) {
      return (
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          <CreditCard className="w-4 h-4" />
          <span>Subscribe</span>
        </div>
      );
    }

    // If Visa is connected, show Connected Visa
    if (storeData.connectedvisa) {
      return (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          <VisaIcon className="w-4 h-4" />
          <span>Connected Visa</span>
        </div>
      );
    }


  };

  const isExpirationNear = (expireDate: string) => {
    const expire = new Date(expireDate);
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    return isWithinInterval(expire, { start: now, end: fiveDaysFromNow });
  };

  const showExpirationWarning = isExpirationNear(storeData.expirePlanDate);
  const daysUntilExpiration = differenceInDays(new Date(storeData.expirePlanDate), new Date());
  const progress = Math.min((daysUntilExpiration / 5) * 100, 100);

  const handleSubscriptionComplete = async () => {
    // Refresh the store data after subscription is completed
    // This will be handled by the parent component
    setIsMerchantModalOpen(false);
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <Image 
                src={storeData.logo} 
                alt="Store Logo" 
                className="rounded-lg border-2 border-gray-200" 
                width={80} 
                height={80} 
              />
              <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${storeData.isActive ? 'bg-green-500' : 'bg-red-500'} border-2 border-white`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{storeData.name}</h2>
                {getStatusLabel()}
                {storeData.finishedSetup && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setup Complete</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Image 
                  src={storeData.storeCategory.icon} 
                  alt="Category" 
                  width={20} 
                  height={20} 
                  className="rounded-full"
                />
                <span>{storeData.storeCategory.name}</span>
              </div>
              
              {/* Plan and Status Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-md border border-blue-200">
                  {storeData.planName}
                </span>
                {storeData.hiddenOrders && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-md border border-yellow-200">
                    Hidden Orders
                  </span>
                )}
                {showExpirationWarning && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-md border border-orange-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Expires Soon
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Plan & Subscription Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Plan Information
                </CardTitle>
              </CardHeader>
              <CardContent >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan Type</p>
                    <p className="font-medium">{storeData.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auto Renewal</p>
                    <p className="font-medium">{storeData.renewEnabled ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Date</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {storeData.lastSubscriptionDate}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiration Date</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      showExpirationWarning 
                        ? "bg-red-50 text-red-700 border border-red-100" 
                        : "bg-green-50 text-green-700 border border-green-100"
                    }`}>
                      {storeData.expirePlanDate}
                    </div>
                  </div>
                </div>

                {showExpirationWarning && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-red-50 border border-red-200 rounded-md p-3 mt-3"
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <div>
                        <p className="font-medium text-red-700">Your plan is expiring soon!</p>
                        <p className="text-sm text-red-600">Renew now to avoid service interruption.</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={progress} className="h-2 bg-red-200" />
                      <p className="text-xs text-red-600 mt-1">{daysUntilExpiration} days remaining</p>
                    </div>
                  </motion.div>
                )}

                <div className="pt-2">
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => setIsMerchantModalOpen(true)}
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="w-5 h-5 mr-2" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src={storeData.owner.profilePic} />
                    <AvatarFallback>{storeData.owner.name ? storeData.owner.name.charAt(0) : "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{storeData.owner.name}</p>
                    <div className="flex items-center text-sm">
                      <span
                        className={`w-2 h-2 rounded-full mr-1 ${storeData.owner.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                      ></span>
                      <span className="text-muted-foreground">{storeData.owner.isOnline ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{storeData.owner.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 text-muted-foreground">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>{storeData.owner.email || 'No email available'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Last active: </span>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100 ml-2">
                      {storeData.lastActiveTime}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Store created: </span>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 ml-2">
                      {storeData.createDate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Store Metrics */}
          <div className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard icon={<Package className="w-6 h-6" />} label="Products" value={storeData.metrics.totalProducts} color="bg-purple-500" />
              <MetricCard icon={<Building2 className="w-6 h-6" />} label="Categories" value={storeData.metrics.totalCategories} color="bg-purple-500" />
              <MetricCard icon={<Users className="w-6 h-6" />} label="Employees" value={storeData.metrics.totalEmployees} color="bg-purple-500" />
              <MetricCard icon={<Truck className="w-6 h-6" />} label="Couriers" value={storeData.metrics.totalCouriers} color="bg-purple-500" />
              <MetricCard icon={<Store className="w-6 h-6" />} label="Storefronts" value={storeData.metrics.totalStorefronts} color="bg-purple-500" />
              <MetricCard icon={<PersonStanding className="w-6 h-6" />} label="Customers" value={storeData.metrics.totalCustomer} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </CardContent>

      <MerchantModal
        isOpen={isMerchantModalOpen}
        onClose={() => setIsMerchantModalOpen(false)}
        storeData={{
          id: storeData.id,
          storeName: storeData.name,
          storeLogo: storeData.logo,
          planName: storeData.planName,
          currentOrders: storeData.metrics.totalProducts,
          ordersLimit: 1000 // You might want to get this from your API
        }}
        onSubscriptionComplete={handleSubscriptionComplete}
      />
    </Card>
  );
};

// Metric Card Component
const MetricCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
  >
    <div className={`${color} text-white rounded-full w-10 h-10 flex items-center justify-center mb-2`}>
      {icon}
    </div>
    <p className="text-gray-800 font-bold text-xl">{value}</p>
    <p className="text-gray-500 text-sm">{label}</p>
  </motion.div>
);



export default StoreInfoPanel;