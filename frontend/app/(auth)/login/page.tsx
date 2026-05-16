import { LoginForm } from '@/components/forms/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email below to log into your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <div className="text-sm text-center text-muted-foreground flex flex-col space-y-2">
            <Link href="/forgot-password" className="hover:text-primary underline underline-offset-4">
              Forgot your password?
            </Link>
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="hover:text-primary underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
