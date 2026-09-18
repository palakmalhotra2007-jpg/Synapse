'use client';

import React from 'react';
import { PasskeyModal } from './PasskeyModal';

interface FaceRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'verify' | 'enroll' | 'authenticate' | 'register';
  onSuccess?: () => void;
  targetTeamId?: any;
}

/**
 * Deprecated legacy biometric modal wrapper.
 * Redirects seamlessly to the enterprise WebAuthn / Passkey platform authenticator.
 */
export const FaceRecognitionModal: React.FC<FaceRecognitionModalProps> = ({
  isOpen,
  onClose,
  mode = 'authenticate',
  onSuccess,
}) => {
  const passkeyMode = mode === 'enroll' || mode === 'register' ? 'register' : 'authenticate';
  return (
    <PasskeyModal
      isOpen={isOpen}
      onClose={onClose}
      mode={passkeyMode}
      onSuccess={onSuccess}
    />
  );
};
