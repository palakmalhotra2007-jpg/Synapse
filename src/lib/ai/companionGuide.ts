'use client';

export interface GuideSection {
  id: string;
  title: string;
  category: string;
  speech: string;
  shortSummary: string;
}

export const SYNAPSE_GUIDE_SECTIONS: Record<string, GuideSection> = {
  // Main Navigation Routes
  '/': {
    id: '/',
    title: 'Executive Command Center',
    category: 'Dashboard',
    speech: 'Welcome to your Synapse Command Center! Here you can monitor cross-department operational metrics, task completions, and recent AI actions.',
    shortSummary: 'Overview of department KPIs, pending tasks, and recent AI actions.',
  },
  '/fraud': {
    id: '/fraud',
    title: 'Omni Fraud Analysis Hub',
    category: 'Security & Risk',
    speech: 'This is the Omni Fraud Analysis module. Here you can inspect high-risk wire anomalies, cross-audit ledger discrepancies, and detect vendor compliance breaches.',
    shortSummary: 'Detect suspicious transactions, ledger anomalies, and vendor contract discrepancies.',
  },
  '/meetings': {
    id: '/meetings',
    title: 'Meeting Intelligence Studio',
    category: 'Audio & MoM',
    speech: 'Meeting Intelligence Studio! I can transcribe executive audio, extract action items, and generate exportable Minutes of Meeting with timestamped designations.',
    shortSummary: 'Transcribe audio recordings, extract action items, and export formatted MoM.',
  },
  '/documents': {
    id: '/documents',
    title: 'Document Intelligence Vault',
    category: 'Document RAG',
    speech: 'Document Intelligence Vault! Upload contracts, invoices, or policies to perform cross-document semantic RAG search and clause extraction.',
    shortSummary: 'Semantic RAG search, audit verification, and key clause extraction across files.',
  },
  '/workspace': {
    id: '/workspace',
    title: 'Enterprise Team Workspace',
    category: 'Collaboration',
    speech: 'Enterprise Team Workspace! Collaborate with department specialists, view shared project repositories, and manage access controls.',
    shortSummary: 'Team project collaboration, shared asset repositories, and role management.',
  },

  // Unified AI Modal Tools
  'chat': {
    id: 'chat',
    title: 'Universal Document RAG & Chat',
    category: 'AI Assistant',
    speech: 'Multi-Modal AI Assistant! Ask me anything about your documents, financial models, executive summaries, or enterprise workflows.',
    shortSummary: 'Ask questions grounded across all indexed documents, policies, and contracts.',
  },
  'image_search': {
    id: 'image_search',
    title: 'Visual Hardware & Inspection',
    category: 'Vision Engine',
    speech: 'Visual Search and Inspection! Drop machine blueprints, hardware boards, or diagrams to identify components and detect anomalies.',
    shortSummary: 'Identify hardware components, circuit pins, and mechanical blueprints.',
  },
  'chart_understanding': {
    id: 'chart_understanding',
    title: 'Chart & Financial Analytics',
    category: 'Vision Analytics',
    speech: 'Vision Chart Understanding! Upload bar graphs, revenue velocity plots, or tables to extract raw figures, trends, and growth metrics.',
    shortSummary: 'Extract tabular data, growth velocity, and summary metrics from graphs.',
  },
  'duplicate_detection': {
    id: 'duplicate_detection',
    title: 'Duplicate & Tamper Detection',
    category: 'Audit & Compliance',
    speech: 'Duplicate Search Engine! Scan document archives and images to flag repeated records, visual duplicates, and version conflicts.',
    shortSummary: 'Detect repeated file uploads, altered signatures, and duplicate submissions.',
  },
};

/**
 * Dispatch a companion guide speech event to trigger real-time voice & speech bubble update
 */
export const dispatchCompanionGuide = (
  keyOrPath: string,
  options?: { speak?: boolean; customTitle?: string; customSpeech?: string; category?: string }
) => {
  if (typeof window === 'undefined') return;

  const section = SYNAPSE_GUIDE_SECTIONS[keyOrPath];
  const payload = {
    key: keyOrPath,
    title: options?.customTitle || section?.title || 'Synapse AI Assistant',
    category: options?.category || section?.category || 'AI Guide',
    speech: options?.customSpeech || section?.speech || 'I am ready to assist you in this workspace section.',
    shortSummary: section?.shortSummary || '',
    speak: options?.speak ?? true,
  };

  window.dispatchEvent(
    new CustomEvent('synapse-companion-guide', {
      detail: payload,
    })
  );
};
