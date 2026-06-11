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

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Booking | null>(null);

  useEffect(() => {
    if (!session) return;
    bookingApi.all(session.accessToken).then(res => {
      if (res.success) setBookings(res.data?.items ?? []);
      setLoading(false);
    });
  }, [session]);

  async function handleLookup() {
    if (!session || !lookupCode) return;
    const res = await bookingApi.lookup(session.accessToken, lookupCode.toUpperCase());
    if (res.success && res.data) setLookupResult(res.data);
    else toast.error('Confirmation code not found');
  }

  async function handleCheckIn(id: string) {
    if (!session) return;
    const res = await bookingApi.checkIn(session.accessToken, id);
    if (res.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CheckedIn' } : b));
      setLookupResult(null);
      setLookupCode('');
      toast.success('Guest checked in successfully');
    } else toast.error(res.error?.message ?? 'Check-in failed');
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          {bookings.filter(b => b.status === 'Confirmed').length} confirmed · {' '}
          {bookings.filter(b => b.status === 'PendingPayment').length} pending payment
        </p>
      </div>

      {/* Check-in by code */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-blue-900">🔑 Check In Guest by Confirmation Code</h3>
          <div className="flex gap-3">
            <Input
              className="max-w-48 font-mono uppercase tracking-widest"
              placeholder="A3FX92KL"
              value={lookupCode}
              onChange={e => setLookupCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <Button onClick={handleLookup} disabled={lookupCode.length !== 8}>
              Look Up
            </Button>
          </div>
          {lookupResult && (
            <div className="mt-3 p-3 bg-white rounded-lg border flex items-center justify-between">
              <div>
                <div className="font-medium">{lookupResult.guestName}</div>
                <div className="text-sm text-muted-foreground">
                  {lookupResult.roomTypeName} · {formatDate(lookupResult.checkInDate)} → {formatDate(lookupResult.checkOutDate)}
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700"
                onClick={() => handleCheckIn(lookupResult.id)}>
                Confirm Check-In
              </Button>
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
                {['Code', 'Guest', 'Property', 'Check-in', 'Check-out', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {booking.confirmationCode ?? '—'}
                  </td>
                  <td className="p-3 font-medium">{booking.guestName ?? booking.guestId.slice(0, 8)}</td>
                  <td className="p-3 text-sm text-muted-foreground">{booking.propertyName ?? '—'}</td>
                  <td className="p-3 text-xs font-mono">{formatDate(booking.checkInDate, 'dd MMM')}</td>
                  <td className="p-3 text-xs font-mono">{formatDate(booking.checkOutDate, 'dd MMM')}</td>
                  <td className="p-3 text-sm">{formatCurrency(booking.totalAmount)}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_BADGE[booking.status] ?? 'secondary'}>
                      {booking.status === 'PendingPayment'
                        ? `Pending · ${formatElapsed(booking.createdAt)}`
                        : booking.status}
                    </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
