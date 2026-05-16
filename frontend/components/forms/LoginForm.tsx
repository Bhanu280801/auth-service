'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, getAuthErrorMessage, isTwoFactorRequiredError } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

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

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  totp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { setAuthenticated, setUser } = useAuthStore();
  const [requiresTwoFactor, setRequiresTwoFactor] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      totp: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      setAuthenticated(true);
      
      // Fetch user profile right after login
      try {
        const profileData = await authService.getProfile();
        setUser(profileData.user);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
      
      toast.success('Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      if (isTwoFactorRequiredError(error)) {
        setRequiresTwoFactor(true);
        toast.message('Enter your authenticator code to continue');
        return;
      }

      toast.error(getAuthErrorMessage(error, 'Login failed'));
    },
  });

  function onSubmit(values: FormValues) {
    if (requiresTwoFactor && !values.totp) {
      form.setError('totp', {
        type: 'manual',
        message: 'Enter your 6-digit authenticator code',
      });
      return;
    }

    mutate({
      email: values.email,
      password: values.password,
      ...(requiresTwoFactor ? { totp: values.totp } : {}),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {requiresTwoFactor && (
          <FormField
            control={form.control}
            name="totp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authenticator Code</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {requiresTwoFactor ? 'Verify & Sign In' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
