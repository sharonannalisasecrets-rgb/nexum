import { Card, CardContent } from '@/components/ui';
import { Bus } from 'lucide-react';

export default function AdminTransitPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transit Operations</h1>
        <p className="text-sm text-muted-foreground">Live fleet map and road network management</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bus className="h-12 w-12 mb-3 opacity-30" />
          <p>Transit dashboard — connect to SignalR ShuttleHub for live updates</p>
        </CardContent>
      </Card>
    </div>
  );
}
