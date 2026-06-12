'use client';

// This is a SignalR-connected variant for the admin incidents page.
// Drop this in place of the static version for live incident updates.
// Usage: replace src/app/(admin)/incidents/page.tsx with this file.

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { emergencyApi } from '@/lib/api';
import { Incident } from '@/types';
import { useSignalR } from '@/hooks/useSignalR';
import { Badge, Button, Card, CardContent, Spinner } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { toast } from 'sonner';

export function AdminIncidentsLive() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    emergencyApi.incidents(session.accessToken).then(res => {
      if (res.success) setIncidents(res.data?.items ?? []);
      setLoading(false);
    });
  }, [session]);

  // SignalR — new incidents appear in real time
  useSignalR('emergency', {
    NewIncidentAlert: (incident: Incident) => {
      setIncidents(prev => [incident, ...prev]);
      toast.error(`🚨 New ${incident.reportType} emergency reported`, {
        description: incident.patientName ?? 'Unknown patient',
        duration: 8000,
      });
    },
    IncidentStatusChanged: (update: { incidentId: string; status: string }) => {
      setIncidents(prev =>
        prev.map(i => i.id === update.incidentId ? { ...i, status: update.status as any } : i)
      );
    },
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          ● Live
        </span>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {['Type', 'Patient', 'Officer', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <Badge variant={incident.reportType === 'Medical' ? 'destructive' : 'warning'}>
                      {incident.reportType}
                    </Badge>
                  </td>
                  <td className="p-3 font-medium">{incident.patientName ?? 'Unknown'}</td>
                  <td className={`p-3 text-sm ${!incident.assignedOfficerName ? 'text-red-500' : ''}`}>
                    {incident.assignedOfficerName ?? 'Unassigned'}
                  </td>
                  <td className="p-3">
                    <Badge variant={
                      incident.status === 'Pending' ? 'destructive' :
                      incident.status === 'Resolved' ? 'success' : 'warning'
                    }>
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">
                    {formatElapsed(incident.createdAt)}
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

export default AdminIncidentsLive;
