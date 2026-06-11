'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { alertApi } from '@/lib/api';
import { MissingPersonAlert, Sighting } from '@/types';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminMissingPersonsPage() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<MissingPersonAlert[]>([]);
  const [selected, setSelected] = useState<MissingPersonAlert | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    alertApi.list(session.accessToken).then(res => {
      if (res.success) setAlerts(res.data?.items ?? []);
      setLoading(false);
    });
  }, [session]);

  async function selectAlert(alert: MissingPersonAlert) {
    setSelected(alert);
    if (!session) return;
    const res = await alertApi.sightings(session.accessToken, alert.id);
    if (res.success) setSightings(res.data ?? []);
  }

  async function updateStatus(id: string, status: string) {
    if (!session) return;
    const res = await alertApi.updateStatus(session.accessToken, id, status);
    if (res.success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as any } : null);
      toast.success(`Alert marked as ${status}`);
    } else toast.error(res.error?.message ?? 'Update failed');
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Missing Persons</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {alerts.filter(a => a.status === 'Open').length} open · {' '}
          {alerts.filter(a => a.status === 'Found').length} found
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Alert list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto space-y-2">
          {alerts.map(alert => (
            <Card key={alert.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected?.id === alert.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
              onClick={() => selectAlert(alert)}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {alert.photoUrl ? (
                    <Image src={alert.photoUrl} alt={alert.fullName}
                      width={48} height={56} className="rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-14 bg-gray-100 rounded flex items-center justify-center text-2xl flex-shrink-0">
                      {alert.age && alert.age < 18 ? '👧' : '👤'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-medium text-sm truncate">{alert.fullName}</div>
                      <Badge variant={alert.status === 'Open' ? 'destructive' : alert.status === 'Found' ? 'success' : 'secondary'}
                        className="text-[10px] flex-shrink-0">
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Age {alert.age ?? '?'}</div>
                    <div className="text-xs mt-1">
                      <span className={alert.sightingCount > 0 ? 'text-green-600' : 'text-red-500'}>
                        {alert.sightingCount} sighting{alert.sightingCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-muted-foreground"> · {formatElapsed(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail pane */}
        {selected ? (
          <Card className="flex-1 overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{selected.fullName}</CardTitle>
                <div className="flex gap-2">
                  {selected.status === 'Open' && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(selected.id, 'Found')}>
                        ✓ Mark Found
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => updateStatus(selected.id, 'Closed')}>
                        Close Alert
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Age {selected.age ?? '?'} · {selected.description}
              </div>
              {selected.lastSeenAreaText && (
                <div className="text-sm">Last seen: {selected.lastSeenAreaText}</div>
              )}
            </CardHeader>
            <CardContent>
              <h4 className="font-medium text-sm mb-3">
                Sightings ({sightings.length})
              </h4>
              {sightings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sightings reported yet</p>
              ) : (
                <div className="space-y-3">
                  {sightings.map((s, i) => (
                    <div key={s.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        {i < sightings.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-3">
                        <div className="text-sm font-medium">
                          {s.locationDescription ?? `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatElapsed(s.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select an alert to view details
          </div>
        )}
      </div>
    </div>
  );
}
