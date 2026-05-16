import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <div className="max-w-3xl space-y-8 mt-12">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 mb-6">
          The Ultimate Authentication Solution
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Production-grade, secure, and blazing-fast authentication. 
          Built with Next.js 15, React, and Node.js to provide seamless user experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left w-full mb-12">
        <div className="flex flex-col space-y-3 p-6 rounded-2xl bg-card border shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Secure by Default</h3>
          <p className="text-muted-foreground">
            Built-in protection against CSRF, XSS, and brute force attacks. 
            Industry standard encryption for all passwords.
          </p>
        </div>
        <div className="flex flex-col space-y-3 p-6 rounded-2xl bg-card border shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Two-Factor Auth</h3>
          <p className="text-muted-foreground">
            Enhance security with time-based one-time passwords (TOTP).
            Compatible with Google Authenticator and Authy.
          </p>
        </div>
        <div className="flex flex-col space-y-3 p-6 rounded-2xl bg-card border shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Lightning Fast</h3>
          <p className="text-muted-foreground">
            Optimized for performance with Edge-ready architecture and intelligent caching strategies.
          </p>
        </div>
      </div>
    </div>
  );
}
