"use client";

import React from "react";
import { 
  Users,
  UserCheck,
  CheckCircle,
  RefreshCw,
  XCircle
} from "lucide-react";
import { Lead } from './types';

interface LeadStatsProps {
  leads: Lead[];
}

export const LeadStats: React.FC<LeadStatsProps> = ({ leads }) => {
  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Subscribed",
      value: leads.filter(lead => lead.status === 'subscribed').length,
      icon: UserCheck,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Interested",
      value: leads.filter(lead => lead.status === 'interested').length,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Follow Up",
      value: leads.filter(lead => lead.status === 'follow_up').length,
      icon: RefreshCw,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Not Interested",
      value: leads.filter(lead => lead.status === 'not_interested').length,
      icon: XCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
