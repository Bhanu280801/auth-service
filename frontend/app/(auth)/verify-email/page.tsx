import { VerifyEmailForm } from '@/components/forms/VerifyEmailForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Verify Email</CardTitle>
          <CardDescription>
            Please enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
