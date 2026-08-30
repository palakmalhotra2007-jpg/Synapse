import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { doc1, doc2 } = body;
    const comparison = await SynapseAIEngine.compareDocuments(doc1, doc2);
    return NextResponse.json({ comparison });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Document Intelligence Error' }, { status: 500 });
  }
}
