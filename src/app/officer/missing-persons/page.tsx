import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { alertApi } from '@/lib/api';
import { Badge, Card, CardContent } from '@/components/ui';
import { formatElapsed } from '@/lib/utils';

export default async function OfficerMissingPersonsPage() {
  const session = await getServerSession(authOptions);
  let alerts: any[] = [];
  try {
    const res = await alertApi.list(session!.accessToken);
    alerts = res.data?.items ?? [];
  } catch { /* backend offline */ }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Missing Persons</h1>
        <p className="text-sm text-muted-foreground">
          {alerts.filter(a => a.status === 'Open').length} open alerts
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map(alert => (
          <Card key={alert.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{alert.fullName}</div>
                  <div className="text-sm text-muted-foreground">Age {alert.age ?? '?'}</div>
                </div>
                <Badge variant={alert.status === 'Open' ? 'destructive' : 'success'}>
                  {alert.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{alert.description}</div>
              {alert.lastSeenAreaText && (
                <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                  Last seen: {alert.lastSeenAreaText}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className={`text-xs font-medium ${alert.sightingCount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {alert.sightingCount} sighting{alert.sightingCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-muted-foreground">{formatElapsed(alert.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
