'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/types';
import { Badge, Button, Card, CardContent, Input, Spinner } from '@/components/ui';
import { formatDate, formatCurrency, formatElapsed } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_BADGE: Record<string, any> = {
  PendingPayment: 'warning', Confirmed: 'success',
  CheckedIn: 'info', Completed: 'secondary', Cancelled: 'secondary',
};

export default function HostBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Booking | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!session) return;
    bookingApi.all(session.accessToken).then(res => {
      if (res.success) setBookings(res.data?.items ?? []);
      setLoading(false);
    });
  }, [session]);

  async function handleLookup() {
    if (!session || code.length !== 8) return;
    const res = await bookingApi.lookup(session.accessToken, code.toUpperCase());
    if (res.success && res.data) setLookupResult(res.data);
    else toast.error('Confirmation code not found');
  }

  async function handleCheckIn(id: string) {
    if (!session) return;
    setCheckingIn(true);
    const res = await bookingApi.checkIn(session.accessToken, id);
    setCheckingIn(false);
    if (res.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CheckedIn' } : b));
      setLookupResult(null);
      setCode('');
      toast.success('Guest checked in successfully');
    } else {
      toast.error((res as any).error?.message ?? 'Check-in failed');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {bookings.filter(b => b.status === 'Confirmed').length} confirmed · {' '}
          {bookings.filter(b => b.status === 'CheckedIn').length} checked in
        </p>
      </div>

      {/* Check in by code */}
      <Card className="mb-6 border-teal-200 bg-teal-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-teal-900 mb-3">🔑 Check In Guest by Code</h3>
          <div className="flex gap-3">
            <Input
              className="max-w-48 font-mono uppercase tracking-widest"
              placeholder="A3FX92KL"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setLookupResult(null); }}
              maxLength={8}
            />
            <Button
              onClick={handleLookup}
              disabled={code.length !== 8}
              variant="default"
            >
              Look Up
            </Button>
          </div>

          {/* Lookup result */}
          {lookupResult && (
            <div className="mt-3 p-4 bg-white rounded-lg border flex items-center justify-between">
              <div>
                <div className="font-semibold">{lookupResult.guestName ?? 'Guest'}</div>
                <div className="text-sm text-muted-foreground">
                  {lookupResult.roomTypeName} · {formatDate(lookupResult.checkInDate)} → {formatDate(lookupResult.checkOutDate)}
                </div>
                <div className="text-sm font-medium mt-1">{formatCurrency(lookupResult.totalAmount)}</div>
                <Badge variant={STATUS_BADGE[lookupResult.status] ?? 'secondary'} className="mt-1">
                  {lookupResult.status}
                </Badge>
              </div>
              {lookupResult.status === 'Confirmed' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleCheckIn(lookupResult.id)}
                  disabled={checkingIn}
                >
                  {checkingIn ? <Spinner className="h-4 w-4" /> : '✓ Check In'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {['Code', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payout', ''].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs font-bold text-primary">
                    {booking.confirmationCode ?? '—'}
                  </td>
                  <td className="p-3 font-medium">{booking.guestName ?? '—'}</td>
                  <td className="p-3 text-sm text-muted-foreground">{booking.roomTypeName}</td>
                  <td className="p-3 text-xs font-mono">{formatDate(booking.checkInDate, 'dd MMM')}</td>
                  <td className="p-3 text-xs font-mono">{formatDate(booking.checkOutDate, 'dd MMM')}</td>
                  <td className="p-3 text-sm font-medium">{formatCurrency(booking.totalAmount)}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_BADGE[booking.status] ?? 'secondary'}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {booking.paidAt
                      ? (() => {
                          const daysAgo = Math.floor(
                            (Date.now() - new Date(booking.paidAt).getTime()) / 86400000
                          );
                          if (daysAgo >= 3) return (
                            <span className="text-green-600 font-medium">Payout initiated</span>
                          );
                          return (
                            <span className="text-amber-600">
                              {3 - daysAgo}d until payout
                            </span>
                          );
                        })()
                      : <span className="text-gray-400">Awaiting payment</span>
                    }
                  </td>
                  <td className="p-3">
                    {booking.status === 'Confirmed' && (
                      <Button variant="outline" size="sm"
                        onClick={() => handleCheckIn(booking.id)}>
                        Check In
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No bookings yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
