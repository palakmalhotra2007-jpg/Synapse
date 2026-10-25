import { NextResponse } from 'next/server';
import { executeMeetingAIModel } from '@/lib/ai/meetingModelClient';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { transcriptText, participants } = body;

    const mom = await executeMeetingAIModel(transcriptText, participants);
    return NextResponse.json({
      success: true,
      mom,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Meeting MoM Processing Error' },
      { status: 500 }
    );
  }
}
