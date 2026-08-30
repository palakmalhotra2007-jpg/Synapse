import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, modelId, history, attachedDocuments } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt argument is required' }, { status: 400 });
    }

    const result = await SynapseAIEngine.generateChatResponse(
      prompt,
      modelId,
      history,
      attachedDocuments
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal AI Error' }, { status: 500 });
  }
}
