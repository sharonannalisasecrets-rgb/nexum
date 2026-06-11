'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usersApi } from '@/lib/api';
import { Badge, Button, Card, CardContent, Input, Label, Select, Spinner } from '@/components/ui';
import { roleName } from '@/lib/utils';
import { toast } from 'sonner';

const ROLE_BADGE: Record<string, any> = {
  worshipper: 'info',
  medical_officer: 'destructive',
  security_officer: 'warning',
  driver: 'secondary',
  admin: 'default',
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'medical_officer', phoneNumber: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;
    usersApi.list(session.accessToken).then(res => {
      if (res.success) setUsers((res.data as any)?.items ?? []);
      setLoading(false);
    });
  }, [session]);

  async function createUser() {
    if (!session) return;
    setSubmitting(true);
    const res = await usersApi.create(session.accessToken, form);
    if (res.success) {
      setUsers(prev => [(res.data as any), ...prev]);
      setShowCreate(false);
      setForm({ fullName: '', email: '', role: 'medical_officer', phoneNumber: '' });
      toast.success('User created. Welcome email sent.');
    } else toast.error(res.error?.message ?? 'Failed to create user');
    setSubmitting(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} total users</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Add Officer / Driver</Button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <Card className="mb-6 border-blue-200">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Create Officer or Driver Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Full Name</Label>
                <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Dr. Kemi Adeyemi" />
              </div>
              <div>
                <Label className="mb-1 block">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="kemi@nexum.ng" />
              </div>
              <div>
                <Label className="mb-1 block">Role</Label>
                <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="medical_officer">Medical Officer</option>
                  <option value="security_officer">Security Officer</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Phone (optional)</Label>
                <Input value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="+2348012345678" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={createUser} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Account'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {['Name', 'Email', 'Role', 'Phone', 'Emergency Contact', ''].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.fullName}</td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{user.email}</td>
                  <td className="p-3">
                    <Badge variant={ROLE_BADGE[user.role] ?? 'secondary'}>
                      {roleName(user.role)}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{user.phoneNumber ?? '—'}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {user.emergencyContactName
                      ? `${user.emergencyContactName} · ${user.emergencyContactPhone}`
                      : '—'}
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
