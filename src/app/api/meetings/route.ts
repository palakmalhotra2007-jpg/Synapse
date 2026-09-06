import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { transcriptText, participants } = body;

    const mom = await SynapseAIEngine.processMeetingSession(transcriptText, participants);
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
