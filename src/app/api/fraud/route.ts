import { NextResponse } from 'next/server';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, transactions, documents, document } = body;

    if (action === 'inspect_document' && document) {
      const report = await SynapseAIEngine.analyzeDocumentFraud(document);
      return NextResponse.json({
        success: true,
        report,
      });
    }

    if (action === 'cross_audit') {
      const audit = await SynapseAIEngine.crossAuditLedgerVsDocuments(transactions, documents);
      return NextResponse.json({
        success: true,
        audit,
      });
    }

    const result = await SynapseAIEngine.analyzeFraudDataset(transactions);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Fraud Analysis Processing Error' },
      { status: 500 }
    );
  }
}

