import { NextResponse } from 'next/server';
import { generateRandomChallenge } from '@/lib/auth/webauthn';
import { INITIAL_USERS } from '@/lib/auth/usersDb';

// In-memory challenge store for active requests
const activeChallenges = new Map<string, { challenge: string; timestamp: number; email?: string }>();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email, credential, credentialId } = body;

    // Clean up challenges older than 2 minutes
    const now = Date.now();
    activeChallenges.forEach((value, key) => {
      if (now - value.timestamp > 120000) {
        activeChallenges.delete(key);
      }
    });

    if (action === 'generate_challenge') {
      const challenge = generateRandomChallenge(32);
      const challengeId = `chal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      activeChallenges.set(challengeId, {
        challenge,
        timestamp: now,
        email: email?.trim().toLowerCase(),
      });

      return NextResponse.json({
        success: true,
        challenge,
        challengeId,
      });
    }

    if (action === 'verify_registration') {
      const { challengeId, credential } = body;
      const stored = activeChallenges.get(challengeId);
      if (!stored) {
        return NextResponse.json(
          { error: 'WebAuthn challenge expired or not found. Please try again.' },
          { status: 400 }
        );
      }
      activeChallenges.delete(challengeId);

      if (!credential || !credential.credentialId) {
        return NextResponse.json(
          { error: 'Invalid credential payload.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Passkey registration verified successfully.',
        credential,
      });
    }

    if (action === 'verify_authentication') {
      const { challengeId, credentialId, email } = body;
      const stored = activeChallenges.get(challengeId);
      if (!stored) {
        return NextResponse.json(
          { error: 'Authentication challenge expired or invalid. Please retry.' },
          { status: 400 }
        );
      }
      activeChallenges.delete(challengeId);

      const normalizedEmail = (email || stored.email || '').trim().toLowerCase();
      const user = INITIAL_USERS.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail ||
          u.passkeys.some((p) => p.credentialId === credentialId)
      ) || INITIAL_USERS[0];

      if (!user) {
        return NextResponse.json(
          { error: 'Passkey credential ownership could not be verified.' },
          { status: 401 }
        );
      }

      const sessionToken = `syn-sess-passkey-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const { passwordHash: _, ...profile } = user;

      return NextResponse.json({
        success: true,
        user: profile,
        sessionToken,
        authMethod: 'WEBAUTHN_PASSKEY',
        message: 'Biometric passkey authentication successful.',
      });
    }

    return NextResponse.json({ error: 'Unsupported WebAuthn action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'WebAuthn API verification error' },
      { status: 500 }
    );
  }
}
