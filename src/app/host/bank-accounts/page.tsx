'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { bankApi } from '@/lib/api';
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle,
  Input, Label, Select, Spinner,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2, ShieldCheck, AlertCircle, CreditCard } from 'lucide-react';

interface Bank { code: string; name: string; }
interface BankAccount {
  id: string; bankCode: string; bankName: string;
  accountNumber: string; accountName: string;
  isActive: boolean; createdAt: string;
}
interface VerifyResult { accountName: string; accountNumber: string; bankName: string; }

export default function HostBankAccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verified, setVerified] = useState<VerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      bankApi.getBanks(session.accessToken),
      bankApi.list(session.accessToken),
    ]).then(([banksRes, accountsRes]) => {
      if (banksRes.success) setBanks((banksRes.data as any) ?? []);
      if (accountsRes.success) setAccounts((accountsRes.data as any) ?? []);
      setLoading(false);
    });
  }, [session]);

  // Reset verification when inputs change
  useEffect(() => { setVerified(null); }, [bankCode, accountNumber]);

  async function handleVerify() {
    if (accountNumber.length !== 10) {
      toast.error('Account number must be exactly 10 digits');
      return;
    }
    if (!bankCode) { toast.error('Select a bank first'); return; }
    setVerifying(true);
    const res = await bankApi.verify(session!.accessToken, { bankCode, accountNumber });
    setVerifying(false);
    if (res.success) {
      setVerified(res.data as VerifyResult);
      toast.success(`Verified: ${(res.data as VerifyResult).accountName}`);
    } else {
      toast.error((res as any).error?.message ?? 'Verification failed — check the account number');
    }
  }

  async function handleSave() {
    if (!verified) { toast.error('Verify the account first'); return; }
    setSaving(true);
    const res = await bankApi.add(session!.accessToken, { bankCode, accountNumber });
    setSaving(false);
    if (res.success) {
      setAccounts(prev => [res.data as BankAccount, ...prev]);
      setBankCode(''); setAccountNumber(''); setVerified(null);
      toast.success('Bank account saved');
    } else {
      toast.error((res as any).error?.message ?? 'Failed to save account');
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    const res = await bankApi.remove(session!.accessToken, id);
    setRemoving(null);
    if (res.success) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success('Bank account removed');
    } else {
      toast.error((res as any).error?.message ?? 'Could not remove — pending transfers may exist');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bank Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Payouts for confirmed bookings are transferred 3 days after payment
        </p>
      </div>

      {/* How payouts work */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-1">How payouts work</div>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
              <li>Guest pays via Paystack — funds held by Paystack</li>
              <li>3-day hold period for dispute resolution</li>
              <li>Nexum automatically initiates transfer to your account</li>
              <li>You receive a confirmation email with the transfer code</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Add account form */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Bank Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank selector */}
          <div>
            <Label className="mb-1 block">Bank</Label>
            <Select value={bankCode} onChange={e => setBankCode(e.target.value)}>
              <option value="">Select your bank...</option>
              {banks.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </Select>
          </div>

          {/* Account number */}
          <div>
            <Label className="mb-1 block">Account Number</Label>
            <div className="flex gap-2">
              <Input
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="0123456789"
                className="font-mono tracking-widest"
                maxLength={10}
              />
              <Button
                variant="outline"
                onClick={handleVerify}
                disabled={verifying || accountNumber.length !== 10 || !bankCode}
              >
                {verifying ? <Spinner className="h-4 w-4" /> : 'Verify'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Must be exactly 10 digits (Nigerian NUBAN format)
            </p>
          </div>

          {/* Verification result */}
          {verified && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-800">{verified.accountName}</div>
                <div className="text-sm text-green-700">
                  {verified.bankName || banks.find(b => b.code === bankCode)?.name} · {verified.accountNumber}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  ✓ Account verified — confirm this is correct before saving
                </div>
              </div>
            </div>
          )}

          {/* Save button — only shown after verification */}
          {verified && (
            <Button onClick={handleSave} loading={saving}>
              Save Bank Account
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Saved accounts */}
      <h2 className="font-semibold mb-3">Saved Accounts ({accounts.length})</h2>
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No bank accounts saved yet</p>
            <p className="text-xs mt-1">Add one above to receive payouts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map(account => (
            <Card key={account.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Bank icon placeholder */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                    🏦
                  </div>
                  <div>
                    <div className="font-semibold">{account.accountName}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.bankName} · ••••{account.accountNumber.slice(-4)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Added {formatDate(account.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">Verified</Badge>
                  <button
                    onClick={() => handleRemove(account.id)}
                    disabled={removing === account.id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    {removing === account.id
                      ? <Spinner className="h-4 w-4" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Warning if no accounts */}
      {accounts.length === 0 && (
        <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Without a saved bank account, payouts cannot be processed. Add your account before your first booking is confirmed.
          </p>
        </div>
      )}
    </div>
  );
}
