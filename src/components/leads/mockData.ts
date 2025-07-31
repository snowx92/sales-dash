import { Lead, UpcomingLead } from './types';

// Mock leads data
export const mockLeads: Lead[] = [
  {
    id: 1,
    name: "Ahmed Hassan",
    phone: "+20 123 456 7890",
    email: "ahmed@example.com",
    website: "https://ahmedstore.com",
    socialUrls: "https://instagram.com/ahmedstore",
    leadSource: "instagram",
    priority: "high",
    status: "interested",
    attempts: 3,
    lastContact: "2024-01-15",
    feedback: "Interested in Pro plan",
    createdAt: "2024-01-10",
    feedbackHistory: [
      { id: 1, message: 'Initial call made, very interested', date: '2024-01-10' },
      { id: 2, message: 'Sent Pro plan details', date: '2024-01-12' },
      { id: 3, message: 'Demo scheduled for next week', date: '2024-01-15' }
    ]
  },
  {
    id: 2,
    name: "Sarah Mohamed",
    phone: "+20 987 654 3210",
    email: "sarah@business.com",
    website: "https://sarahfashion.com",
    socialUrls: "https://facebook.com/sarahfashion",
    leadSource: "facebook",
    priority: "mid",
    status: "follow_up",
    attempts: 1,
    lastContact: "2024-01-14",
    feedback: "Needs to discuss with team",
    createdAt: "2024-01-12",
    feedbackHistory: [
      { id: 1, message: 'First contact, needs team approval', date: '2024-01-12' },
      { id: 2, message: 'Follow up scheduled for next week', date: '2024-01-14' }
    ]
  },
  {
    id: 3,
    name: "Omar Ali",
    phone: "+20 555 123 4567",
    email: "omar@tech.com",
    website: "https://omartech.com",
    socialUrls: "https://tiktok.com/@omartech",
    leadSource: "tiktok",
    priority: "low",
    status: "not_interested",
    attempts: 2,
    lastContact: "2024-01-13",
    feedback: "Already has another website solution",
    createdAt: "2024-01-11",
    feedbackHistory: [
      { id: 1, message: 'Called, has existing solution', date: '2024-01-11' },
      { id: 2, message: 'Sent comparison features', date: '2024-01-13' }
    ]
  }
];

// Mock upcoming leads data
export const mockUpcomingLeads: UpcomingLead[] = [
  {
    id: 101,
    name: "Fatima Al-Zahra",
    phone: "+20 111 222 3333",
    email: "fatima@newbusiness.com",
    website: "https://fatimashop.com",
    socialUrls: "https://instagram.com/fatimashop",
    leadSource: "instagram",
    priority: "high",
    createdAt: "2024-01-20"
  },
  {
    id: 102,
    name: "Mohamed Nasser",
    phone: "+20 444 555 6666",
    email: "mohamed@startup.com",
    website: "https://mohamedbiz.com",
    socialUrls: "https://facebook.com/mohamedbiz",
    leadSource: "facebook",
    priority: "mid",
    createdAt: "2024-01-19"
  },
  {
    id: 103,
    name: "Layla Hassan",
    phone: "+20 777 888 9999",
    email: "layla@creative.com",
    website: "https://layladesigns.com",
    socialUrls: "https://tiktok.com/@layladesigns",
    leadSource: "web_scraping",
    priority: "low",
    createdAt: "2024-01-18"
  }
];
