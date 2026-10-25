import { spawn } from 'child_process';
import path from 'path';
import { MinutesOfMeeting, MeetingParticipant } from '@/types/meeting';
import { SynapseAIEngine } from './synapseEngine';

/**
 * Executes the fine-tuned Meeting Analyser ML inference model pipeline (FLAN-T5-small).
 * Falls back gracefully to SynapseAIEngine if Python execution is unavailable.
 */
export async function executeMeetingAIModel(
  transcriptText: string,
  participants?: MeetingParticipant[]
): Promise<MinutesOfMeeting> {
  const pythonScript = path.resolve(process.cwd(), 'ml', 'inference.py');

  return new Promise<MinutesOfMeeting>((resolve) => {
    let outputData = '';
    let errorData = '';
    let isResolved = false;

    // Timeout safety protection: 15s max for CPU inference
    const timeoutTimer = setTimeout(async () => {
      if (!isResolved) {
        isResolved = true;
        console.warn('[MeetingAIModel] Python inference timed out after 15s. Falling back to SynapseAIEngine.');
        try {
          const fallbackMom = await SynapseAIEngine.processMeetingSession(transcriptText, participants);
          resolve(fallbackMom);
        } catch (e) {
          resolve(getSafeDefaultMom(transcriptText, participants));
        }
      }
    }, 15000);

    try {
      const pythonProcess = spawn('py', ['-3.11', pythonScript, '--json']);

      pythonProcess.stdout.on('data', (chunk) => {
        outputData += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk) => {
        errorData += chunk.toString();
      });

      pythonProcess.on('close', async (code) => {
        clearTimeout(timeoutTimer);
        if (isResolved) return;
        isResolved = true;

        if (code === 0 && outputData.trim()) {
          try {
            const parsedMom: MinutesOfMeeting = JSON.parse(outputData.trim());
            console.log('[MeetingAIModel] Successfully processed meeting via Fine-Tuned FLAN-T5 Model.');
            return resolve(parsedMom);
          } catch (err) {
            console.warn('[MeetingAIModel] JSON parse error from Python output. Falling back:', err);
          }
        } else {
          console.warn(`[MeetingAIModel] Python process exited with code ${code}. Stderr: ${errorData}`);
        }

        // Graceful fallback
        try {
          const fallbackMom = await SynapseAIEngine.processMeetingSession(transcriptText, participants);
          resolve(fallbackMom);
        } catch (err) {
          resolve(getSafeDefaultMom(transcriptText, participants));
        }
      });

      pythonProcess.on('error', async (err) => {
        clearTimeout(timeoutTimer);
        if (isResolved) return;
        isResolved = true;
        console.warn('[MeetingAIModel] Failed to spawn Python process. Falling back:', err);
        try {
          const fallbackMom = await SynapseAIEngine.processMeetingSession(transcriptText, participants);
          resolve(fallbackMom);
        } catch (e) {
          resolve(getSafeDefaultMom(transcriptText, participants));
        }
      });

      // Send payload to stdin
      pythonProcess.stdin.write(JSON.stringify({ transcriptText, participants }));
      pythonProcess.stdin.end();
    } catch (e) {
      clearTimeout(timeoutTimer);
      if (!isResolved) {
        isResolved = true;
        console.warn('[MeetingAIModel] Spawn exception. Falling back:', e);
        SynapseAIEngine.processMeetingSession(transcriptText, participants)
          .then(resolve)
          .catch(() => resolve(getSafeDefaultMom(transcriptText, participants)));
      }
    }
  });
}

function getSafeDefaultMom(
  transcriptText: string,
  participants?: MeetingParticipant[]
): MinutesOfMeeting {
  const pList = participants && participants.length > 0 ? participants : [];
  const attendees = pList.map((p) => `${p.name} (${p.designation || 'Participant'})`);
  const lines = transcriptLines(transcriptText);

  return {
    meetingTitle: lines[0] ? lines[0].slice(0, 70) : 'Strategy & Operational Review',
    date: new Date().toISOString().split('T')[0],
    duration: '30 mins',
    organizer: pList[0]?.name || 'Meeting Lead',
    organizerEmployeeId: pList[0]?.employeeId || 'EMP-ENG-001',
    attendees: attendees.length > 0 ? attendees : ['Meeting Participant'],
    agendaTopics: [
      {
        topic: 'Session Discussion & Review',
        keyPoints: lines.slice(0, 3).length > 0 ? lines.slice(0, 3) : ['Review discussion points and next steps'],
        outcomes: 'Discussion recorded.'
      }
    ],
    executiveSummary: transcriptText.slice(0, 250) || 'Operational meeting convened to review project roadmap.',
    mainThingsToDo: [],
    keyDecisions: [],
    actionItems: [],
    riskRegister: []
  };
}

function transcriptLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^[A-Za-z\s]+:\s*/, '').trim())
    .filter((l) => l.length > 15 && !l.startsWith('http'));
}
