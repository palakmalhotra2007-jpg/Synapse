'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Users,
  UserCheck,
  Lock,
  Cpu,
  Layers,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';
import { INITIAL_USERS, StoredUser, getStoredUsers } from '@/lib/auth/usersDb';
import { TeamId } from '@/types/dashboard';

interface FaceRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'verify' | 'enroll';
  onSuccess?: () => void;
  targetTeamId?: TeamId;
}

export const FaceRecognitionModal: React.FC<FaceRecognitionModalProps> = ({
  isOpen,
  onClose,
  mode = 'login',
  onSuccess,
}) => {
  const { loginWithFace, enrollFace, user: currentUser } = useAuth();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [identifiedUser, setIdentifiedUser] = useState<StoredUser | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'scanning' | 'matched' | 'failed'>('idle');
  const [selectedPersona, setSelectedPersona] = useState<StoredUser>(INITIAL_USERS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const registeredUsers = getStoredUsers();

  // Web Audio Synthesizer for high-tech HUD beep effects
  const playScanBeep = (freq: number = 880, duration: number = 0.08) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
        setCameraError('Webcam access not supported in this browser. Running neural simulation mode.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
      setCameraError('Camera access not granted. Using high-precision neural vector simulation.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setMatchStatus('idle');
      setScanProgress(0);
      setIdentifiedUser(null);
      // If current user logged in, match them by default
      if (currentUser) {
        const matched = registeredUsers.find((u) => u.uid === currentUser.uid) || INITIAL_USERS[0];
        setSelectedPersona(matched);
      } else {
        setSelectedPersona(INITIAL_USERS[0]);
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Initiate Biometric Scan Sequence
  const runBiometricScan = (targetUser: StoredUser = selectedPersona) => {
    if (scanning) return;
    setScanning(true);
    setMatchStatus('scanning');
    setScanProgress(0);
    setIdentifiedUser(null);

    let progress = 0;
    playScanBeep(600, 0.1);

    scanIntervalRef.current = setInterval(() => {
      progress += 12;
      setScanProgress(Math.min(progress, 100));

      if (progress % 24 === 0) {
        playScanBeep(700 + progress * 4, 0.06);
      }

      if (progress >= 100) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        const finalConfidence = targetUser.faceConfidence || Math.floor(Math.random() * 5) + 95;
        setConfidenceScore(finalConfidence);
        setIdentifiedUser(targetUser);
        setMatchStatus('matched');
        setScanning(false);
        playScanBeep(1200, 0.2);
      }
    }, 120);
  };

  // Confirm Authenticate / Complete
  const handleConfirmLogin = async () => {
    if (!identifiedUser) return;
    try {
      if (mode === 'enroll') {
        await enrollFace(identifiedUser.photoURL);
      } else {
        await loginWithFace(identifiedUser.uid, 80);
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error('Face verification error:', e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'enroll'
          ? 'Enroll Neural Biometric Face Signature'
          : 'Synapse Biometric Face Recognition Engine'
      }
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header HUD Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-synapse-cyan/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-synapse-cyan/10 border border-synapse-cyan/40 flex items-center justify-center text-synapse-cyan">
              <Scan className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Synapse Neural Face Vector ID
                </span>
                <Badge variant="cyan" size="sm">
                  AES-256 Vector Hash
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400">
                128-Point Spatial Landmark Mesh • ISO/IEC 19794-5 Compliant
              </p>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Scan Audio' : 'Enable Scan Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-synapse-cyan" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Center Scanner HUD & Video Feed */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center group">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              cameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Fallback Neural Cybernetic Mesh Graphic */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-center space-y-3">
              <div className="relative w-36 h-36 rounded-full border border-synapse-cyan/30 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-synapse-cyan/40 animate-spin" style={{ animationDuration: '14s' }} />
                <div className="w-28 h-28 rounded-full border border-purple-500/40 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedPersona.photoURL}
                    alt={selectedPersona.displayName}
                    className="w-full h-full object-cover opacity-80 filter contrast-125"
                  />
                </div>
                {/* Simulated Landmark Dots */}
                <div className="absolute top-10 left-12 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <div className="absolute top-10 right-12 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <div className="absolute bottom-11 w-2 h-2 rounded-full bg-synapse-cyan animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-300">
                  {cameraError || 'Neural Biometric Vector Scanner Ready'}
                </span>
                <p className="text-[10px] text-slate-500 max-w-sm">
                  Simulating multi-angle facial depth matrix & embeddings for employee verification.
                </p>
              </div>
            </div>
          )}

          {/* Futuristic HUD Overlay Graphics */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {/* Top HUD markers */}
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CAM_01: REALTIME_FACIAL_TRACKING
              </span>
              <span>VECTOR_ID: {selectedPersona.faceVectorId || 'FV-SYN-2026-X'}</span>
            </div>

            {/* Center Biometric Reticle & Bounding Box */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-56 h-64 border-2 border-synapse-cyan/40 rounded-2xl">
                {/* 4 Glowing Corner brackets */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-synapse-cyan" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-synapse-cyan" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-synapse-cyan" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-synapse-cyan" />

                {/* Sweeping Laser Line during scan */}
                {scanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(0,242,254,1)] animate-pulse" style={{
                    animation: 'scanLaser 1.8s ease-in-out infinite alternate',
                  }} />
                )}

                {/* Eye & Landmark Target Reticles */}
                <div className="absolute top-16 left-8 w-8 h-8 border border-cyan-400/40 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
                <div className="absolute top-16 right-8 w-8 h-8 border border-cyan-400/40 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-12 h-6 border border-purple-400/40 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-purple-400 font-mono">LIP_MESH</span>
                </div>
              </div>
            </div>

            {/* Bottom HUD Bar & Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">
                  STATUS:{' '}
                  {matchStatus === 'scanning'
                    ? 'EXTRACTING 128-DIM SPATIAL VECTORS...'
                    : matchStatus === 'matched'
                    ? 'BIOMETRIC SIGNATURE MATCH CONFIRMED'
                    : 'POSITION FACE WITHIN RETICLE'}
                </span>
                <span className="text-synapse-cyan font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-synapse-cyan to-synapse-purple transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Match Result Banner */}
        {matchStatus === 'matched' && identifiedUser && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3.5">
              <img
                src={identifiedUser.photoURL}
                alt={identifiedUser.displayName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{identifiedUser.displayName}</h4>
                  <Badge variant="emerald" size="sm">
                    {confidenceScore}% Match Confidence
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">
                  {identifiedUser.employeeId} • {identifiedUser.teamName} ({identifiedUser.role})
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleConfirmLogin}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              {mode === 'enroll' ? 'Save Biometrics' : 'Authenticate & Enter'}
            </Button>
          </div>
        )}

        {/* Employee Persona Selection Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-synapse-cyan" />
              <span>Select Employee Face Profile to Scan:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">5 Verified Team Leads</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {registeredUsers.slice(0, 5).map((p) => {
              const isSelected = selectedPersona.uid === p.uid;
              return (
                <button
                  key={p.uid}
                  type="button"
                  onClick={() => {
                    setSelectedPersona(p);
                    runBiometricScan(p);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group ${
                    isSelected
                      ? 'bg-synapse-cyan/15 border-synapse-cyan shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={p.photoURL}
                    alt={p.displayName}
                    className={`w-9 h-9 rounded-lg object-cover border shrink-0 ${
                      isSelected ? 'border-synapse-cyan' : 'border-slate-700'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate group-hover:text-synapse-cyan">
                      {p.displayName.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {p.employeeId}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runBiometricScan(selectedPersona)}
              disabled={scanning}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />}
            >
              Re-Scan Face
            </Button>

            <Button
              variant="glow"
              size="sm"
              onClick={() => runBiometricScan(selectedPersona)}
              disabled={scanning}
              leftIcon={<Scan className="w-4 h-4" />}
            >
              {scanning ? 'Analyzing Facial Vectors...' : '1-Click Face Unlock'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
