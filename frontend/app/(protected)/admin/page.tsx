'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService, AdminUser } from '@/services/auth.service';
import { toast } from 'sonner';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  Clock,
  Ban,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminPage() {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'blacklist'>('users');

  // Security gate: Redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('Access Denied: Administrator role required');
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Fetch Users Query
  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: authService.getAdminUsers,
    enabled: currentUser?.role === 'admin',
    staleTime: 30000,
  });

  // Fetch Blacklist Query
  const {
    data: blacklistResponse,
    isLoading: blacklistLoading,
  } = useQuery({
    queryKey: ['adminBlacklist'],
    queryFn: authService.getBlacklist,
    enabled: currentUser?.role === 'admin',
    staleTime: 30000,
  });

  // Toggle Role Mutation
  const toggleRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: 'user' | 'admin' }) =>
      authService.updateUserRole(userId, newRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success(data.message || 'User role updated successfully');
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update user role');
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authService.deleteUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success(data.message || 'User deleted successfully');
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center space-y-3">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive animate-pulse" />
          <h2 className="text-xl font-semibold">Authorizing Access...</h2>
          <p className="text-sm text-muted-foreground">Verifying administrative credentials.</p>
        </div>
      </div>
    );
  }

  const users = usersResponse?.data || [];
  const blacklist = blacklistResponse?.data || [];

  // Filtered users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalUsers = users.length;
  const verifiedUsersCount = users.filter((u) => u.isVerified).length;
  const verifiedRate = totalUsers > 0 ? Math.round((verifiedUsersCount / totalUsers) * 100) : 0;
  const mfaEnabledCount = users.filter((u) => u.isTwoFactorEnabled).length;
  const mfaRate = totalUsers > 0 ? Math.round((mfaEnabledCount / totalUsers) * 100) : 0;
  const blacklistedCount = blacklist.length;

  const handleToggleRole = (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    if (confirm(`Are you sure you want to change ${user.name}'s role to ${newRole.toUpperCase()}?`)) {
      toggleRoleMutation.mutate({ userId: user._id, newRole });
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`CRITICAL WARNING: This will permanently delete ${user.name}'s account and invalidate all of their active sessions.\n\nAre you absolutely sure you want to proceed?`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" /> Admin Control Panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage registered user accounts, toggle system authorization, and inspect active blacklisted JWT sessions.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique user accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Email Verification Rate</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{verifiedRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">{verifiedUsersCount} of {totalUsers} verified</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">2FA Adoption Rate</CardTitle>
            <Lock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{mfaRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">{mfaEnabledCount} accounts secured with MFA</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Blacklist Entries</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {blacklistLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{blacklistedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Logged out session tokens</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Users Directory
        </button>
        <button
          onClick={() => setActiveTab('blacklist')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-all flex items-center gap-2 ${
            activeTab === 'blacklist'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ban className="h-4 w-4" />
          Access Token Blacklist
        </button>
      </div>

      {/* Main content grid */}
      <div className="space-y-4">
        {activeTab === 'users' ? (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>
                    Browse all accounts, audit verification credentials, and promote/demote or delete accounts.
                  </CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : usersError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-destructive">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p className="font-medium">Failed to load user directory</p>
                  <p className="text-sm text-muted-foreground mt-1">Please ensure your MongoDB service is running.</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No users found matching search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>System Role</TableHead>
                        <TableHead>Email Verified</TableHead>
                        <TableHead>MFA (2FA)</TableHead>
                        <TableHead>Registered At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const isSelf = user.email === currentUser?.email;
                        return (
                          <TableRow key={user._id} className={isSelf ? 'bg-primary/5 hover:bg-primary/5' : ''}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold text-sm flex items-center gap-1.5">
                                  {user.name} {isSelf && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-normal">You</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                                  user.role === 'admin'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                                }`}
                              >
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.isVerified ? (
                                <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
                                  <UserCheck className="mr-1 h-3.5 w-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs text-muted-foreground font-medium">
                                  <UserX className="mr-1 h-3.5 w-3.5" /> Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.isTwoFactorEnabled ? (
                                <span className="inline-flex items-center text-xs text-primary font-medium">
                                  <Lock className="mr-1 h-3 w-3" /> Enabled
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs text-muted-foreground font-medium">
                                  <Unlock className="mr-1 h-3 w-3" /> Disabled
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isSelf || toggleRoleMutation.isPending}
                                  onClick={() => handleToggleRole(user)}
                                  className="h-8 text-xs font-normal"
                                >
                                  {user.role === 'admin' ? 'Demote' : 'Promote'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isSelf || deleteUserMutation.isPending}
                                  onClick={() => handleDeleteUser(user)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete User</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Logged Out Token Blacklist</CardTitle>
              <CardDescription>
                Audited access tokens of users who explicitly logged out. These invalid JWT signatures are maintained in database memory until expiration to prevent hijacking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blacklistLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : blacklist.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
                  <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="font-medium text-foreground">Blacklist is empty</p>
                  <p className="text-xs">No active access tokens are blacklisted at this time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token Fragment</TableHead>
                        <TableHead>Blacklisted At</TableHead>
                        <TableHead>Expires At</TableHead>
                        <TableHead className="text-right">Security Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blacklist.map((tokenObj, i) => {
                        const isExpired = new Date(tokenObj.expiresAt) < new Date();
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">
                              {tokenObj.token.slice(0, 16)}...{tokenObj.token.slice(-16)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(tokenObj.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground flex items-center gap-1 mt-3">
                              <Clock className="h-3 w-3 text-amber-500" />
                              {new Date(tokenObj.expiresAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  isExpired
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                }`}
                              >
                                {isExpired ? 'Expired' : 'Active Revocation'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
