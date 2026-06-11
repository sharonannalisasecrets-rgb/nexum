import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emergencyApi, alertApi } from '@/lib/api';
import { StatCard, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';
import { Incident, MissingPersonAlert } from '@/types';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const token = session!.accessToken;

  let incidentsRes: { data?: { items: Incident[] } }          = { data: { items: [] } };
  let alertsRes:    { data?: { items: MissingPersonAlert[] } } = { data: { items: [] } };
  try {
    [incidentsRes, alertsRes] = await Promise.all([
      emergencyApi.incidents(token),
      alertApi.list(token),
    ]);
  } catch { /* backend offline */ }

  const incidents = incidentsRes.data?.items ?? [];
  const alerts = alertsRes.data?.items ?? [];

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Cancelled');
  const pendingIncidents = incidents.filter(i => i.status === 'Pending');
  const openAlerts = alerts.filter(a => a.status === 'Open');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time camp operations overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard value={activeIncidents.length} label="Active Incidents"
          delta={pendingIncidents.length > 0 ? `${pendingIncidents.length} unassigned` : undefined}
          color="red" />
        <StatCard value={openAlerts.length} label="Open Missing Alerts"
          delta={`${openAlerts.filter(a => a.sightingCount === 0).length} with no sightings`}
          color="amber" />
        <StatCard value={incidents.filter(i => i.status === 'Resolved').length}
          label="Resolved Today" color="green" />
        <StatCard value={alerts.filter(a => a.status === 'Found').length}
          label="Found Today" color="teal" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active incidents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>🚨 Active Incidents</span>
              <a href="/admin/incidents" className="text-xs text-blue-600 font-normal hover:underline">
                View all
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active incidents</p>
            ) : (
              <div className="space-y-2">
                {activeIncidents.slice(0, 5).map(incident => (
                  <div key={incident.id}
                    className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={incident.reportType === 'Medical' ? 'destructive' : 'warning'}>
                          {incident.reportType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatElapsed(incident.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {incident.patientName ?? 'Unknown patient'}
                        {incident.assignedOfficerName
                          ? ` → ${incident.assignedOfficerName}`
                          : ' → Unassigned'}
                      </div>
                    </div>
                    <Badge variant={
                      incident.status === 'Pending' ? 'destructive' :
                      incident.status === 'Dispatched' ? 'warning' : 'success'
                    }>
                      {incident.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open missing alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>🔍 Open Missing Alerts</span>
              <a href="/admin/missing-persons" className="text-xs text-blue-600 font-normal hover:underline">
                View all
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No open alerts</p>
            ) : (
              <div className="space-y-2">
                {openAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id}
                    className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{alert.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        Age {alert.age ?? '?'} · {alert.lastSeenAreaText ?? 'Location unknown'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${alert.sightingCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {alert.sightingCount} sighting{alert.sightingCount !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatElapsed(alert.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
