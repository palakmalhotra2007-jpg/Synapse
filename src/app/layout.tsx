import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/authContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
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
          <div className="relative z-10 flex min-h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 overflow-y-auto custom-scrollbar">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
