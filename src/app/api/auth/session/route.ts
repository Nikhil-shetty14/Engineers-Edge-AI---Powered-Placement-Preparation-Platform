
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const idToken = body.idToken;

  if (!idToken) {
    console.error('Session creation failed: idToken is missing from request body.');
    return NextResponse.json(
      { error: 'idToken is required' },
      { status: 400 }
    );
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const adminApp = getFirebaseAdminApp();
    const auth = getAuth(adminApp);
    const sessionCookie = await auth.createSessionCookie(
      idToken,
      {
        expiresIn,
      }
    );

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Session cookie creation failed:', error.message, 'Code:', error.code);
    return NextResponse.json(
      { error: 'Failed to create session cookie', details: error.message },
      { status: 401 }
    );
  }
}
