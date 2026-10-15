import { MeetingSession, MinutesOfMeeting, ActionItem, MeetingParticipant, TranscriptUtterance } from '@/types/meeting';
import { sampleMeetings } from '@/lib/mockData/meetings';

const STORAGE_KEY = 'synapse_stored_meetings_v2';

export function getStoredMeetingSessions(): MeetingSession[] {
  if (typeof window === 'undefined') {
    return sampleMeetings;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleMeetings));
      return sampleMeetings;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : sampleMeetings;
  } catch (e) {
    console.error('Failed to load stored meeting sessions:', e);
    return sampleMeetings;
  }
}

export function saveMeetingSessions(sessions: MeetingSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to persist meeting sessions:', e);
  }
}

export function saveSingleMeetingSession(updatedSession: MeetingSession): MeetingSession[] {
  const current = getStoredMeetingSessions();
  const index = current.findIndex((s) => s.id === updatedSession.id);
  let next: MeetingSession[];
  if (index >= 0) {
    next = [...current];
    next[index] = updatedSession;
  } else {
    next = [updatedSession, ...current];
  }
  saveMeetingSessions(next);
  return next;
}

export function deleteStoredMeetingSession(id: string): MeetingSession[] {
  const current = getStoredMeetingSessions();
  const next = current.filter((s) => s.id !== id);
  saveMeetingSessions(next);
  return next;
}
