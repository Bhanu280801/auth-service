'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, getAuthErrorMessage } from '@/services/auth.service';
import { toast } from 'sonner';
import { useState } from 'react';

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

const emailSchema = z.object({ email: z.string().email('Invalid email address') });
const otpSchema = z.object({ otp: z.string().length(6, 'OTP must be 6 characters') });
const resetSchema = z.object({ password: z.string().min(6, 'Password must be at least 6 characters') });

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');

  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) });
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStep(2);
      toast.success('OTP sent to your email');
    },
    onError: (err: unknown) => toast.error(getAuthErrorMessage(err, 'Failed to send OTP'))
  });

  const verifyMutation = useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: () => {
      setStep(3);
      toast.success('OTP verified');
    },
    onError: (err: unknown) => toast.error(getAuthErrorMessage(err, 'Invalid OTP'))
  });

  const resetMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully. You can now login.');
      router.push('/login');
    },
    onError: (err: unknown) => toast.error(getAuthErrorMessage(err, 'Failed to reset password'))
  });

  return (
    <div className="space-y-4">
      {step === 1 && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit((v) => forgotMutation.mutate(v))} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
              {forgotMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit((v) => verifyMutation.mutate({ email, otp: v.otp }))} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} maxLength={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify OTP
            </Button>
          </form>
        </Form>
      )}

      {step === 3 && (
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit((v) => resetMutation.mutate({ email, newPassword: v.password }))} className="space-y-4">
            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
