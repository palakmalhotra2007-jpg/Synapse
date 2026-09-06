import { MeetingSession, MeetingParticipant } from '@/types/meeting';

export const sampleParticipants: MeetingParticipant[] = [
  {
    id: 'p-sarah',
    name: 'Sarah Connor',
    designation: 'Lead AML & Fraud Operations Investigator',
    team: 'Fraud & AML Ops',
    department: 'Risk Management',
    employeeId: 'EMP-FRAUD-104',
  },
  {
    id: 'p-alex',
    name: 'Alex Rivera',
    designation: 'Principal AI & Neural Architect',
    team: 'Core AI & Platform',
    department: 'Engineering',
    employeeId: 'EMP-AI-882',
  },
  {
    id: 'p-elena',
    name: 'Elena Rostova',
    designation: 'Chief Risk Officer & Compliance Director',
    team: 'Financial Risk & Compliance',
    department: 'Executive',
    employeeId: 'EMP-FIN-419',
  },
  {
    id: 'p-david',
    name: 'David Kim',
    designation: 'Head of Cryptography & Cloud Security',
    team: 'Security & Cryptography',
    department: 'InfraSec',
    employeeId: 'EMP-SEC-305',
  },
  {
    id: 'p-marcus',
    name: 'Marcus Vance',
    designation: 'VP of Enterprise Product & Intelligence',
    team: 'Executive Leadership',
    department: 'Product',
    employeeId: 'EMP-EXEC-991',
  },
];

export const sampleMeetings: MeetingSession[] = [
  {
    id: 'MEET-2026-0830-EXEC',
    title: 'Executive AI Strategy & Q4 Budget Allocation Sync',
    date: '2026-08-30',
    duration: '45 mins',
    mediaType: 'audio',
    participants: [
      sampleParticipants[1], // Alex Rivera
      sampleParticipants[4], // Marcus Vance
      sampleParticipants[2], // Elena Rostova
      sampleParticipants[3], // David Kim
    ],
    utterances: [
      {
        id: 'u1',
        speaker: 'Alex Rivera',
        speakerDesignation: 'Principal AI & Neural Architect',
        avatarColor: 'cyan',
        startTime: '00:01',
        endTime: '02:15',
        text: 'Welcome everyone. Today we need to align on our Q4 AI roadmap and decide whether we increase our Cloud Run compute infrastructure allocation by 35% to support Synapse enterprise scale and cross-document RAG indexing.',
      },
      {
        id: 'u2',
        speaker: 'Marcus Vance',
        speakerDesignation: 'VP of Enterprise Product & Intelligence',
        avatarColor: 'purple',
        startTime: '02:18',
        endTime: '04:40',
        text: 'From a product standpoint, customer feedback on our Omni Fraud Analysis and cross-document ledger checks is exceptionally high. Enterprise clients are requesting automated voice MoM briefings and direct task delegation immediately.',
      },
      {
        id: 'u3',
        speaker: 'Elena Rostova',
        speakerDesignation: 'Chief Risk Officer & Compliance Director',
        avatarColor: 'emerald',
        startTime: '04:42',
        endTime: '07:10',
        text: 'I reviewed the numbers. Expanding Cloud Run and vector indexing storage will cost approximately $42,000 monthly, but our projected enterprise ARR increase is $180,000. I move that we approve the allocation effective September 1st.',
      },
      {
        id: 'u4',
        speaker: 'David Kim',
        speakerDesignation: 'Head of Cryptography & Cloud Security',
        avatarColor: 'amber',
        startTime: '07:12',
        endTime: '09:05',
        text: 'Agreed. The SOC2 Type II compliance audit report is 90% finalized. We will lock in the Firestore data encryption keys rotation policies with the infrastructure team by Friday.',
      },
    ],
    mom: {
      meetingTitle: 'Executive AI Strategy & Q4 Budget Allocation Sync',
      date: '2026-08-30',
      duration: '45 mins',
      attendees: [
        'Alex Rivera (Principal AI & Neural Architect)',
        'Marcus Vance (VP of Enterprise Product & Intelligence)',
        'Elena Rostova (Chief Risk Officer & Compliance Director)',
        'David Kim (Head of Cryptography & Cloud Security)',
      ],
      participants: [
        sampleParticipants[1],
        sampleParticipants[4],
        sampleParticipants[2],
        sampleParticipants[3],
      ],
      executiveSummary: 'The executive committee unanimously approved a 35% increase in Cloud Run compute resources to support Synapse platform expansion and multi-document vector RAG. Product focus for Q4 centers on Omni Fraud Intelligence and voice-enabled MoM automation. SOC2 compliance audit completion is set for end of week.',
      mainThingsToDo: [
        'Scale Cloud Run cluster capacity by 35% before September 1st release.',
        'Finalize SOC2 Type II Firestore encryption key rotation verification.',
        'Deploy Spoken Voice API (TTS) and automated task assignment to all enterprise workspaces.',
        'Execute cross-document invoice tampering inspection across the active ledger.',
      ],
      spokenSummary: 'Executive meeting summary for August 30th. The committee unanimously approved a 35 percent Cloud Run compute expansion for 42,000 dollars monthly. Primary focus is rolling out Omni Fraud cross-checks and voice-enabled action item briefings. Key deadlines are set for September 1st and September 5th.',
      agendaTopics: [
        {
          topic: 'Q4 Compute & Cloud Infrastructure Scaling',
          keyPoints: [
            'Current usage hitting 82% capacity during peak RAG multi-document batch indexing.',
            'Cloud Run monthly budget increase of $42,000 approved based on $180,000 ARR projection.',
          ],
          outcomes: 'Approved 35% capacity scaling starting Sept 1st.',
        },
        {
          topic: 'Omni Fraud Analysis & Voice Meeting Intelligence Roadmap',
          keyPoints: [
            'High enterprise demand for automated voice MoM briefings and direct task assignees.',
            'Fraud anomaly detector model accuracy reaches 98.4% on high-velocity wire transactions.',
          ],
          outcomes: 'Sprint priorities aligned for Q4 deliverable.',
        },
        {
          topic: 'SOC2 Type II Compliance Finalization',
          keyPoints: [
            'Audit status at 90% completion.',
            'Requires Firestore encryption key rotation validation.',
          ],
          outcomes: 'Final submission due Friday.',
        },
      ],
      keyDecisions: [
        'Approved $42k monthly expansion for Cloud Run AI compute infrastructure.',
        'Prioritized Voice-Enabled MoM and Direct Task assignment for Q4 release.',
        'Mandated SOC2 Type II sign-off before rolling out Financial RAG Q&A.',
      ],
      actionItems: [
        {
          id: 'act-101',
          title: 'Provision 35% additional Cloud Run instance capacity',
          assignee: 'Alex Rivera',
          assigneeDesignation: 'Principal AI & Neural Architect',
          assigneeTeam: 'Core AI & Platform',
          deadline: '2026-09-01',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          category: 'Infrastructure',
          taskSummary: 'Scale cloud cluster instances and vector embedding cache.',
          spokenText: 'Action item for Alex Rivera, Principal AI Architect: Provision 35 percent additional Cloud Run compute capacity by September 1st, High Priority.',
        },
        {
          id: 'act-102',
          title: 'Complete Firestore encryption key rotation compliance check',
          assignee: 'David Kim',
          assigneeDesignation: 'Head of Cryptography & Cloud Security',
          assigneeTeam: 'Security & Cryptography',
          deadline: '2026-09-05',
          priority: 'HIGH',
          status: 'PENDING',
          category: 'Security',
          taskSummary: 'Verify AES-256 rotating keys and export compliance log for SOC2 Type II audit.',
          spokenText: 'Action item for David Kim, Head of Cryptography: Complete Firestore encryption key rotation compliance check by September 5th, High Priority.',
        },
        {
          id: 'act-103',
          title: 'Publish Product Spec for Voice-Enabled MoM Exporter',
          assignee: 'Marcus Vance',
          assigneeDesignation: 'VP of Enterprise Product & Intelligence',
          assigneeTeam: 'Executive Leadership',
          deadline: '2026-09-08',
          priority: 'MEDIUM',
          status: 'PENDING',
          category: 'Product',
          taskSummary: 'Define user specifications for Web Speech API and task notifications.',
          spokenText: 'Action item for Marcus Vance, VP of Product: Publish product specification for voice-enabled Minutes of Meeting exporter by September 8th, Medium Priority.',
        },
        {
          id: 'act-104',
          title: 'Audit offshore ledger against vendor agreements for discrepancy anomalies',
          assignee: 'Elena Rostova',
          assigneeDesignation: 'Chief Risk Officer & Compliance Director',
          assigneeTeam: 'Financial Risk & Compliance',
          deadline: '2026-09-04',
          priority: 'HIGH',
          status: 'PENDING',
          category: 'Compliance',
          taskSummary: 'Cross-check wire transactions over $500,000 with uploaded Master Service Agreements.',
          spokenText: 'Action item for Elena Rostova, Chief Risk Officer: Audit offshore ledger against vendor agreements for discrepancy anomalies by September 4th, High Priority.',
        },
      ],
      riskRegister: [
        {
          risk: 'Delay in SOC2 audit sign-off could pause Enterprise RAG rollout',
          impact: 'HIGH',
          mitigation: 'Assign dedicated compliance engineer to clear key rotation items by Thursday.',
        },
        {
          risk: 'API Rate Limits during peak multi-document batch analysis',
          impact: 'MEDIUM',
          mitigation: 'Implement exponential backoff and Cloud Run auto-burst queue.',
        },
      ],
    },
  },
  {
    id: 'MEET-2026-0902-FRAUD',
    title: 'Offshore Fraud Inquest & Document Tampering Review',
    date: '2026-09-02',
    duration: '35 mins',
    mediaType: 'audio',
    participants: [
      sampleParticipants[0], // Sarah Connor
      sampleParticipants[2], // Elena Rostova
      sampleParticipants[3], // David Kim
    ],
    utterances: [
      {
        id: 'fu1',
        speaker: 'Sarah Connor',
        speakerDesignation: 'Lead AML & Fraud Operations Investigator',
        avatarColor: 'rose',
        startTime: '00:00',
        endTime: '01:45',
        text: 'We detected a major discrepancy on transaction TXN-902148. A wire of $1.45 million was dispatched to a Cayman entity, but our uploaded vendor contract states a quarterly ceiling of $250,000.',
      },
      {
        id: 'fu2',
        speaker: 'Elena Rostova',
        speakerDesignation: 'Chief Risk Officer & Compliance Director',
        avatarColor: 'emerald',
        startTime: '01:48',
        endTime: '03:10',
        text: 'The invoice attached also exhibits font inconsistencies in the beneficiary IBAN field, indicating potential post-signature alteration. We must freeze the routing immediately.',
      },
      {
        id: 'fu3',
        speaker: 'David Kim',
        speakerDesignation: 'Head of Cryptography & Cloud Security',
        avatarColor: 'amber',
        startTime: '03:12',
        endTime: '04:30',
        text: 'The IP telemetry came from a known Tor exit node in Munich. I have placed an automated firewall lock on all dispatches originating from that subnet.',
      },
    ],
    mom: {
      meetingTitle: 'Offshore Fraud Inquest & Document Tampering Review',
      date: '2026-09-02',
      duration: '35 mins',
      attendees: [
        'Sarah Connor (Lead AML & Fraud Operations Investigator)',
        'Elena Rostova (Chief Risk Officer & Compliance Director)',
        'David Kim (Head of Cryptography & Cloud Security)',
      ],
      participants: [
        sampleParticipants[0],
        sampleParticipants[2],
        sampleParticipants[3],
      ],
      executiveSummary: 'Emergency investigation into $1.45M wire TXN-902148 revealed an unauthorized beneficiary alteration and a $1.2M divergence from the Master Service Agreement. Immediate freeze enacted with IP subnet blacklisting.',
      mainThingsToDo: [
        'Issue immediate asset freeze notice for Cayman beneficiary wire TXN-902148.',
        'Run forensic font & signature verification scan on uploaded invoice INV-9042.',
        'Update firewall AML blacklist with Tor exit subnet 185.220.101.5.',
      ],
      spokenSummary: 'Emergency Fraud Inquest briefing. Transaction TXN 902148 for 1.45 million dollars has been frozen due to a 1.2 million dollar contract mismatch and altered IBAN. Full forensic audit is underway.',
      agendaTopics: [
        {
          topic: 'Invoice vs Master Agreement Discrepancy',
          keyPoints: [
            'Vendor MSA sets $250k ceiling; wire requested was $1.45M.',
            'Beneficiary name does not match corporate registration on file.',
          ],
          outcomes: 'Payment blocked and referred to AML forensics.',
        },
      ],
      keyDecisions: [
        'Immediately locked wire dispatch protocol for TXN-902148.',
        'Mandated AI Document Forensic Scanner check for all invoices exceeding $100,000.',
      ],
      actionItems: [
        {
          id: 'act-201',
          title: 'Transmit formal Suspicious Activity Report (SAR) to AML Authority',
          assignee: 'Sarah Connor',
          assigneeDesignation: 'Lead AML & Fraud Operations Investigator',
          assigneeTeam: 'Fraud & AML Ops',
          deadline: '2026-09-03',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          category: 'Compliance',
          taskSummary: 'File FinCEN regulatory SAR disclosure with timestamped evidence.',
          spokenText: 'Action item for Sarah Connor, Lead AML Investigator: Transmit formal Suspicious Activity Report to AML Authority by September 3rd, High Priority.',
        },
        {
          id: 'act-202',
          title: 'Blacklist Tor exit relay IP subnet and enforce hardware key authorization',
          assignee: 'David Kim',
          assigneeDesignation: 'Head of Cryptography & Cloud Security',
          assigneeTeam: 'Security & Cryptography',
          deadline: '2026-09-02',
          priority: 'HIGH',
          status: 'COMPLETED',
          category: 'Security',
          taskSummary: 'Block IP range 185.220.101.0/24 in enterprise WAF.',
          spokenText: 'Action item for David Kim, Head of Cryptography: Blacklist Tor exit relay IP subnet and enforce hardware key authorization, Completed.',
        },
      ],
      riskRegister: [
        {
          risk: 'Attempted fund clawback delay by foreign correspondent bank',
          impact: 'HIGH',
          mitigation: 'Activate swift GPI stop-and-recall protocol within 2 hours.',
        },
      ],
    },
  },
];

