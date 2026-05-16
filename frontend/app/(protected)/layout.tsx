'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, setAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!Cookies.get('accessToken') && !user,
  });

  useEffect(() => {
    if (data?.data) {
      setUser(data.data);
      setAuthenticated(true);
    }
  }, [data, setUser, setAuthenticated]);

  useEffect(() => {
    if (isError) {
      logout();
      router.push('/login');
    }
  }, [isError, logout, router]);

  // If we don't have the user yet and we are loading, show a spinner
  if ((isLoading && !user) || (!user && Cookies.get('accessToken'))) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
