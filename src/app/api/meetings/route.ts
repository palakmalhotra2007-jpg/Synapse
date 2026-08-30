import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcriptText } = body;
    const mom = await SynapseAIEngine.processMeetingSession(transcriptText);
    return NextResponse.json({ mom });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Meeting Processing Error' }, { status: 500 });
  }
}
