import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, modelId, history, attachedDocuments } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt argument is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const result = await SynapseAIEngine.generateChatResponse(
      prompt,
      modelId || 'synapse-flash-v4',
      history || [],
      attachedDocuments || []
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Synapse AI Error' },
      { status: 500 }
    );
  }
}
