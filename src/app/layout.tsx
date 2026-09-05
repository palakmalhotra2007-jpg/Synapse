import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/authContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { NeuralBackground } from '@/components/ui/NeuralBackground';

export const metadata: Metadata = {
  title: 'Synapse | Production AI Intelligence & Productivity Platform',
  description: 'Enterprise AI Workspace, Fraud Analysis, Meeting Intelligence, Document AI Chat, and Executive Dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-synapse-bg text-slate-100 min-h-screen flex flex-col antialiased selection:bg-synapse-cyan/30 selection:text-synapse-cyan">
        <AuthProvider>
          <NeuralBackground />
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
