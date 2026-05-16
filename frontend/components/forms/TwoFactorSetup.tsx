'use client';

import * as React from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const verifySchema = z.object({
  token: z.string().length(6, 'Token must be exactly 6 digits'),
});

export function TwoFactorSetup() {
  const { user, setUser } = useAuthStore();
  const [qrCode, setQrCode] = useState<string | null>(null);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: '',
    },
  });

  const setupMutation = useMutation({
    mutationFn: authService.setup2FA,
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      toast.success('Scan the QR code with your authenticator app');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to setup 2FA'),
  });

  const verifyMutation = useMutation({
    mutationFn: authService.verify2FA,
    onSuccess: () => {
      toast.success('2FA enabled successfully');
      setQrCode(null);
      if (user) setUser({ ...user, isTwoFactorEnabled: true });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Invalid token'),
  });

  const disableMutation = useMutation({
    mutationFn: authService.disable2FA,
    onSuccess: () => {
      toast.success('2FA disabled successfully');
      if (user) setUser({ ...user, isTwoFactorEnabled: false });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to disable 2FA'),
  });

  if (user?.isTwoFactorEnabled) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Two-factor authentication is currently enabled.</p>
        <Button 
          variant="destructive" 
          onClick={() => {
            const token = prompt('Enter your 2FA token to disable it:');
            if (token) disableMutation.mutate({ token });
          }}
          disabled={disableMutation.isPending}
        >
          {disableMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Disable 2FA
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!qrCode ? (
        <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
          {setupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Setup 2FA
        </Button>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">Scan QR Code</CardTitle>
            <CardDescription>
              Scan this code with Google Authenticator or Authy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center bg-white p-4 rounded-md">
              <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => verifyMutation.mutate({ token: v.token }))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
                  {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
