import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emergencyApi } from '@/lib/api';
import { Badge, Card, CardContent } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';

export default async function OfficerIncidentsPage() {
  const session = await getServerSession(authOptions);
  let incidents: any[] = [];
  try {
    const res = await emergencyApi.incidents(session!.accessToken);
    incidents = res.data?.items ?? [];
  } catch { /* backend offline */ }
  const active = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Cancelled');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Incident Queue</h1>
        <p className="text-sm text-muted-foreground">{active.length} active incidents</p>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
          On Duty
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {['Type', 'Patient', 'Location', 'Officer', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Badge variant={incident.reportType === 'Medical' ? 'destructive' : 'warning'}>
                      {incident.reportType}
                    </Badge>
                  </td>
                  <td className="p-3 font-medium">{incident.patientName ?? 'Unknown'}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </td>
                  <td className={`p-3 text-sm ${!incident.assignedOfficerName ? 'text-red-500 font-medium' : ''}`}>
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
