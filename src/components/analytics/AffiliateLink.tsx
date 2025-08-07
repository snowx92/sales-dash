"use client";

import { TargetIcon, Copy } from "lucide-react";

interface AffiliateLinkProps {
  affiliateLink: string;
  onCopyLink: (link: string) => void;
}

export const AffiliateLink = ({ affiliateLink, onCopyLink }: AffiliateLinkProps) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 h-full">
      <div className="flex items-center gap-2 mb-3">
        <TargetIcon className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-purple-900">Affiliate Link</h3>
      </div>
      <div className="bg-white rounded-lg p-3 border border-purple-200">
        <code className="text-xs text-purple-700 break-all block mb-2 line-clamp-2">{affiliateLink}</code>
        <button 
          onClick={() => onCopyLink(affiliateLink)}
          className="w-full h-8 rounded-md px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors inline-flex items-center justify-center gap-2"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
      </div>
    </div>
  );
};
