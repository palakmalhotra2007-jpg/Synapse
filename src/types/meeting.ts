export interface TranscriptUtterance {
  id: string;
  speaker: string;
  avatarColor?: string;
  startTime: string;
  endTime: string;
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  assigneeAvatar?: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  category?: string;
}

export interface MinutesOfMeeting {
  meetingTitle: string;
  date: string;
  duration: string;
  attendees: string[];
  executiveSummary: string;
  agendaTopics: {
    topic: string;
    keyPoints: string[];
    outcomes: string;
  }[];
  keyDecisions: string[];
  actionItems: ActionItem[];
  riskRegister: {
    risk: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
  }[];
}

export interface MeetingSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  mediaType: 'audio' | 'video' | 'transcript_text';
  audioUrl?: string;
  utterances: TranscriptUtterance[];
  mom: MinutesOfMeeting;
}
