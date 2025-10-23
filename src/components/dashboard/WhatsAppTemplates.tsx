"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Copy, Check, X, Sparkles } from "lucide-react";

interface MessageTemplate {
  id: number;
  name: string;
  category: 'intro' | 'follow-up' | 'demo' | 'pricing' | 'objection' | 'closing';
  message: string;
  variables: string[]; // e.g., ['{name}', '{website}']
}

const templates: MessageTemplate[] = [
  {
    id: 1,
    name: "Initial Outreach",
    category: "intro",
    message: "Hi {name}! 👋 I noticed your business {website} and wanted to share something that could help. Vondera is an ecommerce platform built for MENA merchants like you - it handles orders, shipping, and payments all in one place. Would love to show you how it works! 🚀",
    variables: ['{name}', '{website}']
  },
  {
    id: 2,
    name: "Quick Intro (Short)",
    category: "intro",
    message: "Hey {name}! 😊 I help MENA merchants grow their online stores with Vondera. Can I send you a quick 2-min demo? It's completely free to check out!",
    variables: ['{name}']
  },
  {
    id: 3,
    name: "Follow-Up After No Response",
    category: "follow-up",
    message: "Hi {name}! Just checking back in 😊 Did you get a chance to look at Vondera? I'd love to answer any questions. Many merchants are seeing great results - let me know if you'd like to hear more!",
    variables: ['{name}']
  },
  {
    id: 4,
    name: "Follow-Up After Initial Interest",
    category: "follow-up",
    message: "Hi {name}! 🌟 Following up on our conversation about Vondera. I have some success stories from merchants in your niche that I think you'd find interesting. When's a good time for a quick call?",
    variables: ['{name}']
  },
  {
    id: 5,
    name: "Demo Request",
    category: "demo",
    message: "Great! 🎉 I'd love to show you Vondera's dashboard. It takes just 10 minutes and you'll see exactly how it can help {website}. Are you free for a quick screen share today or tomorrow?",
    variables: ['{website}']
  },
  {
    id: 6,
    name: "Pricing Information",
    category: "pricing",
    message: "Thanks for asking! 💰 Vondera has flexible plans starting from very affordable rates. The best part? You only pay for what you use. Plus, there's a free trial so you can test everything risk-free. Want me to send you the pricing details?",
    variables: []
  },
  {
    id: 7,
    name: "Address Budget Concerns",
    category: "objection",
    message: "I totally understand budget is important! 💵 Here's the thing - Vondera actually saves merchants money by streamlining operations. Most see ROI within the first month. Plus, you can start with the basic plan and scale up as you grow. Would that work for you?",
    variables: []
  },
  {
    id: 8,
    name: "Address 'Already Using Another Platform'",
    category: "objection",
    message: "I hear you! 🤝 Many of our best customers switched from other platforms. The main difference? Vondera is built specifically for MENA - local payment gateways, Arabic support, and regional shipping. Migration is super easy and we help you every step. Worth a look?",
    variables: []
  },
  {
    id: 9,
    name: "Closing - Trial Signup",
    category: "closing",
    message: "Perfect! 🎯 Here's your personalized Vondera signup link: {affiliateLink}\n\nYou'll get full access to try everything free. I'll check in with you in 2 days to see how it's going and answer any questions. Sound good?",
    variables: ['{affiliateLink}']
  },
  {
    id: 10,
    name: "Closing - Create Urgency",
    category: "closing",
    message: "Great news! 🔥 Vondera is running a limited promotion this month - sign up now and get premium features at no extra cost for 3 months! This offer ends soon. Want to jump on it? I can send you the link right now!",
    variables: []
  },
  {
    id: 11,
    name: "Social Proof",
    category: "demo",
    message: "Just so you know, over 5,000+ MENA merchants are already using Vondera! 📈 Businesses like yours are seeing 40% faster order processing and better customer satisfaction. I can share some case studies if you're interested!",
    variables: []
  },
  {
    id: 12,
    name: "Re-engage Cold Lead",
    category: "follow-up",
    message: "Hi {name}! 👋 It's been a while since we last talked. I wanted to reach out because Vondera just launched some amazing new features that I think would be perfect for {website}. Mind if I share a quick update?",
    variables: ['{name}', '{website}']
  }
];

export default function WhatsAppTemplates() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', color: 'bg-gray-100 text-gray-700' },
    { id: 'intro', name: 'Introduction', color: 'bg-blue-100 text-blue-700' },
    { id: 'follow-up', name: 'Follow-Up', color: 'bg-purple-100 text-purple-700' },
    { id: 'demo', name: 'Demo', color: 'bg-green-100 text-green-700' },
    { id: 'pricing', name: 'Pricing', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'objection', name: 'Objections', color: 'bg-orange-100 text-orange-700' },
    { id: 'closing', name: 'Closing', color: 'bg-red-100 text-red-700' }
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleCopy = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.message);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating WhatsApp Templates Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        // Position to stack with other floating buttons (use top offsets to avoid overlap on tall screens)
        className="fixed top-24 right-6 z-40 w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center"
        aria-label="WhatsApp templates"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -left-1">
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </span>
      </motion.button>

      {/* Templates Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-20 z-40 w-96 max-h-[calc(100vh-150px)] overflow-hidden"
          >
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-2xl flex flex-col h-full max-h-[calc(100vh-150px)]">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    <h3 className="font-bold text-lg">WhatsApp Templates</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-green-100 mt-1">Quick message templates for leads</p>
              </div>

              {/* Category Filter */}
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat.id
                          ? cat.color + ' ring-2 ring-offset-1 ring-gray-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates List */}
              <div className="overflow-y-auto flex-1 p-4">
                <div className="space-y-3">
                  {filteredTemplates.map((template, index) => {
                    const categoryData = categories.find(c => c.id === template.category);

                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryData?.color}`}>
                                {categoryData?.name}
                              </span>
                            </div>
                            {template.variables.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {template.variables.map(variable => (
                                  <span key={variable} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {variable}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 leading-relaxed whitespace-pre-line">
                          {template.message}
                        </p>

                        <button
                          onClick={() => handleCopy(template)}
                          className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                            copiedId === template.id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Message
                            </>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-green-100 border-t border-gray-200 flex-shrink-0">
                <p className="text-xs text-gray-700 text-center">
                  💡 Tip: Personalize messages with lead name and website for better response rates
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
