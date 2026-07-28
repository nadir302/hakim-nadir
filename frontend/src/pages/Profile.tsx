import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { profileSchema, changePasswordSchema } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/shared/FileUpload';
import { User, Lock, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState('general');

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' } });
  const passwordForm = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const updateProfile = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (res: any) => { setUser(res.data); toast.success('Profile updated'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const changePassword = useMutation({
    mutationFn: (data: any) => authApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed'); passwordForm.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const onProfileSubmit = (data: any) => updateProfile.mutate(data);
  const onPasswordSubmit = (data: any) => changePassword.mutate(data);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Avatar</CardTitle></CardHeader>
        <CardContent>
          <FileUpload currentUrl={user?.avatar} onUploaded={(url) => { updateProfile.mutate({ avatar: url }); }} />
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>First Name</Label><Input {...profileForm.register('firstName')} /></div>
                  <div><Label>Last Name</Label><Input {...profileForm.register('lastName')} /></div>
                </div>
                <div><Label>Email</Label><Input value={user?.email || ''} disabled className="bg-muted" /></div>
                <div><Label>Role</Label><Input value={user?.role || ''} disabled className="bg-muted" /></div>
                <div><Label>Phone</Label><Input {...profileForm.register('phone')} placeholder="+212 6XX XXX XXX" /></div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div><Label>Current Password</Label><Input type="password" {...passwordForm.register('currentPassword')} /></div>
                <div><Label>New Password</Label><Input type="password" {...passwordForm.register('newPassword')} /></div>
                {passwordForm.formState.errors.newPassword && <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
                <div><Label>Confirm New Password</Label><Input type="password" {...passwordForm.register('confirmPassword')} /></div>
                {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Lock className="mr-1 h-4 w-4" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
