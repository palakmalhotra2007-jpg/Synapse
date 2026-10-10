import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MinutesOfMeeting, MeetingSession } from '@/types/meeting';

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

  // Compute text lines with width wrapping (max width 155mm, 20mm left margin)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');

  const splitTitle = doc.splitTextToSize(`Title: ${data.title}`, 155);
  const splitMeta = doc.splitTextToSize(
    `Date: ${data.date}  |  Duration: ${data.duration}  |  Organizer: ${data.organizer || 'Executive Board'}`,
    155
  );
  const splitAttendees = doc.splitTextToSize(`Attendees: ${data.attendees.join(', ')}`, 155);
  const splitSourceUrl = data.sourceUrl ? doc.splitTextToSize(`Source Link: ${data.sourceUrl}`, 155) : [];

  const lineSpacing = 5.0;
  const totalMetaLines = splitTitle.length + splitMeta.length + splitAttendees.length + splitSourceUrl.length;
  const boxHeight = totalMetaLines * lineSpacing + 16;

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

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  doc.text(splitTitle, 20, yPos);
  yPos += splitTitle.length * lineSpacing;

  doc.text(splitMeta, 20, yPos);
  yPos += splitMeta.length * lineSpacing;

  doc.text(splitAttendees, 20, yPos);
  yPos += splitAttendees.length * lineSpacing;

  if (splitSourceUrl.length > 0) {
    doc.setTextColor(14, 165, 233);
    doc.text(splitSourceUrl, 20, yPos);
    doc.setTextColor(15, 23, 42);
    yPos += splitSourceUrl.length * lineSpacing;
  }

  yPos = boxStartY + boxHeight + 10;

  // Executive Summary Box
  if (data.executiveSummary) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 233);
    doc.text('Executive Summary', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(data.executiveSummary, 175);
    doc.text(splitSummary, 15, yPos);
    yPos += splitSummary.length * 4.5 + 8;
  }

  // Agenda Topics
  if (data.agenda && data.agenda.length > 0) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 233);
    doc.text('Agenda & Discussed Topics', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    data.agenda.forEach((item, index) => {
      const splitAgenda = doc.splitTextToSize(`${index + 1}. ${item}`, 175);
      doc.text(splitAgenda, 20, yPos);
      yPos += splitAgenda.length * 4.5 + 1.5;
    });

    yPos += 6;
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
      if (yPos > 250) { doc.addPage(); yPos = 20; }

      const title = typeof decision === 'string' ? decision : decision.title;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const splitTitle = doc.splitTextToSize(`${index + 1}. ${title}`, 170);
      doc.text(splitTitle, 20, yPos);
      yPos += splitTitle.length * 4.5;

      if (typeof decision !== 'string' && decision.outcome) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(5, 150, 105);
        const splitOutcome = doc.splitTextToSize(`Outcome: ${decision.outcome}`, 165);
        doc.text(splitOutcome, 25, yPos);
        yPos += splitOutcome.length * 4.2 + 2;
      }
    });

    yPos += 6;
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
      item.title,
      item.assignee,
      item.deadline,
      item.priority,
      item.status,
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

  const cleanTitle = data.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
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
