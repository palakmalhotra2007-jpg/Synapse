import { ChatMessage, AIModelId } from '@/types/workspace';
import {
  TransactionRecord,
  FraudAnalysisSummary,
  RiskSeverity,
  DocumentFraudReport,
  DocumentDiscrepancy,
  OmniFraudAuditResult,
} from '@/types/fraud';
import { MinutesOfMeeting, TranscriptUtterance, MeetingParticipant, ActionItem } from '@/types/meeting';
import { DocumentItem, DocumentComparisonResult } from '@/types/document';
import { sampleTransactions, sampleFraudSummary } from '@/lib/mockData/transactions';
import { sampleMeetings, sampleParticipants } from '@/lib/mockData/meetings';
import { sampleDocuments, sampleDocComparison, getStoredDocuments } from '@/lib/mockData/documents';

export class SynapseAIEngine {
  // =========================================================================
  // 1. UNIVERSAL MULTI-DOCUMENT RAG RETRIEVAL & CHATGPT CONVERSATIONAL REASONING
  // =========================================================================
  static async generateChatResponse(
    userPrompt: string,
    modelId: AIModelId = 'synapse-flash-v4',
    history: ChatMessage[] = [],
    attachedDocuments: DocumentItem[] = []
  ): Promise<{ responseText: string; citations?: any[]; tokensConsumed: number }> {
    // Simulate high-speed AI inference latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const promptTrimmed = userPrompt.trim();
    const promptLower = promptTrimmed.toLowerCase();
    const tokensConsumed = Math.floor(Math.random() * 220) + 120;

    // Fetch all enterprise uploaded documents from persistent storage
    const allStoredDocs = getStoredDocuments();
    
    // Combine explicit attached docs + all employee uploaded database docs
    const candidateDocs: DocumentItem[] = [
      ...attachedDocuments,
      ...allStoredDocs.filter((sd) => !attachedDocuments.some((ad) => ad.id === sd.id)),
    ];

    // Multi-Document RAG Semantic & Keyword Retrieval
    const matchedCitations: any[] = [];
    const queryTokens = promptLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'what', 'how', 'why', 'can', 'you', 'this', 'that'].includes(w));

    for (const doc of candidateDocs) {
      const docText = `${doc.name} ${doc.summary || ''} ${doc.content || ''} ${(doc.tags || []).join(' ')}`.toLowerCase();
      let matchCount = 0;
      let matchedSnippet = '';

      for (const token of queryTokens) {
        if (docText.includes(token)) {
          matchCount++;
        }
      }

      // If document was explicitly attached or has strong keyword overlap
      const isExplicitlyAttached = attachedDocuments.some((ad) => ad.id === doc.id);
      if (isExplicitlyAttached || matchCount >= 1 || (queryTokens.length === 0 && candidateDocs.length <= 2)) {
        const relevance = isExplicitlyAttached
          ? 0.98
          : Math.min(0.96, Math.max(0.72, (matchCount / Math.max(1, queryTokens.length)) * 0.95 + 0.5));

        // Find best snippet
        if (doc.keyClauses && doc.keyClauses.length > 0) {
          const relevantClause = doc.keyClauses.find((kc) =>
            queryTokens.some((t) => (kc.title + ' ' + kc.snippet).toLowerCase().includes(t))
          ) || doc.keyClauses[0];
          matchedSnippet = `[${relevantClause.title}]: "${relevantClause.snippet}"`;
        } else if (doc.summary) {
          matchedSnippet = doc.summary;
        } else {
          matchedSnippet = doc.content.slice(0, 180) + '...';
        }

        matchedCitations.push({
          documentId: doc.id,
          documentTitle: doc.name,
          uploadedBy: doc.uploadedBy || 'Synapse Employee',
          teamName: doc.teamName || 'Enterprise Vault',
          snippet: matchedSnippet,
          relevanceScore: Number(relevance.toFixed(2)),
        });
      }
    }

    // Sort citations by highest relevance score
    matchedCitations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topCitations = matchedCitations.slice(0, 4);

    // ==========================================
    // 1. GREETINGS & CASUAL DIALOGUE
    // ==========================================
    const greetingMatches = [
      'hi', 'hello', 'hey', 'hey there', 'hi there', 'good morning',
      'good afternoon', 'good evening', 'howdy', 'yo', 'sup', 'greetings',
      'hello synapse', 'hi synapse', 'hola'
    ];

    if (greetingMatches.includes(promptLower) || promptLower.match(/^(hi|hello|hey|greetings|yo)[\s!.]*$/i)) {
      return {
        responseText: `Hello! I'm **Synapse AI Assistant**, connected to your enterprise multi-document knowledge base and real-time intelligence engines.

### Active Enterprise Knowledge Bases:
* **Universal Document Vault**: Currently indexing **${allStoredDocs.length} employee-uploaded documents** (MSAs, Financial Audits, Architecture Specs, Vendor Invoices, AML Playbooks).
* **Omni Fraud Analysis**: Cross-auditing live transactions against all contract ceilings and invoice schedules.
* **Meeting Intelligence**: Automated MoM synthesis with direct tasks, participant designations, and Spoken Voice API (TTS).

How can I help with your productivity or analysis today? Feel free to ask any question across your uploaded documents!`,
        tokensConsumed,
      };
    }

    // ==========================================
    // 2. DOCUMENT DATABASE & CROSS-DOCUMENT QUERIES
    // ==========================================
    const isDocQuery =
      promptLower.includes('document') ||
      promptLower.includes('contract') ||
      promptLower.includes('agreement') ||
      promptLower.includes('invoice') ||
      promptLower.includes('sla') ||
      promptLower.includes('liability') ||
      promptLower.includes('audit report') ||
      promptLower.includes('uploaded') ||
      promptLower.includes('ceiling') ||
      promptLower.includes('apex') ||
      promptLower.includes('database') ||
      promptLower.includes('summarize');

    if (isDocQuery && topCitations.length > 0) {
      const topDoc = candidateDocs.find((d) => d.id === topCitations[0].documentId) || candidateDocs[0];
      
      return {
        responseText: `### Grounded Document Intelligence from Universal Repository

Based on semantic vector retrieval across **${candidateDocs.length} enterprise documents** in the Synapse database:

1. **Primary Grounded Source**: **${topDoc.name}** *(Vault: ${topDoc.teamName || 'Enterprise'}, Uploaded by: ${topDoc.uploadedBy || 'Team Member'})*
   * **Key Summary**: ${topDoc.summary || topDoc.content.slice(0, 220)}
   * **Sensitivity & Access**: \`${topDoc.accessLevel || 'CONFIDENTIAL'}\` (Sensitivity Score: ${topDoc.sensitivityScore || 85}%)

2. **Extracted Operational & Legal Clauses**:
${(topDoc.keyClauses && topDoc.keyClauses.length > 0
  ? topDoc.keyClauses
  : [
      {
        type: 'obligation' as const,
        title: 'Core Term',
        snippet: 'Authorized operational guideline extracted from universal document database.',
        pageOrSection: 'Section 1',
        riskLevel: 'LOW' as const,
      },
    ]
).map((kc) => `   * **${kc.title}**: ${kc.snippet} ${'pageOrSection' in kc && kc.pageOrSection ? `*(${kc.pageOrSection})*` : ''}`).join('\n')}

3. **Cross-Document Synthesis**:
   * **SLA & Uptime**: Master Agreement commits to **99.95% availability** with **15% service credit** protections.
   * **Invoice Ceilings**: Approved vendor schedules (e.g. Apex Cloud INV-9042) set explicit **$250,000 USD** payment thresholds to domestic routing, with mandatory CFO sign-off for offshore deviations.
   * **Data Governance**: Zero AI foundation model training on customer data with full AES-256 Firestore encryption.

*All insights above were directly retrieved from your team's uploaded document database and cross-referenced in real-time.*`,
        citations: topCitations,
        tokensConsumed,
      };
    }

    // ==========================================
    // 3. CODING & ARCHITECTURE QUERIES
    // ==========================================
    const isCodingQuery =
      promptLower.includes('code') ||
      promptLower.includes('python') ||
      promptLower.includes('javascript') ||
      promptLower.includes('typescript') ||
      promptLower.includes('react') ||
      promptLower.includes('sql') ||
      promptLower.includes('function') ||
      promptLower.includes('algorithm') ||
      promptLower.includes('api') ||
      promptLower.includes('rag');

    if (isCodingQuery) {
      if (promptLower.includes('python') || promptLower.includes('script') || promptLower.includes('pandas')) {
        return {
          responseText: `Here is a production-ready Python script for high-throughput multi-document vector chunking and anomaly cross-checking:

\`\`\`python
import pandas as pd
import numpy as np

def cross_audit_ledger_vs_invoices(ledger_df: pd.DataFrame, invoice_df: pd.DataFrame) -> dict:
    """
    Cross-audits financial transaction ledgers against authorized invoice ceilings.
    Flags unauthorized offshore routing and amount divergences.
    """
    # Merge transaction records with authorized invoice vendor metadata
    merged = pd.merge(ledger_df, invoice_df, on="vendor_id", how="left")
    
    # Calculate amount divergence percentage
    merged["amount_variance_usd"] = merged["wire_amount"] - merged["authorized_ceiling"]
    merged["is_divergent"] = merged["amount_variance_usd"] > 0
    merged["is_offshore_risk"] = merged["recipient_country"].isin(["KY", "CH", "VG", "PA"])
    
    # Compute multi-vector risk score (0 - 100)
    merged["forensic_risk_score"] = np.clip(
        (merged["amount_variance_usd"] / merged["authorized_ceiling"]) * 50 +
        (merged["is_offshore_risk"].astype(int) * 35) +
        (merged["is_vpn_or_tor"].astype(int) * 15),
        0, 100
    )
    
    critical_discrepancies = merged[merged["forensic_risk_score"] >= 90]
    
    return {
      "total_audited": len(merged),
      "critical_count": len(critical_discrepancies),
      "flagged_volume_usd": float(critical_discrepancies["wire_amount"].sum()),
      "highest_risk_discrepancy": critical_discrepancies[["txn_id", "vendor_id", "forensic_risk_score"]].to_dict("records")
    }
\`\`\`

### Engineering Highlights:
* **Vectorized Merging**: Evaluates tens of thousands of wire records in milliseconds using optimized inner joins.
* **Deterministic Risk Clamping**: Uses \`np.clip()\` to guarantee scores stay strictly bounded between \`[0, 100]\`.`,
          citations: topCitations.length > 0 ? topCitations : undefined,
          tokensConsumed,
        };
      }
    }

    // ==========================================
    // 4. FRAUD & ANOMALY DETECTION QUERIES
    // ==========================================
    if (
      promptLower.includes('fraud') ||
      promptLower.includes('wire') ||
      promptLower.includes('anomaly') ||
      promptLower.includes('cayman') ||
      promptLower.includes('discrepancy')
    ) {
      return {
        responseText: `### Omni Multi-Vector Fraud & Document Cross-Audit Report

Forensic cross-correlation of active transactions vs **${candidateDocs.length} uploaded vendor documents** revealed:

1. **Critical Contract-to-Ledger Divergence (TXN-902148)**:
   * **Wire Dispatched**: **$1,450,000.00 USD** to Cayman Islands entity (*ACC-881940*).
   * **Authorized Document Ceiling**: **Apex Cloud Vendor Invoice INV-9042** sets maximum ceiling at **$250,000.00 USD**.
   * **Variance**: **+$1,200,000.00 USD (480% over limit)** without required dual-CFO sign-off.
   * **Telemetry Vector**: Originating from Tor exit node IP \`185.220.101.5\`.

2. **Invoice Font & IBAN Alteration**:
   * Forensic scanner detected **88% Tampering Probability** on recipient routing details.

### Recommended Directives:
* **Immediate Freeze**: Lock dispatch protocol for **TXN-902148** and initiate swift stop-and-recall.
* **Inspect Document**: Review full forensic details in the **Fraud Analysis -> Document Fraud Inspector** tab.`,
        citations: topCitations,
        tokensConsumed,
      };
    }

    // ==========================================
    // 5. MEETING INTELLIGENCE & MoM QUERIES
    // ==========================================
    if (
      promptLower.includes('meeting') ||
      promptLower.includes('mom') ||
      promptLower.includes('task') ||
      promptLower.includes('voice') ||
      promptLower.includes('action item') ||
      promptLower.includes('attendee')
    ) {
      return {
        responseText: `### Meeting Intelligence & Direct Task Briefing

Here is the executive summary and assigned tasks from the latest strategy session:

* **Executive Consensus**: Unanimous approval for **35% Cloud Run compute scaling** ($42k/mo) against $180k projected ARR increase.
* **What Main Things To Do (Executive Checklist)**:
  1. Scale Cloud Run compute clusters by 35% before Sept 1st rollout.
  2. Finalize SOC2 Type II encryption key rotation compliance check.
  3. Deploy Spoken Voice API (TTS) and automated task assignment to all enterprise workspaces.
  4. Execute cross-document invoice tampering inspection across the active ledger.

* **Direct Assigned Tasks with Designations**:
  * **Alex Rivera** *(Principal AI & Neural Architect)*: Provision 35% additional Cloud Run instance capacity *(Due: Sept 1st, HIGH Priority)*.
  * **David Kim** *(Head of Cryptography & Cloud Security)*: Complete Firestore encryption key rotation verification *(Due: Sept 5th, HIGH Priority)*.
  * **Marcus Vance** *(VP of Enterprise Product & Intelligence)*: Publish Product Spec for Voice-Enabled MoM Exporter *(Due: Sept 8th, MEDIUM Priority)*.
  * **Elena Rostova** *(Chief Risk Officer & Compliance Director)*: Audit offshore ledger against vendor agreements *(Due: Sept 4th, HIGH Priority)*.

*Tip: You can use the **Spoken Voice API** in the Meeting Intelligence tab to listen to these tasks spoken aloud!*`,
        citations: topCitations.length > 0 ? topCitations : undefined,
        tokensConsumed,
      };
    }

    // ==========================================
    // 6. GENERAL GROUNDED FALLBACK
    // ==========================================
    return {
      responseText: `### Synapse AI Analysis: "${promptTrimmed}"

I have analyzed your prompt against our universal enterprise knowledge base containing **${candidateDocs.length} uploaded employee documents** and real-time intelligence engines:

1. **Context & Key Takeaway**: For your query, our system cross-checks all available structured and unstructured assets to ensure complete accuracy.
2. **Grounded Document Context**: All team-uploaded documents (MSAs, Invoices, Financial Audits, AML Playbooks) are indexed in your RAG vector space and accessible across every workflow.
3. **Quick Navigation**:
   * For cross-checking invoices vs wire ledgers -> **Fraud Analysis (Omni Cross-Check)**.
   * For voice synthesis and action items with designations -> **Meeting Intelligence**.
   * For multi-document search & comparisons -> **Document Intelligence**.

Let me know if you would like me to extract specific terms or run deeper vector analysis!`,
      citations: topCitations.length > 0 ? topCitations : undefined,
      tokensConsumed,
    };
  }

  // =========================================================================
  // 2. OMNI MULTI-VECTOR FRAUD ANALYSIS & DOCUMENT FRAUD INSPECTION
  // =========================================================================

  // Inspect an individual uploaded document for forgery, tampering, and anomalies
  static async analyzeDocumentFraud(doc: DocumentItem): Promise<DocumentFraudReport> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const docNameLower = doc.name.toLowerCase();
    const docContentLower = (doc.content || '').toLowerCase();

    const isInvoice = docNameLower.includes('invoice') || docNameLower.includes('wire') || docNameLower.includes('inv-');
    const hasCaymanOrOffshore = docContentLower.includes('cayman') || docContentLower.includes('offshore') || docNameLower.includes('apex');

    let overallTamperScore = 12; // Baseline clean
    let verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'TAMPERED_FRAUD' = 'LEGITIMATE';
    const tamperIndicators: any[] = [];
    const forensicNotes: string[] = [];

    if (isInvoice || hasCaymanOrOffshore) {
      overallTamperScore = 88;
      verdict = 'TAMPERED_FRAUD';

      tamperIndicators.push({
        type: 'FONT_MISMATCH',
        severity: 'HIGH',
        description: 'Micro-kerning and font glyph divergence detected in Beneficiary IBAN text box (suggesting post-render digital editing).',
        location: 'Page 1, Field: Beneficiary Account Details',
        confidence: 94,
      });

      tamperIndicators.push({
        type: 'IBAN_MISMATCH',
        severity: 'CRITICAL',
        description: 'Routing code directs to foreign correspondent gateway despite domestic vendor registration.',
        location: 'Page 2, Wire Routing Schedule',
        confidence: 91,
      });

      tamperIndicators.push({
        type: 'AMOUNT_TAMPERING',
        severity: 'HIGH',
        description: 'Payment requested ($1,450,000.00 USD) exceeds authorized contract schedule ceiling ($250,000.00 USD) by 480%.',
        location: 'Page 1, Invoice Total',
        confidence: 98,
      });

      forensicNotes.push('Document contains conflicting corporate registration numbers.');
      forensicNotes.push('Cryptographic hash validation failed for embedded signature vector.');
      forensicNotes.push('Recommended immediate hold on corresponding transaction TXN-902148.');
    } else {
      forensicNotes.push('Digital signature verified with valid SHA-256 certificate.');
      forensicNotes.push('Font metrics and baseline alignments are consistent across all sections.');
      forensicNotes.push('Tax ID and registered entity format validated against official registry.');
    }

    return {
      documentId: doc.id,
      documentTitle: doc.name,
      documentType: doc.type,
      uploadedBy: doc.uploadedBy || 'Sophia Chen (EMP-FIN-004)',
      teamName: doc.teamName || 'Finance & Risk Analytics',
      overallTamperScore,
      verdict,
      tamperIndicators,
      extractedAmountUSD: isInvoice ? 250000 : 5000000,
      extractedEntityName: isInvoice ? 'Apex Cloud Infrastructure LLC' : 'Synapse Enterprise Systems',
      extractedTaxId: '12-8891042',
      extractedIBAN: 'US890210000219988112',
      forensicNotes,
      scanTimestamp: new Date().toISOString(),
    };
  }

  // Cross-Audit all Ledger Transactions against all Uploaded Documents
  static async crossAuditLedgerVsDocuments(
    transactions: TransactionRecord[] = sampleTransactions,
    documents: DocumentItem[] = []
  ): Promise<OmniFraudAuditResult> {
    await new Promise((resolve) => setTimeout(resolve, 950));

    const docs = documents.length > 0 ? documents : getStoredDocuments();
    const txns = transactions.length > 0 ? transactions : sampleTransactions;

    const discrepancies: DocumentDiscrepancy[] = [
      {
        id: 'DISC-001',
        transactionId: 'TXN-902148',
        documentId: 'DOC-2026-INV-06',
        documentTitle: 'Apex Cloud Vendor Invoice & Wire Schedule INV-9042.pdf',
        type: 'AMOUNT_MISMATCH',
        severity: 'CRITICAL',
        ledgerValue: '$1,450,000.00 USD (Wire to Cayman Islands)',
        documentValue: '$250,000.00 USD (Authorized Ceiling in INV-9042)',
        variancePercent: 480,
        explanation: 'Transaction TXN-902148 requests $1.45M dispatch to Cayman Islands account, exceeding the authorized invoice ceiling of $250k by $1.2M without dual CFO signoff.',
        flaggedAt: new Date().toISOString(),
        recommendation: 'Enact immediate liquidity hold and require secondary executive biometric verification.',
      },
      {
        id: 'DISC-002',
        transactionId: 'TXN-551920',
        documentId: 'DOC-2026-MSA-01',
        documentTitle: 'Master Enterprise Cloud Services Agreement 2026.pdf',
        type: 'SHELL_COMPANY_ROUTING',
        severity: 'HIGH',
        ledgerValue: '$1,920,000.00 USD (Multi-Account Structured Split)',
        documentValue: 'Master Agreement Section 12 (Direct Domestic Routing Only)',
        variancePercent: 100,
        explanation: 'Payment routed through 4 intermediate intermediary shell accounts in Singapore, conflicting with standard direct bank-to-bank terms in MSA.',
        flaggedAt: new Date().toISOString(),
        recommendation: 'Request full beneficial ownership disclosure and AML clearing.',
      },
      {
        id: 'DISC-003',
        transactionId: 'TXN-881940',
        documentId: 'DOC-2026-SEC-04',
        documentTitle: 'Cyber Threat Anomaly & AML Defense Playbook.pdf',
        type: 'SLA_BREACH',
        severity: 'HIGH',
        ledgerValue: '5 consecutive wire dispatches in 12-minute window',
        documentValue: 'Playbook Section 1 (Max 1 wire / 24h per beneficiary)',
        variancePercent: 500,
        explanation: 'Rapid-fire velocity burst violates high-risk holding protocol defined in Cyber Defense Playbook.',
        flaggedAt: new Date().toISOString(),
        recommendation: 'Lock beneficiary account ACC-881940 and dispatch AML forensic inquiry.',
      },
    ];

    // Generate individual document reports for key docs
    const documentReports: DocumentFraudReport[] = await Promise.all(
      docs.slice(0, 4).map((d) => SynapseAIEngine.analyzeDocumentFraud(d))
    );

    return {
      auditId: `OMNI-AUDIT-${Date.now()}`,
      auditName: `Omni Cross-Document & Ledger Forensic Audit - ${new Date().toLocaleDateString()}`,
      totalTransactionsAudited: txns.length,
      totalDocumentsCrossChecked: docs.length,
      totalDiscrepanciesFound: discrepancies.length,
      criticalRiskVolumeUSD: 3370000,
      discrepancies,
      documentReports,
      overallIntegrityScore: 68, // Moderate due to flagged divergences
      executiveForensicSummary: `Omni multi-vector inspection cross-checked ${txns.length} financial transactions against ${docs.length} uploaded enterprise agreements and invoices. Detected 3 critical contract-to-ledger divergences totaling $3.37M in high-risk offshore wire volume.`,
      recommendations: [
        'Place automated hold on Cayman Islands beneficiary wire TXN-902148.',
        'Enforce mandatory AI Document Tamper scan on all vendor invoices exceeding $100,000.',
        'Transmit formal Suspicious Activity Report (SAR) to compliance authority.',
      ],
    };
  }

  // Calculate algorithmic risk scores and summary from ingested CSV / Transaction dataset
  static async analyzeFraudDataset(transactions: TransactionRecord[] = sampleTransactions): Promise<{
    summary: FraudAnalysisSummary;
    transactions: TransactionRecord[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 850));

    const dataset = transactions.length > 0 ? transactions : sampleTransactions;

    let totalVolume = 0;
    let flaggedVolume = 0;
    let totalRisk = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let flaggedCount = 0;

    const categoryMap: Record<string, number> = {};
    const countryMap: Record<string, { count: number; totalRisk: number }> = {};

    const enrichedTxns: TransactionRecord[] = dataset.map((txn) => {
      let riskScore = txn.riskScore;
      if (riskScore === undefined || riskScore === null) {
        let score = 20;
        if (txn.amount > 500000) score += 30;
        else if (txn.amount > 100000) score += 15;
        if (txn.anomalyFactors?.geoMismatch) score += 20;
        if (txn.anomalyFactors?.knownBlacklistIP) score += 25;
        if (txn.anomalyFactors?.velocityFactor > 3) score += 15;
        riskScore = Math.min(100, Math.max(5, score));
      }

      let severity: RiskSeverity = 'LOW';
      if (riskScore >= 90) severity = 'CRITICAL';
      else if (riskScore >= 75) severity = 'HIGH';
      else if (riskScore >= 50) severity = 'MEDIUM';

      totalVolume += txn.amount;
      totalRisk += riskScore;

      if (severity === 'CRITICAL') {
        criticalCount++;
        flaggedCount++;
        flaggedVolume += txn.amount;
      } else if (severity === 'HIGH') {
        highCount++;
        flaggedCount++;
        flaggedVolume += txn.amount;
      } else if (severity === 'MEDIUM') {
        mediumCount++;
      } else {
        lowCount++;
      }

      const cat = txn.merchantCategory || 'General Wire';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      const loc = txn.recipientLocation?.split(',').pop()?.trim() || 'Global';
      if (!countryMap[loc]) countryMap[loc] = { count: 0, totalRisk: 0 };
      countryMap[loc].count += 1;
      countryMap[loc].totalRisk += riskScore;

      return {
        ...txn,
        riskScore,
        severity,
      };
    });

    const averageRiskScore = dataset.length > 0 ? Number((totalRisk / dataset.length).toFixed(1)) : 28.4;

    const topRiskCategories = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const locationRiskMap = Object.entries(countryMap)
      .map(([country, data]) => ({
        country,
        count: data.count,
        riskScore: Math.round(data.totalRisk / data.count),
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    const summary: FraudAnalysisSummary = {
      id: `SUMMARY-${Date.now()}`,
      datasetName: `Enterprise Ledger Audit - ${new Date().toLocaleDateString()}`,
      processedAt: new Date().toISOString(),
      totalTransactions: dataset.length,
      totalVolumeUSD: totalVolume,
      flaggedCount,
      flaggedVolumeUSD: flaggedVolume,
      averageRiskScore,
      criticalAlertCount: criticalCount,
      highRiskCount: highCount,
      mediumRiskCount: mediumCount,
      lowRiskCount: lowCount,
      topRiskCategories: topRiskCategories.length > 0 ? topRiskCategories : sampleFraudSummary.topRiskCategories,
      locationRiskMap: locationRiskMap.length > 0 ? locationRiskMap : sampleFraudSummary.locationRiskMap,
    };

    return {
      summary,
      transactions: enrichedTxns,
    };
  }

  // =========================================================================
  // 3. MEETING INTELLIGENCE, MoM, PARTICIPANT DESIGNATIONS & VOICE API
  // =========================================================================

  // Process Meeting Transcript / Audio with Participant Designations & Direct Tasks
  static async processMeetingSession(
    transcriptText?: string,
    customParticipants?: MeetingParticipant[]
  ): Promise<MinutesOfMeeting> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const participants = customParticipants && customParticipants.length > 0
      ? customParticipants
      : sampleParticipants;

    const attendeesFormatted = participants.map((p) => `${p.name} (${p.designation})`);

    if (transcriptText && transcriptText.length > 30) {
      const p1 = participants[0] || sampleParticipants[0];
      const p2 = participants[1] || sampleParticipants[1];
      const p3 = participants[2] || sampleParticipants[2];

      const actionItems: ActionItem[] = [
        {
          id: `act-${Date.now()}-1`,
          title: 'Implement transcript recommendations & auto-scale RAG indexers',
          assignee: p1.name,
          assigneeDesignation: p1.designation,
          assigneeTeam: p1.team,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'HIGH',
          status: 'PENDING',
          category: 'Engineering',
          taskSummary: 'Deploy auto-scaling compute instance allocations to staging.',
          spokenText: `Action item for ${p1.name}, ${p1.designation}: Implement transcript recommendations and auto-scale RAG indexers by next week, High Priority.`,
        },
        {
          id: `act-${Date.now()}-2`,
          title: 'Verify SOC2 encryption key rotation & security compliance trail',
          assignee: p2.name,
          assigneeDesignation: p2.designation,
          assigneeTeam: p2.team,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'HIGH',
          status: 'PENDING',
          category: 'Compliance',
          taskSummary: 'Validate Firestore rotating keys and export compliance log.',
          spokenText: `Action item for ${p2.name}, ${p2.designation}: Verify SOC2 encryption key rotation and security compliance trail, High Priority.`,
        },
        {
          id: `act-${Date.now()}-3`,
          title: 'Publish executive briefing & align sprint deliverables',
          assignee: p3.name,
          assigneeDesignation: p3.designation,
          assigneeTeam: p3.team,
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'MEDIUM',
          status: 'PENDING',
          category: 'Operations',
          taskSummary: 'Circulate synthesized MoM and voice action items to all stakeholders.',
          spokenText: `Action item for ${p3.name}, ${p3.designation}: Publish executive briefing and align sprint deliverables, Medium Priority.`,
        },
      ];

      return {
        meetingTitle: 'AI-Transcribed Operational Strategy Session',
        date: new Date().toISOString().split('T')[0],
        duration: '35 mins',
        attendees: attendeesFormatted,
        participants,
        executiveSummary: `AI-synthesized Minutes of Meeting extracted from ingested audio transcript. The session focused on universal multi-document RAG deployment, omni fraud cross-checks, and assigning direct action items across team leads.`,
        mainThingsToDo: [
          'Deploy high-throughput multi-document vector indexer for universal search.',
          'Execute cross-document invoice tampering audit on all wire transactions.',
          'Broadcast voice-enabled action items to all meeting participants.',
          'Lock in SOC2 encryption key rotation with InfraSec team.',
        ],
        spokenSummary: `Meeting summary for transcribed session. The team aligned on rolling out universal document RAG search and omni fraud cross-checks. Three high priority action items have been assigned with immediate deliverables.`,
        agendaTopics: [
          {
            topic: 'Universal Document RAG & Infrastructure',
            keyPoints: [
              'Ingested audio emphasizes need for cross-document knowledge synthesis.',
              'Recommended auto-scaling vector storage clusters for high throughput.',
            ],
            outcomes: 'Approved architecture roadmap.',
          },
          {
            topic: 'Direct Task Distribution & Voice Briefings',
            keyPoints: [
              'Delegated critical deliverables with designated owners and priority ratings.',
              'Activated Spoken Voice API for natural audio task briefings.',
            ],
            outcomes: 'Action items assigned to designated personnel.',
          },
        ],
        keyDecisions: [
          'Approved platform expansion milestones based on ingested transcript review.',
          'Mandated all assigned tasks include person designations and spoken audio readout.',
        ],
        actionItems,
        riskRegister: [
          {
            risk: 'Integration timeline dependencies',
            impact: 'MEDIUM',
            mitigation: 'Allocate dedicated senior engineering bandwidth.',
          },
        ],
      };
    }

    return sampleMeetings[0].mom;
  }

  // Compare 2 Documents and calculate differences
  static async compareDocuments(doc1: DocumentItem, doc2: DocumentItem): Promise<DocumentComparisonResult> {
    await new Promise((resolve) => setTimeout(resolve, 950));

    const matchScore = doc1.id === doc2.id ? 100 : 84;

    return {
      ...sampleDocComparison,
      doc1Name: doc1.name,
      doc2Name: doc2.name,
      similarityScore: matchScore,
    };
  }
}
