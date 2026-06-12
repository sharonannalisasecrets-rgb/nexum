'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await authApi.forgotPassword(email); // Always 200
    setLoading(false);
    setStep('otp');
    toast.info('If that email is registered, a code has been sent');
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await authApi.verifyOtp({ email, otp }) as any;
    setLoading(false);
    if (res.success) {
      setResetToken(res.data);
      setStep('reset');
    } else {
      toast.error(res.error?.message ?? 'Invalid or expired code');
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const res = await authApi.resetPassword({ resetToken, newPassword: password }) as any;
    setLoading(false);
    if (res.success) setStep('done');
    else toast.error(res.error?.message ?? 'Reset failed');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A6B] to-[#2563EB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-8 w-8 text-blue-200" />
            <span className="text-2xl font-bold text-white">Nexum</span>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            {step === 'email' && (
              <>
                <h2 className="text-xl font-bold mb-1">Forgot Password</h2>
<p className="text-sm text-muted-foreground mb-5">
                  Enter your email and we&apos;ll send a reset code
                </p>
                <form onSubmit={submitEmail} className="space-y-4">
                  <div>
                    <Label className="mb-1 block">Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="adebayo@example.com" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <h2 className="text-xl font-bold mb-1">Enter Code</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Check your email for a 6-digit code
                </p>
                <form onSubmit={submitOtp} className="space-y-4">
                  <div>
                    <Label className="mb-1 block">Reset Code</Label>
                    <Input value={otp} onChange={e => setOtp(e.target.value)}
                      placeholder="123456" maxLength={6} className="font-mono text-center text-xl tracking-widest" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>
              </>
            )}

            {step === 'reset' && (
              <>
                <h2 className="text-xl font-bold mb-1">New Password</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose a strong password</p>
                <form onSubmit={submitReset} className="space-y-4">
                  <div>
                    <Label className="mb-1 block">New Password</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" minLength={8} required />
                  </div>
                  <div>
                    <Label className="mb-1 block">Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </>
            )}

            {step === 'done' && (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-xl font-bold mb-2">Password Reset</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your password has been updated successfully
                </p>
                <Link href="/login">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </div>
            )}

            {step !== 'done' && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
