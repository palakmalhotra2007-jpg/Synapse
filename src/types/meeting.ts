export interface MeetingParticipant {
  id: string;
  name: string;
  designation: string;
  team: string;
  department?: string;
  employeeId: string;
  email?: string;
  avatar?: string;
}

export interface TranscriptUtterance {
  id: string;
  speaker: string;
  speakerEmployeeId?: string;
  speakerDesignation?: string;
  avatarColor?: string;
  startTime: string;
  endTime: string;
  text: string;
}

export interface ActionItemNote {
  id: string;
  author: string;
  authorEmployeeId: string;
  timestamp: string;
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  assigneeEmployeeId?: string;
  assigneeDesignation?: string;
  assigneeTeam?: string;
  assigneeAvatar?: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  category?: string;
  taskSummary?: string;
  spokenText?: string;
  notes?: ActionItemNote[];
}

export interface MinutesOfMeeting {
  meetingTitle: string;
  date: string;
  duration: string;
  organizer?: string;
  organizerEmployeeId?: string;
  location?: string;
  attendees: string[]; // Names or formatted string list
  participants?: MeetingParticipant[]; // Structured participants with designations
  agendaTopics: {
    topic: string;
    keyPoints: string[];
    outcomes: string;
  }[];
  executiveSummary: string;
  mainThingsToDo: string[]; // Direct high-priority checklist items
  spokenSummary?: string; // Natural speech text for Voice API readout
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
  organizer: string;
  organizerEmployeeId: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'IN_PROGRESS';
  mediaType: 'audio' | 'video' | 'transcript_text';
  audioUrl?: string;
  participants: MeetingParticipant[];
  agenda: string[];
  utterances: TranscriptUtterance[];
  mom: MinutesOfMeeting;
}
