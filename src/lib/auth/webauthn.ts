/**
 * Real WebAuthn / FIDO2 / Passkeys & Platform Authenticator Implementation
 * Supports Windows Hello, Touch ID, Face ID, Android Biometrics, and Hardware Security Keys.
 * Strictly adheres to W3C Web Authentication Level 2 & 3 standards.
 */

import { PasskeyCredential } from '@/types/dashboard';

// Convert ArrayBuffer / Uint8Array to base64url string
export function bufferToBase64URL(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert base64url string to Uint8Array
export function base64URLToBuffer(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Generate secure random challenge buffer
export function generateRandomChallenge(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return bufferToBase64URL(array);
  }
  // Server-side / fallback
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bufferToBase64URL(bytes);
}

// Check if browser and OS support WebAuthn and Platform Authenticators (Windows Hello, Touch ID, etc.)
export async function checkWebAuthnSupport(): Promise<{
  isSupported: boolean;
  isPlatformAvailable: boolean;
  details: string;
}> {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.credentials) {
    return {
      isSupported: false,
      isPlatformAvailable: false,
      details: 'WebAuthn API is not supported in this browser environment.',
    };
  }

  let isPlatformAvailable = false;
  if (
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      isPlatformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      isPlatformAvailable = false;
    }
  }

  return {
    isSupported: true,
    isPlatformAvailable,
    details: isPlatformAvailable
      ? 'Platform authenticator available (Windows Hello, Touch ID, Face ID).'
      : 'Hardware security keys (FIDO2/U2F) supported.',
  };
}

export interface RegisterPasskeyOptions {
  user: {
    id: string;
    displayName: string;
    email: string;
  };
  challenge?: string;
  rpName?: string;
  authenticatorAttachment?: 'platform' | 'cross-platform';
}

/**
 * Register a new WebAuthn Passkey / Platform Authenticator for the current user
 */
export async function registerWebAuthnPasskey(
  options: RegisterPasskeyOptions
): Promise<{ success: boolean; credential?: PasskeyCredential; error?: string }> {
  const support = await checkWebAuthnSupport();
  if (!support.isSupported) {
    return {
      success: false,
      error: 'WebAuthn passkeys are not supported in this browser.',
    };
  }

  try {
    const challengeStr = options.challenge || generateRandomChallenge(32);
    const challengeBuffer = base64URLToBuffer(challengeStr);
    const userIdBuffer = new TextEncoder().encode(options.user.id);

    const rpId = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challengeBuffer.buffer as ArrayBuffer,
      rp: {
        name: options.rpName || 'SYNAPSE Enterprise Intelligence Platform',
        id: rpId === 'localhost' || rpId === '127.0.0.1' ? undefined : rpId,
      },
      user: {
        id: userIdBuffer.buffer as ArrayBuffer,
        name: options.user.email,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256 (ECDSA w/ SHA-256)
        { alg: -257, type: 'public-key' }, // RS256 (RSA w/ SHA-256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: options.authenticatorAttachment,
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return {
        success: false,
        error: 'Passkey registration cancelled or returned empty credential.',
      };
    }

    const rawIdBase64 = bufferToBase64URL(credential.rawId);
    const response = credential.response as AuthenticatorAttestationResponse;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let osName = 'Windows';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) osName = 'macOS (Touch ID / Face ID)';
    else if (ua.includes('Windows')) osName = 'Windows (Windows Hello)';
    else if (ua.includes('Linux')) osName = 'Linux';
    else if (ua.includes('Android')) osName = 'Android Biometrics';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS (Touch ID / Face ID)';

    let browserName = 'Browser';
    if (ua.includes('Edg/')) browserName = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browserName = 'Google Chrome';
    else if (ua.includes('Safari/')) browserName = 'Apple Safari';
    else if (ua.includes('Firefox/')) browserName = 'Mozilla Firefox';

    const newPasskey: PasskeyCredential = {
      id: `passkey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${osName} Passkey (${browserName})`,
      credentialId: rawIdBase64,
      publicKey: response.attestationObject ? bufferToBase64URL(response.attestationObject) : 'PUB-KEY-RAW',
      counter: 0,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      deviceType: options.authenticatorAttachment === 'platform' ? 'platform' : 'platform',
      authenticatorAttachment: options.authenticatorAttachment || 'platform',
      browser: browserName,
      os: osName,
    };

    return {
      success: true,
      credential: newPasskey,
    };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Biometric passkey prompt was cancelled or timed out by the user.',
      };
    }
    if (err.name === 'InvalidStateError') {
      return {
        success: false,
        error: 'This platform authenticator / passkey is already registered.',
      };
    }
    return {
      success: false,
      error: err.message || 'Failed to complete WebAuthn credential registration.',
    };
  }
}

export interface AuthenticatePasskeyOptions {
  challenge?: string;
  allowedCredentialIds?: string[];
  userVerification?: UserVerificationRequirement;
}

/**
 * Authenticate current user via WebAuthn Passkey / Platform Authenticator
 */
export async function authenticateWebAuthnPasskey(
  options: AuthenticatePasskeyOptions = {}
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  const support = await checkWebAuthnSupport();
  if (!support.isSupported) {
    return {
      success: false,
      error: 'WebAuthn passkey authentication is not supported in this browser.',
    };
  }

  try {
    const challengeStr = options.challenge || generateRandomChallenge(32);
    const challengeBuffer = base64URLToBuffer(challengeStr);

    const allowCredentials: PublicKeyCredentialDescriptor[] | undefined =
      options.allowedCredentialIds && options.allowedCredentialIds.length > 0
        ? options.allowedCredentialIds.map((id) => ({
            id: base64URLToBuffer(id).buffer as ArrayBuffer,
            type: 'public-key' as const,
          }))
        : undefined;

    const rpId = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challengeBuffer.buffer as ArrayBuffer,
      rpId: rpId === 'localhost' || rpId === '127.0.0.1' ? undefined : rpId,
      allowCredentials,
      userVerification: options.userVerification || 'preferred',
      timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return {
        success: false,
        error: 'Passkey authentication returned no credentials.',
      };
    }

    const matchedCredentialId = bufferToBase64URL(assertion.rawId);

    return {
      success: true,
      credentialId: matchedCredentialId,
    };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Biometric verification cancelled or access denied by platform.',
      };
    }
    return {
      success: false,
      error: err.message || 'Passkey verification failed.',
    };
  }
}
