export type AIModelId = 'synapse-flash-v4' | 'synapse-pro-reasoning' | 'synapse-vision-multimodal' | 'synapse-financial-analyst';

export interface AIModelSpec {
  id: AIModelId;
  name: string;
  badge: string;
  description: string;
  contextWindow: string;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: AIModelId;
  attachments?: {
    name: string;
    type: string;
    url?: string;
    size?: string;
  }[];
  ragCitations?: {
    documentId: string;
    documentTitle: string;
    snippet: string;
    relevanceScore: number;
    uploadedBy?: string;
    teamName?: string;
  }[];
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  tags: string[];
  pinned?: boolean;
}

export interface SystemPromptPreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'code' | 'summary' | 'finance' | 'creative';
}
