import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactions } = body;
    const result = await SynapseAIEngine.analyzeFraudDataset(transactions);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fraud Analysis Error' }, { status: 500 });
  }
}
