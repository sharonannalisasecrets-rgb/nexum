'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Spinner } from '@/components/ui';
import { bookingApi } from '@/lib/api';
import { Property, RoomType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Session } from 'next-auth';

interface Props {
  property: Property;
  rooms: RoomType[];
  session: Session | null;
}

type Step = 'select' | 'confirm' | 'success';

export function BookingFlow({ property, rooms, session }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const nights = checkIn && checkOut
    ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;
  const total = selectedRoom ? selectedRoom.pricePerNight * nights : 0;

  async function handleBook() {
    if (!session) {
      // Redirect to login with callback
      router.push(`/login?callbackUrl=/properties/${property.id}`);
      return;
    }
    if (!selectedRoom || !checkIn || !checkOut || nights <= 0) {
      toast.error('Please select a room and valid dates');
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingApi.create(session.accessToken, {
        propertyId: property.id,
        roomTypeId: selectedRoom.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount: total,
      });

      if (res.success && res.data) {
        // Poll for confirmation code (set by Paystack webhook)
        // In real flow, redirect to Paystack; here we show booking pending
        setConfirmationCode(res.data.confirmationCode ?? '');
        setStep('success');
        toast.success('Booking created — complete payment to confirm');
      } else {
        toast.error(res.error?.message ?? 'Booking failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success') {
    return (
      <Card className="sticky top-4">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-bold text-lg mb-1">Booking Received!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete payment to confirm your booking. Your confirmation code will be:
          </p>
          <div className="bg-gray-50 border rounded-xl p-4 mb-4">
            <div className="font-mono text-2xl font-bold tracking-widest text-primary">
              {confirmationCode || '- - - - - - - -'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Show this to the host at check-in</div>
          </div>
          <div className="text-sm space-y-1 text-left bg-blue-50 rounded-lg p-3 mb-4">
            <div><span className="text-muted-foreground">Property:</span> {property.name}</div>
            <div><span className="text-muted-foreground">Room:</span> {selectedRoom?.name}</div>
            <div><span className="text-muted-foreground">Check-in:</span> {formatDate(checkIn)}</div>
            <div><span className="text-muted-foreground">Check-out:</span> {formatDate(checkOut)}</div>
            <div><span className="text-muted-foreground">Total:</span> <strong>{formatCurrency(total)}</strong></div>
          </div>
          <Button className="w-full mb-2" onClick={() => router.push('/worshipper/bookings')}>
            View My Bookings
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setStep('select')}>
            Book Another Room
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Book a Room</CardTitle>
        {!session && (
          <p className="text-xs text-muted-foreground">
            <Link href="/login" className="text-primary underline">Sign in</Link> or{' '}
            <Link href="/register" className="text-primary underline">register</Link> to book
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room selector */}
        <div>
          <Label className="mb-1 block">Select Room</Label>
          <Select
            value={selectedRoom?.id ?? ''}
            onChange={e => setSelectedRoom(rooms.find(r => r.id === e.target.value) ?? null)}
          >
            <option value="">Choose a room type...</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} — {formatCurrency(r.pricePerNight)}/night
              </option>
            ))}
          </Select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Check-in</Label>
            <Input type="date"
              min={new Date().toISOString().split('T')[0]}
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Check-out</Label>
            <Input type="date"
              min={checkIn || new Date().toISOString().split('T')[0]}
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)} />
          </div>
        </div>

        {/* Price summary */}
        {selectedRoom && nights > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {formatCurrency(selectedRoom.pricePerNight)} × {nights} nights
              </span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          disabled={submitting || (!session && false)}
          onClick={handleBook}
        >
          {submitting ? <Spinner className="h-4 w-4" /> :
           !session ? 'Sign in to Book' :
           nights <= 0 ? 'Select Dates' : 'Book Now'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Payment processed securely via Paystack
        </p>
      </CardContent>
    </Card>
  );
}
