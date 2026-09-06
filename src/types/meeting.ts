export interface MeetingParticipant {
  id: string;
  name: string;
  designation: string;
  team: string;
  department?: string;
  employeeId?: string;
  avatar?: string;
}

export interface TranscriptUtterance {
  id: string;
  speaker: string;
  speakerDesignation?: string;
  avatarColor?: string;
  startTime: string;
  endTime: string;
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  assigneeDesignation?: string;
  assigneeTeam?: string;
  assigneeAvatar?: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  category?: string;
  taskSummary?: string;
  spokenText?: string;
}

export interface MinutesOfMeeting {
  meetingTitle: string;
  date: string;
  duration: string;
  attendees: string[]; // Names or formatted string list
  participants?: MeetingParticipant[]; // Structured participants with designations
  executiveSummary: string;
  mainThingsToDo: string[]; // Direct high-priority checklist items
  spokenSummary?: string; // Natural speech text for Voice API readout
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
  participants?: MeetingParticipant[];
  utterances: TranscriptUtterance[];
  mom: MinutesOfMeeting;
}

