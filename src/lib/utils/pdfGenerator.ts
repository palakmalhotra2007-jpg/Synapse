import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MinutesOfMeeting, MeetingSession } from '@/types/meeting';
import { DocumentItem } from '@/types/document';

// SANITIZE TEXT FOR JSPDF STANDARD FONTS (ANSI / ASCII ONLY)
export function cleanPdfText(text: string | null | undefined): string {
  if (!text) return '';

  return (
    String(text)
      // Normalize accented / diacritic characters (e.g. ā -> a, é -> e, ñ -> n)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      // Standardize smart quotes and typographic punctuation to safe ASCII equivalents
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Single quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Double quotes
      .replace(/[\u2013\u2014\u2015]/g, '-')       // En/em dashes
      .replace(/\u2026/g, '...')                   // Ellipsis
      .replace(/[\u00A0\u200B\u200C\u200D]/g, ' ') // Non-breaking / zero-width spaces
      // Replace any other non-ASCII characters that corrupt jsPDF font metrics
      .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
      // Clean up multiple spaces
      .replace(/[ \t]+/g, ' ')
      .trim()
  );
}

// 1. MEETING MINUTES PDF REPORT GENERATOR
export function generateMeetingReport(data: {
  title: string;
  date: string;
  duration: string;
  organizer?: string;
  sourceUrl?: string;
  attendees: string[];
  agenda: string[];
  keyDecisions: Array<{ title: string; description?: string; outcome?: string } | string>;
  actionItems: Array<{
    title: string;
    assignee: string;
    deadline: string;
    priority: string;
    status: string;
  }>;
  executiveSummary?: string;
}): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header Banner
  doc.setFontSize(20);
  doc.setTextColor(14, 165, 233); // Sky-500
  doc.setFont('helvetica', 'bold');
  doc.text('MEETING MINUTES REPORT', 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Synapse Enterprise Workspace Intelligence OS', 105, yPos, { align: 'center' });

  yPos += 12;

  // Compute text lines with width wrapping (inner box width 165mm, 20mm left margin)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');

  const cleanTitleStr = cleanPdfText(data.title);
  const cleanMetaStr = cleanPdfText(
    `Date: ${data.date}  |  Duration: ${data.duration}  |  Organizer: ${data.organizer || 'Executive Board'}`
  );
  const cleanAttendeesStr = cleanPdfText(`Attendees: ${data.attendees.join(', ')}`);
  const cleanSourceUrlStr = data.sourceUrl ? cleanPdfText(`Source Link: ${data.sourceUrl}`) : '';

  const splitTitle = doc.splitTextToSize(`Title: ${cleanTitleStr}`, 165);
  const splitMeta = doc.splitTextToSize(cleanMetaStr, 165);
  const splitAttendees = doc.splitTextToSize(cleanAttendeesStr, 165);
  const splitSourceUrl = cleanSourceUrlStr ? doc.splitTextToSize(cleanSourceUrlStr, 165) : [];

  const lineSpacing = 4.8;
  const totalMetaLines = splitTitle.length + splitMeta.length + splitAttendees.length + splitSourceUrl.length;
  const boxHeight = 15 + totalMetaLines * lineSpacing + 6;

  const boxStartY = yPos;
  doc.setDrawColor(14, 165, 233);
  doc.setFillColor(240, 249, 255);
  doc.setLineWidth(0.5);
  doc.rect(15, boxStartY, 180, boxHeight, 'FD');

  yPos += 7;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Meeting Session Details', 20, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  for (const line of splitTitle) {
    doc.text(line, 20, yPos);
    yPos += lineSpacing;
  }

  for (const line of splitMeta) {
    doc.text(line, 20, yPos);
    yPos += lineSpacing;
  }

  for (const line of splitAttendees) {
    doc.text(line, 20, yPos);
    yPos += lineSpacing;
  }

  if (splitSourceUrl.length > 0) {
    doc.setTextColor(14, 165, 233);
    for (const line of splitSourceUrl) {
      doc.text(line, 20, yPos);
      yPos += lineSpacing;
    }
    doc.setTextColor(15, 23, 42);
  }

  yPos = boxStartY + boxHeight + 10;

  // Executive Summary Box
  if (data.executiveSummary) {
    if (yPos > 235) { doc.addPage(); yPos = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 233);
    doc.text('Executive Summary', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(cleanPdfText(data.executiveSummary), 170);
    for (const line of splitSummary) {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 15, yPos);
      yPos += 4.6;
    }
    yPos += 6;
  }

  // Agenda Topics
  if (data.agenda && data.agenda.length > 0) {
    if (yPos > 235) { doc.addPage(); yPos = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 233);
    doc.text('Agenda & Discussed Topics', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    data.agenda.forEach((item, index) => {
      const splitAgenda = doc.splitTextToSize(cleanPdfText(`${index + 1}. ${item}`), 165);
      for (const line of splitAgenda) {
        if (yPos > 275) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 4.6;
      }
      yPos += 1.5;
    });

    yPos += 5;
  }

  // Key Decisions
  if (data.keyDecisions && data.keyDecisions.length > 0) {
    if (yPos > 230) { doc.addPage(); yPos = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text('Key Decisions Logged', 15, yPos);

    yPos += 6;

    data.keyDecisions.forEach((decision, index) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }

      const title = typeof decision === 'string' ? decision : decision.title;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const splitTitle = doc.splitTextToSize(cleanPdfText(`${index + 1}. ${title}`), 165);
      for (const line of splitTitle) {
        if (yPos > 275) { doc.addPage(); yPos = 20; }
        doc.text(line, 20, yPos);
        yPos += 4.6;
      }

      if (typeof decision !== 'string' && decision.outcome) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(5, 150, 105);
        const splitOutcome = doc.splitTextToSize(cleanPdfText(`Outcome: ${decision.outcome}`), 160);
        for (const line of splitOutcome) {
          if (yPos > 275) { doc.addPage(); yPos = 20; }
          doc.text(line, 25, yPos);
          yPos += 4.3;
        }
        yPos += 2;
      }
      yPos += 2;
    });

    yPos += 5;
  }

  // Action Items Table
  if (data.actionItems && data.actionItems.length > 0) {
    if (yPos > 200) { doc.addPage(); yPos = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 233);
    doc.text('Action Deliverables & Task Assignments', 15, yPos);

    yPos += 6;

    const tableData = data.actionItems.map((item) => [
      cleanPdfText(item.title),
      cleanPdfText(item.assignee),
      cleanPdfText(item.deadline),
      cleanPdfText(item.priority),
      cleanPdfText(item.status),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Task Title', 'Owner', 'Deadline', 'Priority', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
      },
    });
  }

  // Footer & Page Numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Synapse Enterprise Intelligence Platform | Page ${i} of ${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }

  const cleanTitle = cleanPdfText(data.title).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  doc.save(`Meeting_Report_${cleanTitle}_${data.date}.pdf`);
}


// 2. FRAUD & RISK AUDIT PDF REPORT GENERATOR
export function generateFraudReport(data: {
  title?: string;
  totalTransactions?: number;
  anomaliesCount?: number;
  flaggedTransactions?: Array<{
    id: string;
    amount: string;
    vendor: string;
    riskScore: number;
    reason: string;
    status?: string;
  }>;
}): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header Banner
  doc.setFontSize(20);
  doc.setTextColor(225, 29, 72); // Rose-600
  doc.setFont('helvetica', 'bold');
  doc.text('FRAUD & FINANCIAL RISK AUDIT REPORT', 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Synapse Security & Financial Anomaly Intelligence Platform', 105, yPos, { align: 'center' });

  yPos += 12;

  // Executive Summary Box
  const boxStartY = yPos;
  doc.setDrawColor(225, 29, 72);
  doc.setFillColor(255, 241, 242);
  doc.setLineWidth(0.5);
  doc.rect(15, boxStartY, 180, 28, 'FD');

  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Telemetry Overview', 20, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Total Ledger Entries Scanned: ${data.totalTransactions || 1420}`, 20, yPos);

  yPos += 5.5;
  doc.setTextColor(225, 29, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(`Flagged Anomaly Transactions: ${data.anomaliesCount || (data.flaggedTransactions?.length || 0)} High-Risk Entries`, 20, yPos);

  yPos = boxStartY + 38;

  // Flagged Transactions Table
  if (data.flaggedTransactions && data.flaggedTransactions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(225, 29, 72);
    doc.text('Flagged Transaction Ledger Logs', 15, yPos);

    yPos += 6;

    const tableData = data.flaggedTransactions.map((tx) => [
      tx.id,
      tx.amount,
      tx.vendor,
      `${tx.riskScore}/100`,
      tx.reason,
      tx.status || 'FLAGGED',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['TXN ID', 'Amount', 'Vendor / Counterparty', 'Risk Score', 'Anomaly Trigger', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [225, 29, 72],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
      },
      alternateRowStyles: {
        fillColor: [255, 241, 242],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 22 },
        4: { cellWidth: 43 },
        5: { cellWidth: 20 },
      },
    });
  }

  // Footer & Page Numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Synapse Fraud Risk Audit | Strictly Confidential | Page ${i} of ${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }

  doc.save(`Fraud_Risk_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// 3. DOCUMENT COMPARISON / DIFF PDF REPORT GENERATOR
export function generateDocumentDiffReport(data: {
  doc1Name: string;
  doc2Name: string;
  similarityScore: number;
  executiveSummary: string;
  differences: Array<{ category: string; originalText: string; modifiedText: string; impact: string }>;
}): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // Indigo-600
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENT CONTRACT COMPARISON REPORT', 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Synapse Contract Intelligence & Legal Diff Engine', 105, yPos, { align: 'center' });

  yPos += 12;

  // Compute wrapped text lines for Document names
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const splitDoc1 = doc.splitTextToSize(`Base Document (A): ${data.doc1Name}`, 155);
  const splitDoc2 = doc.splitTextToSize(`Modified Document (B): ${data.doc2Name}`, 155);

  const lineSpacing = 4.8;
  const boxHeight = (splitDoc1.length + splitDoc2.length + 1) * lineSpacing + 14;

  const boxStartY = yPos;
  doc.setDrawColor(99, 102, 241);
  doc.setFillColor(238, 242, 255);
  doc.setLineWidth(0.5);
  doc.rect(15, boxStartY, 180, boxHeight, 'FD');

  yPos += 7;
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparison Metadata', 20, yPos);

  yPos += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(splitDoc1, 20, yPos);
  yPos += splitDoc1.length * lineSpacing;

  doc.text(splitDoc2, 20, yPos);
  yPos += splitDoc2.length * lineSpacing;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text(`Content Similarity Match: ${data.similarityScore}%`, 20, yPos);

  yPos = boxStartY + boxHeight + 12;

  // Executive Summary
  if (data.executiveSummary) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(99, 102, 241);
    doc.text('Executive Legal Summary', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(data.executiveSummary, 175);
    doc.text(splitSummary, 15, yPos);
    yPos += splitSummary.length * 4.5 + 8;
  }

  // Differences Table
  if (data.differences && data.differences.length > 0) {
    if (yPos > 220) { doc.addPage(); yPos = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(99, 102, 241);
    doc.text('Clause Variance & Modification Audit', 15, yPos);

    yPos += 6;

    const tableData = data.differences.map((diff) => [
      diff.category,
      diff.originalText,
      diff.modifiedText,
      diff.impact,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Document A Clause', 'Document B Modified Clause', 'Legal Impact']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [15, 23, 42],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 255],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25 },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Synapse Document Intelligence | Page ${i} of ${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }

  doc.save(`Contract_Comparison_Diff_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// 4. CHAT HISTORY & WORKSPACE AI PDF REPORT GENERATOR
export function generateChatHistoryReport(data: {
  sessionTitle: string;
  messages: Array<{ role: string; content: string; timestamp: string; modelUsed?: string }>;
}): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(14, 165, 233);
  doc.setFont('helvetica', 'bold');
  doc.text('AI WORKSPACE CHAT & REASONING REPORT', 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Session: "${data.sessionTitle}" | Date: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });

  yPos += 14;

  data.messages.forEach((msg) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const isAi = msg.role === 'assistant';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(isAi ? 14 : 147, isAi ? 165 : 51, isAi ? 233 : 234);
    doc.text(`${isAi ? 'AI Engine' : 'User Query'} [${msg.timestamp}]:`, 15, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    // Strip markdown formatting for clean PDF output
    const cleanText = msg.content.replace(/[\*\_`#]/g, '');
    const splitContent = doc.splitTextToSize(cleanText, 175);
    doc.text(splitContent, 15, yPos);

    yPos += splitContent.length * 4.5 + 6;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Synapse AI Workspace History | Page ${i} of ${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }

  doc.save(`AI_Workspace_Report_${Date.now()}.pdf`);
}

// 5. ENTERPRISE VAULT DOCUMENT PDF GENERATOR
export function generateDocumentPDF(docItem: DocumentItem): void {
  const doc = new jsPDF();
  let yPos = 18;

  // 1. Classification Banner Bar at top
  let badgeColor: [number, number, number] = [16, 185, 129]; // Emerald for UNCLASSIFIED
  let badgeBg: [number, number, number] = [236, 253, 245];
  if (docItem.classification === 'TOP SECRET') {
    badgeColor = [225, 29, 72]; // Rose-600
    badgeBg = [255, 241, 242];
  } else if (docItem.classification === 'CONFIDENTIAL') {
    badgeColor = [217, 119, 6]; // Amber-600
    badgeBg = [254, 243, 199];
  } else if (docItem.classification === 'INTERNAL RESTRICTED') {
    badgeColor = [124, 58, 237]; // Purple-600
    badgeBg = [243, 232, 255];
  }

  // Top banner strip
  doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
  doc.rect(15, 12, 180, 8, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.text(
    `[${docItem.classification}]  •  CLEARANCE: ${docItem.securityLevel.toUpperCase()}  •  VAULT: ${docItem.vaultId.toUpperCase()}`,
    105,
    17.5,
    { align: 'center' }
  );

  yPos = 28;

  // Title
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  const splitTitle = doc.splitTextToSize(cleanPdfText(docItem.name), 170);
  for (const line of splitTitle) {
    doc.text(line, 15, yPos);
    yPos += 6;
  }
  yPos += 2;

  // Platform Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Synapse Role-Isolated Cryptographic Vault Intelligence System', 15, yPos);
  yPos += 8;

  // Metadata Box
  const metaStartY = yPos;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, metaStartY, 180, 28, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Document ID:', 20, metaStartY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanPdfText(docItem.id), 45, metaStartY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Ingested By:', 20, metaStartY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanPdfText(`${docItem.uploadedBy || 'Specialist'} (${docItem.uploadedByEmployeeId || 'EMP-ENG-001'})`), 45, metaStartY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Ingest Date:', 20, metaStartY + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(docItem.uploadedAt).toLocaleString(), 45, metaStartY + 21);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('File Size / Pages:', 115, metaStartY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cleanPdfText(docItem.size)} | ${docItem.pageCount || 1} Pages`, 147, metaStartY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Sensitivity:', 115, metaStartY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${docItem.sensitivityScore ?? 75}/100 Risk Index`, 147, metaStartY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Integrity Status:', 115, metaStartY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('AES-256 Storage Verified', 147, metaStartY + 21);
  doc.setTextColor(71, 85, 105);

  yPos = metaStartY + 35;

  // Executive Summary
  if (docItem.summary) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(14, 165, 233); // Sky-500
    doc.text('Executive Summary', 15, yPos);
    yPos += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(cleanPdfText(docItem.summary), 170);
    for (const line of splitSummary) {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 15, yPos);
      yPos += 4.3;
    }
    yPos += 6;
  }

  // Key Contractual Clauses
  if (docItem.keyClauses && docItem.keyClauses.length > 0) {
    if (yPos > 210) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(14, 165, 233);
    doc.text(`Key Extracted Clauses & Obligations (${docItem.keyClauses.length})`, 15, yPos);
    yPos += 5;

    const clauseRows = docItem.keyClauses.map((c, i) => [
      String(i + 1),
      cleanPdfText(c.type.toUpperCase()),
      cleanPdfText(c.title),
      cleanPdfText(c.pageOrSection),
      cleanPdfText(c.riskLevel),
      cleanPdfText(c.snippet),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Type', 'Clause Title', 'Section', 'Risk', 'Clause Excerpt']],
      body: clauseRows,
      theme: 'grid',
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 22 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15 },
        5: { cellWidth: 75 },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    if (finalY) {
      yPos = finalY + 10;
    }
  }

  // Document Content Payload
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Vault Document Content Payload', 15, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const cleanContent = cleanPdfText(docItem.content || 'Document content securely encrypted in vault.');
  const contentLines = cleanContent.split('\n');
  for (const line of contentLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      yPos += 3;
      continue;
    }
    const isHeading = trimmed.startsWith('SECTION') || trimmed.startsWith('---') || (trimmed.toUpperCase() === trimmed && trimmed.length < 50);
    if (isHeading) {
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }
      yPos += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 165, 233);
      doc.text(trimmed, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      yPos += 5;
    } else {
      const splitText = doc.splitTextToSize(trimmed, 170);
      for (const piece of splitText) {
        if (yPos > 275) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(piece, 15, yPos);
        yPos += 4;
      }
      yPos += 1;
    }
  }

  // Version History Table if versions exist
  if (docItem.versions && docItem.versions.length > 0) {
    if (yPos > 210) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Version History & Audit Log', 15, yPos);
    yPos += 5;

    const versionRows = docItem.versions.map((v) => [
      cleanPdfText(v.version),
      cleanPdfText(v.updatedAt),
      cleanPdfText(`${v.updatedBy} (${v.updatedByEmployeeId})`),
      cleanPdfText(v.size),
      cleanPdfText(v.changeNote),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Version', 'Timestamp', 'Author', 'Size', 'Revision Summary']],
      body: versionRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 25 },
        2: { cellWidth: 45 },
        3: { cellWidth: 18 },
        4: { cellWidth: 74 },
      },
    });
  }

  // Running Header & Footer on all pages
  const totalPages = doc.getNumberOfPages();
  const safeDocName = cleanPdfText(docItem.name);
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (pages 2+)
    if (i > 1) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`SYNAPSE VAULT • ${safeDocName.slice(0, 50)} • [${docItem.classification}]`, 15, 10);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 12, 195, 12);
    }

    // Running Footer
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 283, 195, 283);
    doc.text(
      `Synapse Cryptographic Vault OS | AES-256 Storage Verified | Page ${i} of ${totalPages}`,
      105,
      288,
      { align: 'center' }
    );
  }

  // Ensure filename ends with .pdf
  let exportFileName = safeDocName;
  if (!exportFileName.toLowerCase().endsWith('.pdf')) {
    exportFileName = exportFileName.replace(/\.[^/.]+$/, '') + '.pdf';
  }

  doc.save(exportFileName);
}

// 6. ALL DOCUMENTS CONSOLIDATED BATCH PDF REPORT GENERATOR
export function generateAllDocumentsBatchPDF(docs: DocumentItem[], vaultName: string = 'All Vaults'): void {
  if (!docs || docs.length === 0) return;

  const doc = new jsPDF();
  let yPos = 20;

  // Header Banner
  doc.setFontSize(20);
  doc.setTextColor(14, 165, 233);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNAPSE ENTERPRISE VAULT DOSSIER', 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Comprehensive Repository Index & Audit • ${cleanPdfText(vaultName).toUpperCase()}`, 105, yPos, { align: 'center' });

  yPos += 12;

  // Overview box
  doc.setDrawColor(14, 165, 233);
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(15, yPos, 180, 22, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Indexed Documents: ${docs.length}`, 20, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()} | Security Level: Multi-Tier AES-256`, 20, yPos + 15);

  yPos += 30;

  // Index Table of All Documents
  const tableData = docs.map((d, idx) => [
    String(idx + 1),
    cleanPdfText(d.name),
    cleanPdfText(d.vaultId.toUpperCase()),
    cleanPdfText(d.classification),
    cleanPdfText(d.securityLevel),
    cleanPdfText(d.size),
    cleanPdfText(d.uploadedBy || 'Specialist'),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Document Name', 'Vault', 'Classification', 'Security', 'Size', 'Author']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 55 },
      2: { cellWidth: 22 },
      3: { cellWidth: 28 },
      4: { cellWidth: 27 },
      5: { cellWidth: 15 },
      6: { cellWidth: 25 },
    },
  });

  // Followed by individual document summary sections
  for (const d of docs) {
    doc.addPage();
    let docY = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const splitTitle = doc.splitTextToSize(cleanPdfText(d.name), 170);
    for (const line of splitTitle) {
      doc.text(line, 15, docY);
      docY += 5.5;
    }
    docY += 3;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    doc.text(`ID: ${cleanPdfText(d.id)} | VAULT: ${cleanPdfText(d.vaultId).toUpperCase()} | CLASSIFICATION: ${d.classification} | CLEARANCE: ${d.securityLevel}`, 15, docY);
    docY += 8;

    if (d.summary) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Executive Summary', 15, docY);
      docY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const splitSum = doc.splitTextToSize(cleanPdfText(d.summary), 170);
      for (const line of splitSum) {
        if (docY > 275) { doc.addPage(); docY = 20; }
        doc.text(line, 15, docY);
        docY += 4.2;
      }
      docY += 4;
    }

    if (d.content) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Content Extract', 15, docY);
      docY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const splitContent = doc.splitTextToSize(cleanPdfText(d.content.slice(0, 1500)), 170);
      for (const line of splitContent) {
        if (docY > 275) { doc.addPage(); docY = 20; }
        doc.text(line, 15, docY);
        docY += 3.8;
      }
    }
  }

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Synapse Vault Master Dossier | ${cleanPdfText(vaultName)} | Page ${i} of ${totalPages}`,
      105,
      287,
      { align: 'center' }
    );
  }

  const cleanVault = cleanPdfText(vaultName).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Synapse_Vault_Documents_${cleanVault}_${new Date().toISOString().split('T')[0]}.pdf`);
}

