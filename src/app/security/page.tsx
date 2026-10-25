'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  LogOut,
  Trash2,
  Plus,
  User,
  Scan,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';
import { revokeUserSession } from '@/lib/auth/usersDb';
import { PasskeyModal } from '@/components/auth/PasskeyModal';
import { FaceRecognitionModal } from '@/components/auth/FaceRecognitionModal';

export default function SecurityAndPasskeysPage() {
  const { user, session, removePasskey, revokeSession } = useAuth();
  const [activeTab, setActiveTab] = useState<'sessions' | 'passkeys' | 'faceid'>('sessions');
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [faceModalMode, setFaceModalMode] = useState<'enroll' | 'verify'>('enroll');

  const handleRevokeSession = async (sessionId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to terminate this workstation session?')) {
      await revokeSession(sessionId);
      revokeUserSession(user.uid, sessionId);
    }
  };

  const handleRemovePasskey = async (passkeyId: string) => {
    if (confirm('Are you sure you want to remove this hardware passkey?')) {
      await removePasskey(passkeyId);
    }
  };

  const currentUserSessions = user?.activeSessions || [];
  const currentUserPasskeys = user?.passkeys || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-800 text-left bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Profile & Security Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Security & Passkeys
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage active device sessions, Face-API.js neural biometrics, and WebAuthn hardware passkeys bound to your profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              setFaceModalMode('enroll');
              setIsFaceModalOpen(true);
            }}
            variant="outline"
            size="sm"
            leftIcon={<Scan className="w-4 h-4 text-sky-600" />}
          >
            Enroll Face ID
          </Button>

          <Button
            onClick={() => setIsPasskeyModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Enroll Passkey
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      {user && (
        <Card className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'CS'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.displayName}</h3>
              <p className="text-xs text-slate-500">{user.email} • {user.role}</p>
            </div>
          </div>

          <Badge variant="cyan" size="md">
            {user.teamName}
          </Badge>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-white border border-slate-200 text-sky-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Sessions ({currentUserSessions.length})
        </button>

        <button
          onClick={() => setActiveTab('passkeys')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'passkeys'
              ? 'bg-white border border-slate-200 text-sky-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Passkeys ({currentUserPasskeys.length})
        </button>

        <button
          onClick={() => setActiveTab('faceid')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'faceid'
              ? 'bg-white border border-slate-200 text-sky-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scan className="w-3.5 h-3.5 text-sky-600" />
          <span>Biometric Face ID ({user?.faceId ? 'Enrolled' : 'Not Enrolled'})</span>
        </button>
      </div>

      {/* TAB 1: Active Sessions */}
      {activeTab === 'sessions' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Active Sessions</h3>
              <p className="text-xs text-slate-500">Authorized device sessions for your account</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentUserSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active sessions found.
              </div>
            ) : (
              currentUserSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-sky-600" />
                      <span className="font-bold text-slate-900">{sess.device}</span>
                      {sess.isCurrent && <Badge variant="emerald" size="sm">Current Session</Badge>}
                      <span className="text-[10px] font-mono text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {sess.authMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Location: {sess.location} • Login: {new Date(sess.loginTime).toLocaleString()}
                    </p>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      leftIcon={<LogOut className="w-3.5 h-3.5" />}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: Passkeys */}
      {activeTab === 'passkeys' && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">WebAuthn Hardware Passkeys</h3>
              <p className="text-xs text-slate-500">Bound platform authenticators (Windows Hello, Touch ID, YubiKeys)</p>
            </div>

            <Button
              onClick={() => setIsPasskeyModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Enroll Passkey
            </Button>
          </div>

          <div className="space-y-3">
            {currentUserPasskeys.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                <KeyRound className="w-8 h-8 mx-auto text-slate-400" />
                <p>No passkeys registered for your account yet.</p>
                <Button variant="outline" size="sm" onClick={() => setIsPasskeyModalOpen(true)}>
                  Register Passkey
                </Button>
              </div>
            ) : (
              currentUserPasskeys.map((pk) => (
                <div key={pk.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{pk.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {pk.os} • {pk.browser}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Registered: {new Date(pk.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemovePasskey(pk.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Remove passkey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: Biometric Face ID */}
      {activeTab === 'faceid' && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Biometric Face Recognition (Face-API.js)</h3>
              <p className="text-xs text-slate-500">
                128-Dimensional facial vector embedding stored in encrypted Synapse vault for Zero-Trust verification.
              </p>
            </div>

            <Badge variant={user?.faceId ? 'emerald' : 'amber'} size="md">
              {user?.faceId ? 'Biometrics Enrolled' : 'Enrollment Required'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status & Vector Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                Enrolled Biometric Mesh Telemetry
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Profile Holder:</span>
                  <strong className="text-slate-900">{user?.displayName || 'Specialist'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Enrollment Status:</span>
                  <Badge variant={user?.faceId ? 'emerald' : 'slate'} size="sm">
                    {user?.faceId ? 'Vector Stored in DB' : 'Not Configured'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vector Hash:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[200px]">
                    {user?.faceId?.vectorHash || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Enrolled Device Camera:</span>
                  <span className="text-slate-700">{user?.faceId?.deviceCamera || 'HD Camera'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vector Dimensions:</span>
                  <span className="font-mono text-sky-700 font-bold">128 Float32 Coordinates</span>
                </div>
              </div>
            </div>

            {/* Actions & Verification Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Real-time Biometric Scanner</h4>
                <p className="text-slate-500 text-[11px] mt-1">
                  Scan your live face using your webcam. If the Euclidean distance is less than 0.52, the system confirms your identity and grants access.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setFaceModalMode('enroll');
                    setIsFaceModalOpen(true);
                  }}
                  variant="primary"
                  className="w-full py-2.5 font-bold"
                  leftIcon={<Scan className="w-4 h-4" />}
                >
                  {user?.faceId ? 'Re-Scan & Update Face ID' : 'Enroll Face ID (WebCam Scan)'}
                </Button>

                <Button
                  onClick={() => {
                    setFaceModalMode('verify');
                    setIsFaceModalOpen(true);
                  }}
                  variant="outline"
                  className="w-full py-2.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                >
                  Test Live Face Match (Euclidean Distance Check)
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Real Face Recognition Scanner Modal */}
      <FaceRecognitionModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        mode={faceModalMode}
        targetEmail={user?.email}
        onSuccess={() => {}}
      />
    </div>
  );
}
