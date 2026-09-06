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

  // 1. Proactive Tab / Route Navigation Commentary
  useEffect(() => {
    if (!pathname || pathname === lastAnnouncedPath.current) return;
    lastAnnouncedPath.current = pathname;

    const section = SYNAPSE_GUIDE_SECTIONS[pathname];
    if (section) {
      setActiveTitle(section.title);
      setActiveCategory(section.category);
      setSpeechText(section.speech);
      // Wait slightly for page transition render, then speak aloud
      const timer = setTimeout(() => {
        speakVoice(section.speech);
      }, 300);
      return () => clearTimeout(timer);
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

  // Live Instant Hover Reaction (Speaks current section or next phrase on hover)
  const handleMouseEnter = () => {
    setIsHovered(true);

    const now = Date.now();
    if (now - lastHoverSpeakTime.current > 1200) {
      lastHoverSpeakTime.current = now;
      const section = SYNAPSE_GUIDE_SECTIONS[pathname];
      const phrase = section ? section.speech : interactiveHoverPhrases[phraseIndexRef.current % interactiveHoverPhrases.length];
      phraseIndexRef.current += 1;
      setSpeechText(phrase);
      speakVoice(phrase);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Periodic 5-Minute Proactive Voice Reminder
  useEffect(() => {
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    const interval = setInterval(() => {
      const section = SYNAPSE_GUIDE_SECTIONS[pathname];
      const randomPhrase = section ? section.speech : periodicReminders[Math.floor(Math.random() * periodicReminders.length)];
      setSpeechText(randomPhrase);
      speakVoice(randomPhrase);
    }, FIVE_MINUTES_MS);

    return () => clearInterval(interval);
  }, [pathname, speakVoice]);

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

  return (
    <div
      className={cn(
        mode === 'floating'
          ? 'fixed bottom-1 right-3 z-50 flex flex-col items-end pointer-events-auto select-none'
          : 'relative flex flex-col items-center select-none',
        className
      )}
    >
      {/* Dynamic Smart Speech Bubble */}
      <div
        onClick={handleCharacterClick}
        className={cn(
          'mb-1 max-w-xs sm:max-w-sm rounded-2xl p-3 backdrop-blur-xl border transition-all duration-300 cursor-pointer shadow-2xl group relative z-10',
          isSpeaking
            ? 'bg-slate-900/95 border-synapse-cyan shadow-[0_0_30px_rgba(0,242,254,0.45)] ring-2 ring-synapse-cyan/60 scale-105'
            : isHovered
            ? 'bg-slate-900/95 border-cyan-400/80 shadow-[0_0_20px_rgba(0,242,254,0.3)] text-white'
            : 'bg-slate-900/95 border-slate-700/80 hover:border-synapse-cyan/60 text-white'
        )}
      >
        {/* Bubble Tail */}
        <div
          className={cn(
            'absolute -bottom-2 right-12 w-3.5 h-3.5 rotate-45 border-r border-b transition-colors',
            isSpeaking
              ? 'bg-slate-900 border-synapse-cyan'
              : isHovered
              ? 'bg-slate-900 border-cyan-400/80'
              : 'bg-slate-900 border-slate-700/80'
          )}
        />

        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors',
              isSpeaking
                ? 'bg-synapse-cyan/20 border border-synapse-cyan text-synapse-cyan animate-pulse'
                : 'bg-synapse-cyan/20 border border-synapse-cyan/40 text-synapse-cyan'
            )}
          >
            {isSpeaking ? (
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            ) : (
              <Compass className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="space-y-1 w-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-synapse-cyan to-synapse-purple uppercase tracking-wider truncate max-w-[150px]">
                  {activeTitle}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-synapse-cyan/15 text-synapse-cyan border border-synapse-cyan/30 shrink-0">
                  {activeCategory}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Manual Speak Trigger Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakVoice();
                  }}
                  className="px-1.5 py-0.5 rounded bg-synapse-cyan/15 border border-synapse-cyan/40 text-[10px] font-bold text-synapse-cyan hover:bg-synapse-cyan/25 transition-colors flex items-center gap-0.5"
                  title="Speak line aloud"
                >
                  <Play className="w-2.5 h-2.5 fill-synapse-cyan" />
                  <span>Speak</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    } else {
                      setVoiceMuted(!voiceMuted);
                    }
                  }}
                  className="text-slate-400 hover:text-synapse-cyan p-0.5 rounded transition-colors"
                  title={voiceMuted ? 'Unmute' : 'Mute'}
                >
                  {voiceMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-synapse-cyan" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-100 leading-snug">
              {speechText}
            </p>

            <span className="text-[10px] text-synapse-cyan font-mono block pt-0.5 group-hover:underline">
              Switch tabs to hear guide • Click to open AI LLM
            </span>
          </div>
        </div>
      </div>

      {/* FULLY RIGGED 2D ANIME CHARACTER CONTAINER */}
      <div
        className={cn(
          'relative group cursor-pointer transition-all duration-300 flex items-end justify-center',
          mode === 'floating'
            ? 'w-36 h-72 sm:w-44 sm:h-88'
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-950/90 px-2.5 py-1 rounded-full border border-synapse-cyan/60 shadow-[0_0_15px_rgba(0,242,254,0.4)] backdrop-blur-md z-10 animate-in fade-in zoom-in-90 pointer-events-none">
            <span className="w-1 h-2.5 bg-synapse-cyan rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-cyan-300 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-2.5 bg-synapse-cyan rounded-full animate-pulse delay-150" />
          </div>
        )}

        {/* Live Online Beacon */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-950/90 border border-emerald-500/50 text-[9px] text-emerald-400 font-bold shadow-md z-10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE</span>
        </div>
      </div>
    </div>
  );
};
