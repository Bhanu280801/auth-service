'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { setAuthenticated, setUser } = useAuthStore();
  const [requiresTwoFactor, setRequiresTwoFactor] = React.useState(false);

  React.useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      Cookies.set('accessToken', token);
      Cookies.set('refreshToken', refreshToken);
      setAuthenticated(true);

      const fetchProfile = async () => {
        try {
          const profileData = await authService.getProfile();
          setUser(profileData.user);
          toast.success('Logged in with Google successfully');
          router.push('/dashboard');
        } catch (err) {
          console.error('Failed to fetch profile', err);
          toast.error('Failed to authenticate Google user');
        }
      };

      fetchProfile();
    }
  }, [searchParams, setAuthenticated, setUser, router]);

  const handleGoogleLogin = () => {
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    window.location.href = googleAuthUrl;
  };

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

      {!requiresTwoFactor && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Sign in with Google
          </Button>
        </>
      )}
    </Form>
  );
}
