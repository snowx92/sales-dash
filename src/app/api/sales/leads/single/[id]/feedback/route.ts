import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { feedback } = body;

    console.log(`📝 API: Adding feedback to lead ${id}:`, feedback);

    // Mock response - in a real app, this would save to a database
    const mockResponse = {
      id,
      name: "Sample Lead",
      email: "sample@example.com",
      phone: "555-0123",
      company: "Sample Company",
      status: "NEW",
      priority: "MEDIUM",
      source: "website",
      assignedTo: "Sales Rep",
      createdAt: { _seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
      feedback: feedback,
      attemps: 1,
      lastContactDate: new Date().toISOString(),
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      leadSource: "Website Form",
      websiteUrl: "",
      socialMediaUrls: [],
      feedbacks: [feedback]
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('❌ API: Error adding feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add feedback' },
      { status: 500 }
    );
  }
}
