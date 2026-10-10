'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Compass,
  FileText,
  Video,
  ShieldAlert,
  LayoutDashboard,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiggedAnimeCharacter } from './RiggedAnimeCharacter';
import { SYNAPSE_GUIDE_SECTIONS } from '@/lib/ai/companionGuide';

interface LiveCharacterProps {
  mode?: 'floating' | 'hero';
  onOpenAILLM?: (initialAction?: 'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection') => void;
  className?: string;
}

// Clean, polite, and helpful companion fallback phrases
const interactiveHoverPhrases = [
  "Hello! Need help? Click me and ask me anything.",
  "I am your live companion! Ask me about documents, charts, or fraud checks.",
  "I can analyze enterprise documents, parse graphs, and inspect hardware images.",
  "Don't forget to review your pending tasks for today!",
  "I am ready whenever you are! Click me anytime to open the AI assistant.",
  "All security vault checks and document databases are active. Let me know if you need assistance!",
];

const periodicReminders = [
  "Hello! Need help? Click me and ask me anything.",
  "Reminder: You have pending tasks in your workspace. Click me to review them together!",
  "All security vault fraud checks and document databases are active. Let me know if you need anything!",
];

// Play pleasant audio chime for instant feedback
const playAcousticChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5 note

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio context autoplay errors
  }
};

export const LiveCharacter: React.FC<LiveCharacterProps> = ({
  mode = 'floating',
  onOpenAILLM,
  className,
}) => {
  const pathname = usePathname();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Live anime character visible and interactive
  const [speechText, setSpeechText] = useState(
    SYNAPSE_GUIDE_SECTIONS[pathname]?.speech || interactiveHoverPhrases[0]
  );
  const [activeTitle, setActiveTitle] = useState(
    SYNAPSE_GUIDE_SECTIONS[pathname]?.title || 'Live AI Companion'
  );
  const [activeCategory, setActiveCategory] = useState(
    SYNAPSE_GUIDE_SECTIONS[pathname]?.category || 'AI Guide'
  );
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastHoverSpeakTime = useRef<number>(0);
  const phraseIndexRef = useRef<number>(0);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastAnnouncedPath = useRef<string>('');
  const announcedPaths = useRef<Set<string>>(new Set());

  // Unlock browser speech synthesis audio context on first interaction
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const unlockAudio = () => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {}
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    const updateVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          availableVoicesRef.current = voices;
        }
      } catch (e) {}
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Crystal Clear, Natural & Audible Voice Synthesis
  const speakVoice = useCallback(
    (textToSpeak?: string) => {
      if (voiceMuted) return;

      const phrase = textToSpeak || speechText;

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          playAcousticChime();

          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();

          const utterance = new SpeechSynthesisUtterance(phrase);

          // Natural, articulate, sweet female voice parameters
          utterance.rate = 1.0;
          utterance.pitch = 1.15;
          utterance.volume = 1.0;

          // Select the highest quality natural female voices
          const voices = availableVoicesRef.current.length > 0
            ? availableVoicesRef.current
            : window.speechSynthesis.getVoices();

          const selectedVoice =
            voices.find(
              (v) =>
                v.name.toLowerCase().includes('jenny') ||
                v.name.toLowerCase().includes('aria') ||
                v.name.toLowerCase().includes('natural') ||
                v.name.toLowerCase().includes('samantha') ||
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('victoria') ||
                v.name.toLowerCase().includes('karen') ||
                v.name.toLowerCase().includes('female')
            ) ||
            voices.find((v) => v.lang.startsWith('en') && !v.name.toLowerCase().includes('david') && !v.name.toLowerCase().includes('male')) ||
            voices[0];

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onstart = () => {
            setIsSpeaking(true);
          };
          utterance.onend = () => {
            setIsSpeaking(false);
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
          };

          currentUtteranceRef.current = utterance;
          (window as any).__currentSynapseUtterance = utterance;

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          setIsSpeaking(false);
        }
      }
    },
    [speechText, voiceMuted]
  );

  // Module-specific speech - only once per LOGIN SESSION per module
  useEffect(() => {
    if (!pathname || pathname === lastAnnouncedPath.current) return;
    lastAnnouncedPath.current = pathname;

    const section = SYNAPSE_GUIDE_SECTIONS[pathname];
    if (section) {
      setActiveTitle(section.title);
      setActiveCategory(section.category);
      setSpeechText(section.speech);
      
      // Check if this path was announced in this login session
      const loginSessionKey = `speech-announced-${pathname}`;
      const hasSpokenThisLogin = sessionStorage.getItem(loginSessionKey);
      
      if (!hasSpokenThisLogin) {
        // Mark as announced for this login session
        sessionStorage.setItem(loginSessionKey, 'true');
        
        // Speak the module description
        const timer = setTimeout(() => {
          speakVoice(section.speech);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, speakVoice]);

  // 2. Listen to custom companion guide events from tabs / modals
  useEffect(() => {
    const handleCustomGuide = (e: Event) => {
      const customEvent = e as CustomEvent<{
        key: string;
        title: string;
        category: string;
        speech: string;
        speak?: boolean;
      }>;

      if (!customEvent.detail) return;
      const { title, category, speech, speak } = customEvent.detail;

      setActiveTitle(title);
      setActiveCategory(category);
      setSpeechText(speech);

      if (speak !== false) {
        speakVoice(speech);
      }
    };

    window.addEventListener('synapse-companion-guide', handleCustomGuide);
    return () => window.removeEventListener('synapse-companion-guide', handleCustomGuide);
  }, [speakVoice]);

  // Live Instant Hover Reaction (Visual only - no auto-speak on hover)
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Removed auto-speak on hover - user can click "Speak" button manually
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Disable automatic periodic reminders - user requested speech only when entering modules

  const handleCharacterClick = () => {
    const phrase = "Opening your AI Multi-Modal Workspace now!";
    setSpeechText(phrase);
    speakVoice(phrase);

    if (onOpenAILLM) {
      setTimeout(() => {
        onOpenAILLM('chat');
      }, 150);
    }
  };

  if (isMinimized) {
    return (
      <div className={cn('fixed bottom-3 right-3 z-40 flex items-center gap-2', className)}>
        <button
          onClick={() => {
            if (onOpenAILLM) onOpenAILLM('chat');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 text-sky-700 shadow-md backdrop-blur-md text-xs font-semibold transition-all cursor-pointer"
        >
          <Bot className="w-4 h-4 text-sky-600" />
          <span>AI Assistant</span>
        </button>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-md backdrop-blur-md transition-all text-xs cursor-pointer"
          title="Expand Live Avatar"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        mode === 'floating'
          ? 'fixed bottom-2 right-2 z-40 flex flex-col items-end pointer-events-auto select-none'
          : 'relative flex flex-col items-center select-none',
        className
      )}
    >
      {/* Dynamic Smart Speech Bubble */}
      <div
        onClick={handleCharacterClick}
        className={cn(
          'mb-1 max-w-xs rounded-2xl p-2.5 backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-lg group relative z-10 text-left',
          isSpeaking
            ? 'bg-white/95 border-sky-400 shadow-sky-100 ring-2 ring-sky-400/40 text-slate-900 scale-102'
            : isHovered
            ? 'bg-white/95 border-sky-300 shadow-md text-slate-900'
            : 'bg-white/95 border-slate-200 text-slate-900 hover:border-sky-300'
        )}
      >
        {/* Bubble Tail */}
        <div
          className={cn(
            'absolute -bottom-2 right-8 w-3 h-3 rotate-45 border-r border-b transition-colors',
            isSpeaking
              ? 'bg-white border-sky-400'
              : isHovered
              ? 'bg-white border-sky-300'
              : 'bg-white border-slate-200'
          )}
        />

        <div className="flex items-start gap-2">
          <div
            className={cn(
              'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors',
              isSpeaking
                ? 'bg-sky-50 border border-sky-200 text-sky-600 animate-pulse'
                : 'bg-sky-50 border border-sky-100 text-sky-600'
            )}
          >
            {isSpeaking ? (
              <Volume2 className="w-3 h-3 animate-bounce" />
            ) : (
              <Compass className="w-3 h-3" />
            )}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider truncate max-w-[120px]">
                  {activeTitle}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                  {activeCategory}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakVoice();
                  }}
                  className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[9px] font-bold text-sky-700 hover:bg-sky-100 transition-colors flex items-center gap-0.5 cursor-pointer"
                  title="Speak line aloud"
                >
                  <Play className="w-2 h-2 fill-sky-600 text-sky-600" />
                  <span>Speak</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSpeaking) {
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsSpeaking(false);
                    } else {
                      setVoiceMuted(!voiceMuted);
                    }
                  }}
                  className="text-slate-400 hover:text-sky-600 p-0.5 rounded transition-colors cursor-pointer"
                  title={voiceMuted ? 'Unmute' : 'Mute'}
                >
                  {voiceMuted ? (
                    <VolumeX className="w-3 h-3 text-rose-500" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-sky-600" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer font-bold text-xs"
                  title="Minimize Avatar"
                >
                  ×
                </button>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-800 leading-snug">
              {speechText}
            </p>

            <span className="text-[9px] text-sky-600 font-medium block group-hover:underline">
              Click to open AI Assistant
            </span>
          </div>
        </div>
      </div>

      {/* FULLY RIGGED 2D ANIME CHARACTER CONTAINER */}
      <div
        className={cn(
          'relative group cursor-pointer transition-all duration-300 flex items-end justify-center',
          mode === 'floating'
            ? 'w-32 h-64 sm:w-36 sm:h-72'
            : 'w-56 h-96 sm:w-64 sm:h-[450px]'
        )}
      >
        {/* Fully Rigged Anatomical Character with Physics & Skeletal Kinematics */}
        <RiggedAnimeCharacter
          isSpeaking={isSpeaking}
          onClick={handleCharacterClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* Equalizer speech wave frequency bar when talking */}
        {isSpeaking && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white/95 px-2 py-0.5 rounded-full border border-sky-200 shadow-md backdrop-blur-md z-10 pointer-events-none">
            <span className="w-1 h-2 bg-sky-500 rounded-full animate-pulse" />
            <span className="w-1 h-3 bg-sky-600 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-2 bg-sky-500 rounded-full animate-pulse delay-150" />
          </div>
        )}

        {/* Live Online Beacon */}
        <div className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/90 border border-emerald-300 text-[8px] text-emerald-700 font-bold shadow-xs z-10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>LIVE</span>
        </div>
      </div>
    </div>
  );
};
