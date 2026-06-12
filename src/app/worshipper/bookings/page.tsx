import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/types';
import { Badge, Card, CardContent } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';

const STATUS_BADGE: Record<string, any> = {
  PendingPayment: 'warning',
  Confirmed: 'success',
  CheckedIn: 'info',
  Completed: 'secondary',
  Cancelled: 'secondary',
};

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);
  let bookings: any[] = [];
  try {
    const res = await bookingApi.myBookings(session!.accessToken);
    bookings = res.data?.items ?? [];
  } catch { /* backend offline */ }

  const upcoming = bookings.filter(b => b.status === 'Confirmed' || b.status === 'PendingPayment');
  const past = bookings.filter(b => b.status === 'CheckedIn' || b.status === 'Completed');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">{bookings.length} total bookings</p>
        </div>
        <Link href="/properties"
          className="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Book a Property
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-muted-foreground mb-4">No bookings yet</p>
          <Link href="/properties" className="text-primary underline text-sm">
            Browse available properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-3">Upcoming ({upcoming.length})</h2>
              {upcoming.map(booking => <BookingCard key={booking.id} booking={booking} />)}
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-3 mt-6">Past ({past.length})</h2>
              {past.map(booking => <BookingCard key={booking.id} booking={booking} showCode={false} />)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, showCode = true }: { booking: Booking; showCode?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">{booking.propertyName ?? 'Property'}</h3>
              <Badge variant={STATUS_BADGE[booking.status] ?? 'secondary'}>
                {booking.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <div>{booking.roomTypeName}</div>
              <div>
                {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
              </div>
              <div className="font-medium text-foreground">{formatCurrency(booking.totalAmount)}</div>
            </div>
          </div>

          {/* Confirmation code */}
          {showCode && booking.confirmationCode && (
            <div className="ml-4 text-center bg-blue-50 border border-blue-200 rounded-xl p-3 flex-shrink-0">
              <div className="font-mono font-bold text-xl tracking-widest text-primary">
                {booking.confirmationCode}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Show at check-in</div>
            </div>
          )}

          {booking.status === 'PendingPayment' && (
            <div className="ml-4 text-center bg-amber-50 border border-amber-200 rounded-xl p-3 flex-shrink-0">
              <div className="text-amber-700 font-medium text-sm">Payment pending</div>
              <div className="text-xs text-amber-600 mt-0.5">Complete to confirm</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
