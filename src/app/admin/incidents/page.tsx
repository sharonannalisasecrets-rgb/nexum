'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { emergencyApi } from '@/lib/api';
import { Incident } from '@/types';
import { Badge, Button, Card, CardContent, Spinner } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_BADGE: Record<string, any> = {
  Pending: 'destructive', Dispatched: 'warning',
  EnRoute: 'info', Resolved: 'success', Cancelled: 'secondary',
};

export default function AdminIncidentsPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    if (!session) return;
    emergencyApi.incidents(session.accessToken).then(res => {
      if (res.success) setIncidents(res.data?.items ?? []);
      setLoading(false);
    });
  }, [session]);

  async function updateStatus(id: string, status: string) {
    if (!session) return;
    const res = await emergencyApi.updateStatus(session.accessToken, id, { status });
    if (res.success) {
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i));
      toast.success('Incident status updated');
    } else {
      toast.error(res.error?.message ?? 'Update failed');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {incidents.filter(i => i.status === 'Pending').length} pending · {' '}
            {incidents.filter(i => i.status === 'Dispatched').length} dispatched
          </p>
        </div>
      </div>

      {/* Escalation banner */}
      {incidents.some(i => i.status === 'Pending' &&
        Date.now() - new Date(i.createdAt).getTime() > 2 * 60 * 1000) && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="text-sm font-semibold text-red-700">Unassigned incidents over 2 minutes</div>
            <div className="text-xs text-red-600">Escalation notifications sent automatically</div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Table */}
        <Card className="flex-1">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {['Type', 'Patient', 'Status', 'Officer', 'Time', ''].map(h => (
                    <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map(incident => (
                  <tr key={incident.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === incident.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelected(incident)}>
                    <td className="p-3">
                      <Badge variant={incident.reportType === 'Medical' ? 'destructive' : 'warning'}>
                        {incident.reportType}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{incident.patientName ?? 'Unknown'}</td>
                    <td className="p-3">
                      <Badge variant={STATUS_BADGE[incident.status] ?? 'secondary'}>
                        {incident.status}
                      </Badge>
                    </td>
                    <td className={`p-3 text-sm ${!incident.assignedOfficerName ? 'text-red-500' : ''}`}>
                      {incident.assignedOfficerName ?? 'Unassigned'}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">
                      {formatElapsed(incident.createdAt)}
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); setSelected(incident); }}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card className="w-72 flex-shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{selected.reportType} Incident</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selected.patientName ?? 'Unknown'}</div>
                <div><span className="text-muted-foreground">Contact:</span> {selected.patientEmergencyContact ?? '—'}</div>
                <div><span className="text-muted-foreground">Officer:</span> {selected.assignedOfficerName ?? 'None'}</div>
                <div><span className="text-muted-foreground">Location:</span> {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</div>
                {selected.description && <div><span className="text-muted-foreground">Note:</span> {selected.description}</div>}
              </div>
              <div className="mt-4 space-y-2">
                {selected.status !== 'Resolved' && selected.status !== 'Cancelled' && (
                  <>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(selected.id, 'Resolved')}>
                      Mark Resolved
                    </Button>
                    <Button variant="outline" size="sm" className="w-full"
                      onClick={() => updateStatus(selected.id, 'Cancelled')}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
