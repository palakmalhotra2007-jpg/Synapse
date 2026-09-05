import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { sampleDocuments } from '@/lib/mockData/documents';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { doc1, doc2 } = body;

    const document1 = doc1 || sampleDocuments[0];
    const document2 = doc2 || sampleDocuments[1] || sampleDocuments[0];

    const comparison = await SynapseAIEngine.compareDocuments(document1, document2);
    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Document Intelligence Processing Error' },
      { status: 500 }
    );
  }
}
