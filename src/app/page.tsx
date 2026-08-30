'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  ShieldAlert,
  Video,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sampleDashboardMetrics, sampleActivityFeed } from '@/lib/mockData/dashboard';
import { sampleMeetings } from '@/lib/mockData/meetings';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const usageChartData = [
  { time: '08:00', queries: 2400, tokens: 42000 },
  { time: '10:00', queries: 4800, tokens: 89000 },
  { time: '12:00', queries: 8900, tokens: 164000 },
  { time: '14:00', queries: 12400, tokens: 230000 },
  { time: '16:00', queries: 9800, tokens: 185000 },
  { time: '18:00', queries: 6200, tokens: 110000 },
  { time: '20:00', queries: 3500, tokens: 68000 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [actionItems, setActionItems] = useState(sampleMeetings[0].mom.actionItems);

  const toggleTaskStatus = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
            }
          : item
      )
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 border border-synapse-cyan/30 glass-card-glow shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-synapse-cyan/10 border border-synapse-cyan/30 rounded-full text-synapse-cyan text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Synapse Intelligence OS v4.2 Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-synapse-cyan via-purple-400 to-pink-400">Alex Sterling</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Your unified AI intelligence engine has analyzed <strong className="text-synapse-cyan">184,920 queries</strong>, flagged <strong className="text-rose-400">18 critical financial anomalies</strong>, and updated <strong className="text-purple-400">3 executive meeting MoMs</strong> today.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push('/workspace')}
              variant="primary"
              leftIcon={<Bot className="w-4 h-4" />}
            >
              Launch AI Workspace
            </Button>
            <Button
              onClick={() => router.push('/fraud')}
              variant="glow"
              leftIcon={<ShieldAlert className="w-4 h-4" />}
            >
              Analyze Fraud Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {sampleDashboardMetrics.map((metric) => {
          let iconComponent;
          if (metric.icon === 'Bot') iconComponent = <Bot className="w-5 h-5 text-cyan-400" />;
          else if (metric.icon === 'ShieldAlert') iconComponent = <ShieldAlert className="w-5 h-5 text-rose-400" />;
          else if (metric.icon === 'Video') iconComponent = <Video className="w-5 h-5 text-purple-400" />;
          else iconComponent = <FileText className="w-5 h-5 text-emerald-400" />;

          return (
            <Card key={metric.id} className="space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  {metric.title}
                </span>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  {iconComponent}
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {metric.value}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{metric.changePercent}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                {metric.timeframe}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Usage Analytics & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Usage & Infrastructure Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-synapse-cyan" />
                  <span>Real-Time AI Processing Throughput</span>
                </h3>
                <p className="text-xs text-slate-400">Tokens consumed vs queries processed across Cloud Run nodes</p>
              </div>
              <Badge variant="cyan">99.98% SLA Uptime</Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(0, 242, 254, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="queries"
                    stroke="#00f2fe"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorQueries)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Module Launchpad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/workspace"
              className="p-5 rounded-2xl glass-panel hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all group border border-slate-800"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                AI Workspace
              </h4>
              <p className="text-xs text-slate-400 mt-1">RAG document Q&A & multimodal LLM streaming</p>
            </Link>

            <Link
              href="/fraud"
              className="p-5 rounded-2xl glass-panel hover:border-rose-500/40 hover:bg-slate-900/80 transition-all group border border-slate-800"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                Fraud Analysis
              </h4>
              <p className="text-xs text-slate-400 mt-1">Upload CSV transaction logs & score anomalies</p>
            </Link>

            <Link
              href="/meetings"
              className="p-5 rounded-2xl glass-panel hover:border-purple-500/40 hover:bg-slate-900/80 transition-all group border border-slate-800"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Meeting MoM
              </h4>
              <p className="text-xs text-slate-400 mt-1">Transcribe audio & generate executive MoM</p>
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Activity Feed & Action Items */}
        <div className="space-y-6">
          {/* Action Items List */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pending Action Items</span>
              </h3>
              <Badge variant="amber" size="sm">
                {actionItems.filter((i) => i.status !== 'COMPLETED').length} Due
              </Badge>
            </div>

            <div className="space-y-2.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTaskStatus(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.status === 'COMPLETED'
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.status === 'COMPLETED'}
                    onChange={() => {}}
                    className="mt-1 rounded accent-synapse-cyan cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>Owner: {item.assignee.split(' ')[0]}</span>
                      <span>•</span>
                      <span>Due: {item.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Unified Activity Stream */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-synapse-cyan" />
                <span>Live Activity Stream</span>
              </h3>
              <span className="text-[10px] text-slate-400">Real-Time Sync</span>
            </div>

            <div className="space-y-3">
              {sampleActivityFeed.map((item) => (
                <Link
                  key={item.id}
                  href={item.linkUrl}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="mt-0.5">
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badgeText}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-synapse-cyan transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {item.timestamp}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
