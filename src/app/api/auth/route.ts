import { NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/auth/usersDb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, displayName, role, organization } = body;

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 401 }
        );
      }

      if (user.passwordHash !== password) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials and try again.' },
          { status: 401 }
        );
      }

      const { passwordHash: _, ...profile } = user;
      const sessionToken = `syn-sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      return NextResponse.json({
        success: true,
        user: profile,
        sessionToken,
        message: 'Authentication successful',
      });
    }

    if (action === 'register') {
      if (!email || !password || !displayName) {
        return NextResponse.json(
          { error: 'Name, email, and password are required.' },
          { status: 400 }
        );
      }

      const sessionToken = `syn-sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const profile = {
        uid: `usr-custom-${Date.now()}`,
        displayName,
        email: email.trim().toLowerCase(),
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: role || 'Enterprise AI Specialist',
        organization: organization || 'Aegis Global Enterprises',
        tokenBalance: 500000,
      };

      return NextResponse.json({
        success: true,
        user: profile,
        sessionToken,
        message: 'Registration successful',
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
