export interface SalesTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: 'motivation' | 'strategy' | 'technique' | 'conversion' | 'follow-up';
  color: {
    bg: string;
    text: string;
    border: string;
    gradient: string;
  };
}

export const salesTips: SalesTip[] = [
  // Motivation Tips
  {
    id: 1,
    title: "Every 'No' Gets You Closer to 'Yes'",
    description: "Rejection is part of the journey. Each lead you contact teaches you something new. Keep sharing your affiliate link and building relationships!",
    icon: "💪",
    category: "motivation",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-pink-500"
    }
  },
  {
    id: 2,
    title: "Be a Problem Solver, Not Just a Seller",
    description: "Focus on how Vondera solves merchants' pain points in the MENA region. Show them how easy it is to manage their ecommerce business!",
    icon: "🎯",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 3,
    title: "Follow Up Within 24 Hours",
    description: "Speed matters! Reach out to your leads quickly. The faster you respond, the higher your conversion rate. Set reminders for follow-ups!",
    icon: "⚡",
    category: "follow-up",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 4,
    title: "Share Your Success Stories",
    description: "People trust recommendations from real users. Share case studies of merchants who grew their business with Vondera in your network!",
    icon: "🌟",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 5,
    title: "Target the Right Audience",
    description: "Share your affiliate link in groups where merchants gather: Facebook groups, WhatsApp communities, LinkedIn. Quality over quantity!",
    icon: "🎪",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 6,
    title: "Build Trust Before Selling",
    description: "Connect genuinely with potential merchants. Ask about their challenges, offer free advice. Trust converts better than any sales pitch!",
    icon: "🤝",
    category: "conversion",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 7,
    title: "Highlight Vondera's MENA Advantage",
    description: "Unlike Shopify, Vondera is built for the MENA market with local payment gateways, Arabic support, and regional shipping integrations!",
    icon: "🚀",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 8,
    title: "Consistency is Key",
    description: "Share your affiliate link daily! Post on social media, engage in communities, reach out to contacts. Small daily actions lead to big results!",
    icon: "📈",
    category: "motivation",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 9,
    title: "Use Video to Stand Out",
    description: "Record a quick video showing Vondera's dashboard, features, or your own success. Video content gets 10x more engagement!",
    icon: "🎥",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 10,
    title: "Track Your Leads Daily",
    description: "Check your dashboard every morning! Know your numbers, celebrate small wins, and adjust your strategy based on what's working.",
    icon: "📊",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 11,
    title: "Personalize Every Outreach",
    description: "Don't send generic messages! Mention specific details about their business when sharing your link. Personalization increases conversion by 3x!",
    icon: "✉️",
    category: "conversion",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 12,
    title: "Overcome Objections with Facts",
    description: "Prepare answers to common concerns: pricing, migration from other platforms, features comparison. Be ready with data and case studies!",
    icon: "💡",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 13,
    title: "Your Energy is Contagious",
    description: "Believe in Vondera! Your enthusiasm about the platform will shine through and inspire merchants to try it. Passion sells!",
    icon: "🔥",
    category: "motivation",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 14,
    title: "Create Urgency with Limited Offers",
    description: "When Vondera runs promotions, emphasize the deadline! Limited-time offers create urgency and push leads to convert faster.",
    icon: "⏰",
    category: "conversion",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 15,
    title: "Leverage Social Proof",
    description: "Share screenshots of successful merchants, testimonials, and growth stats. Social proof is one of the most powerful conversion tools!",
    icon: "⭐",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 16,
    title: "Don't Give Up on Warm Leads",
    description: "A lead that didn't convert today might convert next month. Keep nurturing relationships and following up with value, not pressure!",
    icon: "🌱",
    category: "follow-up",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 17,
    title: "Ask for Referrals",
    description: "When a merchant signs up, ask them to refer others! Happy customers are your best salespeople. Make it easy for them to share your link!",
    icon: "🎁",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 18,
    title: "Master the Art of Listening",
    description: "Ask questions and listen to merchants' pain points. When you understand their needs, you can position Vondera as the perfect solution!",
    icon: "👂",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 19,
    title: "Celebrate Small Wins",
    description: "Got a new lead? Celebrate! Closed a sale? Celebrate bigger! Positive reinforcement keeps you motivated and focused on growth!",
    icon: "🎉",
    category: "motivation",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 20,
    title: "Educate, Don't Just Sell",
    description: "Share valuable content about ecommerce trends, tips for merchants, industry insights. Position yourself as an expert, not just a seller!",
    icon: "📚",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 21,
    title: "The Fortune is in the Follow-Up",
    description: "80% of sales happen after the 5th contact! Don't give up after one message. Create a follow-up schedule and stick to it.",
    icon: "📞",
    category: "follow-up",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 22,
    title: "Share Your Link Everywhere",
    description: "Add your Vondera affiliate link to email signature, social bios, WhatsApp status. Make it easy to find you!",
    icon: "🔗",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 23,
    title: "Master the Demo",
    description: "Practice showing Vondera's dashboard until perfect. A smooth, confident demo builds trust and closes deals faster!",
    icon: "🖥️",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 24,
    title: "Start Your Day with Goals",
    description: "Check your dashboard every morning! Know your targets, review leads, and plan your day around revenue goals.",
    icon: "🌅",
    category: "motivation",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 25,
    title: "Use Voice Messages",
    description: "Voice notes feel personal! Record a quick intro to Vondera - it's warmer and builds better connections with leads.",
    icon: "🎤",
    category: "technique",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 26,
    title: "Show the Cost Savings",
    description: "Calculate how much merchants save with Vondera vs competitors. Make the ROI crystal clear in your pitch!",
    icon: "💵",
    category: "conversion",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 27,
    title: "Network with Top Performers",
    description: "Learn from the best sales reps on your team! Share strategies and celebrate wins together.",
    icon: "🤜🤛",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 28,
    title: "Visit Local Businesses",
    description: "Go to local shops, markets, and districts. Face-to-face connections often convert better than online outreach!",
    icon: "🏪",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 29,
    title: "Address Concerns with Empathy",
    description: "When they say 'I'll think about it,' ask 'What's your biggest concern?' and address it genuinely.",
    icon: "❤️",
    category: "conversion",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  },
  {
    id: 30,
    title: "Build a Community",
    description: "Create a WhatsApp group for your merchants! Help them connect and share tips. Happy customers refer more!",
    icon: "👥",
    category: "strategy",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      gradient: "from-purple-400 to-purple-600"
    }
  }
];

/**
 * Get a random sales tip
 */
export function getRandomTip(): SalesTip {
  const randomIndex = Math.floor(Math.random() * salesTips.length);
  return salesTips[randomIndex];
}

/**
 * Get tips by category
 */
export function getTipsByCategory(category: SalesTip['category']): SalesTip[] {
  return salesTips.filter(tip => tip.category === category);
}

/**
 * Get a tip by ID
 */
export function getTipById(id: number): SalesTip | undefined {
  return salesTips.find(tip => tip.id === id);
}
