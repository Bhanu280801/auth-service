'use client';

import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';
import { TwoFactorSetup } from '@/components/forms/TwoFactorSetup';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
      </div>
      <Separator />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal information that you use to log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-lg font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-lg font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <p className="text-lg font-medium">{user?.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Ensure your account is using a long, random password to stay secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <ChangePasswordForm />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two Factor Authentication</CardTitle>
            <CardDescription>
              Add additional security to your account using two factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorSetup />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
