'use client';

import Link from 'next/link';
import { Activity, CheckCircle2, KeyRound, MailCheck, ShieldCheck, UserCog } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const securityItems = [
  {
    title: 'Email verification',
    description: 'Required before sensitive account actions.',
    icon: MailCheck,
  },
  {
    title: 'Password protection',
    description: 'Update your password from account settings.',
    icon: KeyRound,
  },
  {
    title: 'Two-factor login',
    description: 'Add a time-based code for stronger sign in.',
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const accountChecks = [
    {
      label: 'Email verified',
      value: user?.isVerified ? 'Enabled' : 'Pending',
      active: !!user?.isVerified,
    },
    {
      label: 'Two-factor authentication',
      value: user?.isTwoFactorEnabled ? 'Enabled' : 'Not enabled',
      active: !!user?.isTwoFactorEnabled,
    },
    {
      label: 'Role',
      value: user?.role || 'user',
      active: true,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your account access, security status, and recent authentication activity.
          </p>
        </div>
        <Link href="/profile">
          <Button>
            <UserCog className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {accountChecks.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <CheckCircle2 className={item.active ? 'h-4 w-4 text-emerald-600' : 'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold capitalize">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Security Checklist</CardTitle>
            <CardDescription>Keep these controls in good shape for a safer account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {securityItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-md border p-4">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <h2 className="text-sm font-medium">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest known auth event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Signed in to this dashboard</p>
                <p className="text-sm text-muted-foreground">Current session</p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="w-full">Manage Security</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
