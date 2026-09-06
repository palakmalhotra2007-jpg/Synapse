'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Camera,
  BarChart3,
  Copy,
  MessageSquare,
  Bot,
  Zap,
  HelpCircle,
  X,
  ChevronRight,
  Eye,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICompanionCharacterProps {
  mode?: 'floating' | 'hero';
  onOpenVisionModal?: (action?: 'image_search' | 'chart_understanding' | 'duplicate_detection') => void;
  onOpenChat?: () => void;
  className?: string;
}

export const AICompanionCharacter: React.FC<AICompanionCharacterProps> = ({
  mode = 'floating',
  onOpenVisionModal,
  onOpenChat,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState('Need help? Click me and ask me anything!');
  const [eyeState, setEyeState] = useState<'normal' | 'blink' | 'happy' | 'thinking'>('normal');

  // Interactive random blink & eye animations
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeState('blink');
      setTimeout(() => setEyeState('normal'), 200);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Speak greeting using Web Speech API
  const speakGreeting = (text: string = "Need help? Click me and ask me anything! I can analyze documents, understand charts, inspect machine images, and detect fraud.") => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setEyeState('happy');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setEyeState('normal');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setEyeState('normal');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCharacterClick = () => {
    if (mode === 'floating') {
      setIsExpanded(!isExpanded);
    }
    if (!isSpeaking) {
      speakGreeting();
    }
  };

  return (
    <div
      className={cn(
        mode === 'floating'
          ? 'fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none'
          : 'relative flex flex-col items-center select-none',
        className
      )}
    >
      {/* Speech Bubble */}
      <div
        onClick={handleCharacterClick}
        className={cn(
          'mb-3 max-w-xs sm:max-w-sm rounded-2xl p-3.5 backdrop-blur-xl border transition-all duration-300 cursor-pointer shadow-2xl group relative animate-bounce-subtle',
          isSpeaking
            ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-purple-950/90 border-synapse-cyan/60 shadow-[0_0_25px_rgba(0,242,254,0.4)]'
            : 'bg-slate-900/95 border-slate-700/80 hover:border-synapse-cyan/50 text-white'
        )}
      >
        {/* Tail */}
        <div
          className={cn(
            'absolute -bottom-2 right-8 w-4 h-4 rotate-45 border-r border-b',
            isSpeaking ? 'bg-slate-900 border-synapse-cyan/60' : 'bg-slate-900 border-slate-700/80'
          )}
        />

        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-synapse-cyan/20 border border-synapse-cyan/40 flex items-center justify-center text-synapse-cyan shrink-0 mt-0.5">
            {isSpeaking ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <Sparkles className="w-3.5 h-3.5" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-synapse-cyan to-synapse-purple uppercase tracking-wider">
                Synapse AI Companion
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSpeaking) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  } else {
                    speakGreeting();
                  }
                }}
                className="text-slate-400 hover:text-synapse-cyan p-0.5 rounded transition-colors"
                title={isSpeaking ? 'Mute speech' : 'Listen voice'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-100 leading-snug">
              {speechBubbleText}
            </p>

            <span className="text-[10px] text-synapse-cyan font-mono block pt-0.5 group-hover:underline">
              Click to explore Image Vision, Charts & Chat
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Cyber Robotic Avatar */}
      <div className="relative group cursor-pointer" onClick={handleCharacterClick}>
        {/* Holographic Glowing Rings */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-synapse-cyan/30 via-synapse-purple/20 to-synapse-pink/30 blur-xl group-hover:blur-2xl transition-all opacity-80 animate-pulse-glow" />

        {/* Outer Halo */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-950/90 border-2 border-synapse-cyan/50 group-hover:border-synapse-cyan shadow-[0_0_20px_rgba(0,242,254,0.4)] flex items-center justify-center overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-active:scale-95">
          {/* Inner Cyber Circuit Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />

          {/* Antenna with Pulsing Beacon */}
          <div className="absolute top-1.5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-synapse-cyan shadow-[0_0_8px_#00f2fe] animate-ping" />
          </div>

          {/* Animated Robot Face */}
          <div className="relative flex flex-col items-center justify-center space-y-1.5">
            {/* Glowing Visor / Eyes */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-synapse-cyan/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]">
              {/* Left Eye */}
              <div
                className={cn(
                  'rounded-full bg-gradient-to-r from-synapse-cyan to-white transition-all shadow-[0_0_8px_#00f2fe]',
                  eyeState === 'blink' ? 'w-2.5 h-0.5' : eyeState === 'happy' ? 'w-2.5 h-2.5 rounded-t-full' : 'w-2.5 h-2.5'
                )}
              />
              {/* Right Eye */}
              <div
                className={cn(
                  'rounded-full bg-gradient-to-r from-synapse-cyan to-white transition-all shadow-[0_0_8px_#00f2fe]',
                  eyeState === 'blink' ? 'w-2.5 h-0.5' : eyeState === 'happy' ? 'w-2.5 h-2.5 rounded-t-full' : 'w-2.5 h-2.5'
                )}
              />
            </div>

            {/* Mouth / Audio Equalizer Wave when speaking */}
            {isSpeaking ? (
              <div className="flex items-center gap-0.5 h-2">
                <div className="w-1 h-2 bg-synapse-cyan rounded-full animate-pulse" />
                <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1.5 bg-synapse-cyan rounded-full animate-pulse delay-150" />
                <div className="w-1 h-2.5 bg-purple-400 rounded-full animate-pulse" />
              </div>
            ) : (
              <div className="w-4 h-1 rounded-full bg-synapse-cyan/40" />
            )}
          </div>

          {/* Online Indicator Badge */}
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_6px_#10b981]" />
        </div>
      </div>

      {/* Floating Expanded Action Hub Modal */}
      {isExpanded && mode === 'floating' && (
        <div className="absolute bottom-24 right-0 w-80 sm:w-96 rounded-3xl bg-slate-950/95 border border-synapse-cyan/40 backdrop-blur-2xl p-5 shadow-[0_0_40px_rgba(0,242,254,0.25)] space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-synapse-cyan/10 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Synapse Multi-Modal AI</h4>
                <span className="text-[10px] text-slate-400">Vision, Charts & Document Brain</span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Cards */}
          <div className="space-y-2">
            <div
              onClick={() => {
                setIsExpanded(false);
                if (onOpenVisionModal) onOpenVisionModal('image_search');
              }}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-synapse-cyan/50 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-synapse-cyan/10 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-synapse-cyan transition-colors">
                    Image Knowledge Search
                  </h5>
                  <p className="text-[10px] text-slate-400">Upload machine images, circuits & diagrams</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-synapse-cyan" />
            </div>

            <div
              onClick={() => {
                setIsExpanded(false);
                if (onOpenVisionModal) onOpenVisionModal('chart_understanding');
              }}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Chart & Graph Understanding
                  </h5>
                  <p className="text-[10px] text-slate-400">Parse bar, pie & line charts with deep learning</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
            </div>

            <div
              onClick={() => {
                setIsExpanded(false);
                if (onOpenVisionModal) onOpenVisionModal('duplicate_detection');
              }}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                    Duplicate & Similar Image Search
                  </h5>
                  <p className="text-[10px] text-slate-400">Perceptual hash matching & forgery detection</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
            </div>

            <div
              onClick={() => {
                setIsExpanded(false);
                if (onOpenChat) onOpenChat();
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-synapse-cyan/15 to-synapse-purple/15 border border-synapse-cyan/40 hover:border-synapse-cyan cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-synapse-cyan text-slate-950 font-bold flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">
                    Ask Anything / Universal Doc RAG
                  </h5>
                  <p className="text-[10px] text-slate-300">Grounded search across all employee files</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-synapse-cyan" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
