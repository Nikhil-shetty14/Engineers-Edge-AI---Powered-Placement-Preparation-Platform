'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Verify Your Email</CardTitle>
          <CardDescription>
            A verification link has been sent to your email address. Please
            check your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
                Once verified, you can{' '}
                <Link href="/" className="font-semibold text-primary hover:underline">
                log in
                </Link>
                .
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
