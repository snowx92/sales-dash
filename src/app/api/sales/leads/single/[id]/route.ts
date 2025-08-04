import { NextRequest, NextResponse } from 'next/server';

// Mock leads data (same as in the main route)
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`📋 API: Fetching single lead with ID: ${id}`);

    const lead = mockLeads.find(l => l.id === id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: lead
    };

    return NextResponse.json(lead);
  } catch (error) {
    console.error('❌ API: Error fetching single lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log(`📝 API: Updating lead ${id} with:`, body);

    const leadIndex = mockLeads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update the lead
    mockLeads[leadIndex] = {
      ...mockLeads[leadIndex],
      ...body,
      updatedAt: { _seconds: Math.floor(Date.now() / 1000) }
    };

    const response = {
      success: true,
      data: mockLeads[leadIndex]
    };

    return NextResponse.json(mockLeads[leadIndex]);
  } catch (error) {
    console.error('❌ API: Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🗑️ API: Deleting lead with ID: ${id}`);

    const leadIndex = mockLeads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Remove the lead
    const deletedLead = mockLeads.splice(leadIndex, 1)[0];

    const response = {
      success: true,
      data: deletedLead
    };

    return NextResponse.json(deletedLead);
  } catch (error) {
    console.error('❌ API: Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
