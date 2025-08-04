import { NextRequest, NextResponse } from 'next/server';

// Mock leads data
const mockLeads = [
  {
    id: "f4006bd2-a330-4392-be44-bc3dab3a7081",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-0123",
    company: "Tech Solutions Inc",
    status: "NEW",
    priority: "HIGH",
    source: "website",
    assignedTo: "Sarah Johnson",
    createdAt: { _seconds: 1705312200 },
    updatedAt: { _seconds: 1705312200 },
    attemps: 1,
    lastContactDate: "2024-01-15T10:30:00Z",
    nextFollowUpDate: "2024-01-17T10:30:00Z",
    leadSource: "Website Form",
    websiteUrl: "https://techsolutions.com",
    socialMediaUrls: ["https://linkedin.com/company/techsolutions"],
    feedback: "",
    feedbacks: []
  },
  {
    id: "a2b5c8d9-1234-5678-9abc-def012345678",
    name: "Emma Wilson",
    email: "emma.wilson@startup.com",
    phone: "555-0456",
    company: "Innovation Labs",
    status: "INTERSTED",
    priority: "MEDIUM",
    source: "referral",
    assignedTo: "Mike Chen",
    createdAt: { _seconds: 1705226400 },
    updatedAt: { _seconds: 1705485300 },
    attemps: 2,
    lastContactDate: "2024-01-16T09:15:00Z",
    nextFollowUpDate: "2024-01-18T14:00:00Z",
    leadSource: "Referral",
    websiteUrl: "https://innovationlabs.com",
    socialMediaUrls: ["https://twitter.com/innovationlabs"],
    feedback: "Very interested in our solutions",
    feedbacks: ["Initial contact made", "Very interested in our solutions"]
  },
  {
    id: "c3d6e9f0-2345-6789-bcde-f01234567890",
    name: "David Rodriguez",
    email: "d.rodriguez@enterprise.com",
    phone: "555-0789",
    company: "Global Enterprise Corp",
    status: "SUBSCRIBED",
    priority: "HIGH",
    source: "linkedin",
    assignedTo: "Alex Kim",
    createdAt: { _seconds: 1705140000 },
    updatedAt: { _seconds: 1705471800 },
    attemps: 3,
    lastContactDate: "2024-01-16T11:30:00Z",
    nextFollowUpDate: "2024-01-19T10:00:00Z",
    leadSource: "LinkedIn Campaign",
    websiteUrl: "https://globalenterprise.com",
    socialMediaUrls: ["https://linkedin.com/company/globalenterprise"],
    feedback: "Ready to proceed with demo",
    feedbacks: ["Initial outreach", "Demo scheduled", "Ready to proceed with demo"]
  }
];

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Fetching all leads');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const searchQuery = searchParams.get('searchQuery');

    let filteredLeads = [...mockLeads];

    // Apply status filter
    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    // Return leads directly (not wrapped in pagination object)
    return NextResponse.json(paginatedLeads);
  } catch (error) {
    console.error('❌ API: Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 API: Creating new lead:', body);

    const newLead = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      status: "NEW",
      priority: body.priority || "MEDIUM",
      source: body.source || "manual",
      assignedTo: body.assignedTo || "Unassigned",
      createdAt: { _seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
      attemps: 0,
      lastContactDate: new Date().toISOString(),
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      leadSource: body.leadSource || "Manual Entry",
      websiteUrl: body.websiteUrl || "",
      socialMediaUrls: body.socialMediaUrls || [],
      feedback: "",
      feedbacks: []
    };

    // Add to mock data
    mockLeads.unshift(newLead);

    return NextResponse.json(newLead);
  } catch (error) {
    console.error('❌ API: Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
