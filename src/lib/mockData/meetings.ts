import { MeetingSession } from '@/types/meeting';

export const sampleMeetings: MeetingSession[] = [
  {
    id: 'MEET-2026-0830-EXEC',
    title: 'Executive AI Strategy & Q4 Budget Allocation Sync',
    date: '2026-08-30',
    duration: '45 mins',
    mediaType: 'audio',
    utterances: [
      {
        id: 'u1',
        speaker: 'Sarah Jenkins (Chief Technology Officer)',
        avatarColor: 'cyan',
        startTime: '00:01',
        endTime: '02:15',
        text: 'Welcome everyone. Today we need to align on our Q4 AI roadmap and decide whether we increase our Cloud Run compute infrastructure allocation by 35% to support Synapse enterprise scale.'
      },
      {
        id: 'u2',
        speaker: 'Marcus Vance (VP of Product)',
        avatarColor: 'purple',
        startTime: '02:18',
        endTime: '04:40',
        text: 'From a product standpoint, customer feedback on our Fraud Risk Analysis module is extremely strong. Enterprise clients are requesting automated MoM exports to Slack and Microsoft Teams immediately.'
      },
      {
        id: 'u3',
        speaker: 'Elena Rostova (Chief Financial Officer)',
        avatarColor: 'emerald',
        startTime: '04:42',
        endTime: '07:10',
        text: 'I reviewed the numbers. Expanding Cloud Run and Firebase Storage will cost approximately $42,000 monthly, but our projected enterprise ARR increase is $180,000. I move that we approve the allocation effective September 1st.'
      },
      {
        id: 'u4',
        speaker: 'Sarah Jenkins (Chief Technology Officer)',
        avatarColor: 'cyan',
        startTime: '07:12',
        endTime: '09:05',
        text: 'Agreed. David, please ensure the SOC2 Type II compliance audit report is finalized before we deploy the RAG document Q&A to our financial sector clients.'
      },
      {
        id: 'u5',
        speaker: 'David K. (Head of Security & Compliance)',
        avatarColor: 'amber',
        startTime: '09:08',
        endTime: '11:20',
        text: 'The audit is 90% complete. We just need to confirm Firestore data encryption keys rotation policies with the infrastructure team by Friday.'
      }
    ],
    mom: {
      meetingTitle: 'Executive AI Strategy & Q4 Budget Allocation Sync',
      date: '2026-08-30',
      duration: '45 mins',
      attendees: [
        'Sarah Jenkins (CTO)',
        'Marcus Vance (VP Product)',
        'Elena Rostova (CFO)',
        'David K. (Head of Security)'
      ],
      executiveSummary: 'The executive committee unanimously approved a 35% increase in Cloud Run compute resources to support Synapse platform expansion. Product focus for Q4 centers on Fraud Intelligence enhancements and automated MoM integrations. SOC2 compliance audit completion is set for end of week.',
      agendaTopics: [
        {
          topic: 'Q4 Compute & Cloud Infrastructure Scaling',
          keyPoints: [
            'Current usage hitting 82% capacity during peak RAG document processing hours.',
            'Cloud Run monthly budget increase of $42,000 approved based on $180,000 ARR projection.'
          ],
          outcomes: 'Approved 35% capacity scaling starting Sept 1st.'
        },
        {
          topic: 'Fraud Analysis & Meeting Intelligence Roadmap',
          keyPoints: [
            'High enterprise demand for automated MoM export integrations (Slack / Teams).',
            'Fraud anomaly detector model accuracy reaches 98.4% on high-velocity wire transactions.'
          ],
          outcomes: 'Sprint priorities aligned for Q4 deliverable.'
        },
        {
          topic: 'SOC2 Type II Compliance Finalization',
          keyPoints: [
            'Audit status at 90% completion.',
            'Requires Firestore encryption key rotation validation.'
          ],
          outcomes: 'Final submission due Friday.'
        }
      ],
      keyDecisions: [
        'Approved $42k monthly expansion for Cloud Run AI compute infrastructure.',
        'Prioritized Slack & Microsoft Teams MoM export integration for Q4 release.',
        'Mandated SOC2 Type II sign-off before rolling out Financial RAG Q&A.'
      ],
      actionItems: [
        {
          id: 'act-101',
          title: 'Provision 35% additional Cloud Run instance capacity',
          assignee: 'Sarah Jenkins (CTO)',
          deadline: '2026-09-01',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          category: 'Infrastructure'
        },
        {
          id: 'act-102',
          title: 'Complete Firestore encryption key rotation compliance check',
          assignee: 'David K. (Head of Security)',
          deadline: '2026-09-05',
          priority: 'HIGH',
          status: 'PENDING',
          category: 'Security'
        },
        {
          id: 'act-103',
          title: 'Publish Product Spec for Slack/Teams MoM Exporter',
          assignee: 'Marcus Vance (VP Product)',
          deadline: '2026-09-08',
          priority: 'MEDIUM',
          status: 'PENDING',
          category: 'Product'
        }
      ],
      riskRegister: [
        {
          risk: 'Delay in SOC2 audit sign-off could pause Enterprise RAG rollout',
          impact: 'HIGH',
          mitigation: 'Assign dedicated compliance engineer to clear key rotation items by Thursday.'
        },
        {
          risk: 'API Rate Limits during peak multi-document batch analysis',
          impact: 'MEDIUM',
          mitigation: 'Implement exponential backoff and Cloud Run auto-burst queue.'
        }
      ]
    }
  }
];
