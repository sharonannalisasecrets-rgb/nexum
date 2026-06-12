'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { transitApi } from '@/lib/api';
import { ShuttleRequest, ShuttleVehicle } from '@/types';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { toast } from 'sonner';

export default function DriverRidesPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<ShuttleVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [onDuty, setOnDuty] = useState(false);
  const [togglingDuty, setTogglingDuty] = useState(false);

  useEffect(() => {
    if (!session) return;
    transitApi.vehicles(session.accessToken).then(res => {
      if (res.success) setVehicles(res.data ?? []);
      setLoading(false);
    });
  }, [session]);

  async function toggleDuty() {
    if (!session) return;
    setTogglingDuty(true);
    // PUT /transit/drivers/availability
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transit/drivers/availability`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ isAvailable: !onDuty }),
      }
    );
    const json = await res.json();
    if (json.success) {
      setOnDuty(prev => !prev);
      toast.success(onDuty ? 'You are now off duty' : 'You are now on duty');
    } else {
      toast.error('Failed to update availability');
    }
    setTogglingDuty(false);
  }

  async function completeRide(requestId: string) {
    if (!session) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transit/drivers/requests/${requestId}/complete`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );
    const json = await res.json();
    if (json.success) {
      toast.success('Ride completed');
      setVehicles(prev => prev.map(v => ({ ...v, status: 'Available' })));
    } else {
      toast.error('Failed to complete ride');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  const myVehicle = vehicles[0]; // Driver sees their own vehicle

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Rides</h1>
          <p className="text-sm text-muted-foreground">Manage your shuttle assignments</p>
        </div>
        <Button
          onClick={toggleDuty}
          disabled={togglingDuty}
          className={onDuty ? 'bg-gray-600 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'}
        >
          {togglingDuty ? <Spinner className="h-4 w-4" /> : onDuty ? 'Go Off Duty' : 'Go On Duty'}
        </Button>
      </div>

      {/* Duty status banner */}
      <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
        onDuty
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className={`h-3 w-3 rounded-full ${onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
        <div>
          <div className={`font-medium text-sm ${onDuty ? 'text-emerald-800' : 'text-gray-700'}`}>
            {onDuty ? 'On Duty — Accepting Requests' : 'Off Duty'}
          </div>
          <div className="text-xs text-muted-foreground">
            {onDuty
              ? 'Your location is being shared every 5 seconds'
              : 'Toggle On Duty to start receiving shuttle requests'}
          </div>
        </div>
      </div>

      {/* Vehicle info */}
      {myVehicle && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Registration</div>
                <div className="font-mono font-semibold">{myVehicle.registration}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Capacity</div>
                <div className="font-semibold">{myVehicle.capacity} seats</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Status</div>
                <Badge variant={
                  myVehicle.status === 'Available' ? 'success' :
                  myVehicle.status === 'EnRoute' ? 'warning' : 'secondary'
                }>
                  {myVehicle.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active request */}
      {myVehicle?.status === 'EnRoute' && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-blue-800">🚌 Active Ride</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Pickup in progress</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Navigate to pickup point and confirm when passenger is on board
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Passenger Picked Up
                </Button>
                <Button size="sm" variant="outline"
                  onClick={() => myVehicle && completeRide(myVehicle.id)}>
                  Complete Ride
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming request queue */}
      {onDuty && myVehicle?.status === 'Available' && (
        <div>
          <h3 className="font-semibold mb-3">Incoming Requests</h3>
          <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg bg-white">
            Waiting for new shuttle requests...
          </div>
        </div>
      )}
    </div>
  );
}
