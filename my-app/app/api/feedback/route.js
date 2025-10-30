import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Here you can add your logic to:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with your preferred service

    // For now, we'll just console.log the feedback
    console.log('Feedback received:', { name, email, subject, message });

    // Return success response
    return NextResponse.json({
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}