'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { geofenceApi } from '@/lib/api';
import { GeofenceZone } from '@/types';
import {
  Button, Badge, Card, CardContent,
  Input, Label, Spinner,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Pencil, Plus, MapPin, X, Check } from 'lucide-react';

const GeofenceMap = dynamic(() => import('@/components/admin/GeofenceMap'), { ssr: false });

type Panel = 'none' | 'create' | 'edit';

export default function AdminGeofencePage() {
  const { data: session } = useSession();
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  // Side panel
  const [panel, setPanel] = useState<Panel>('none');
  const [editingZone, setEditingZone] = useState<GeofenceZone | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // Drawing
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnCoords, setDrawnCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!session) return;
    geofenceApi.list(session.accessToken).then(res => {
      if (res.success) setZones((res.data as any) ?? []);
      setLoading(false);
    });
  }, [session]);

  function openCreate() {
    setEditingZone(null);
    setFormName('');
    setFormDesc('');
    setDrawnCoords([]);
    setDrawingMode(false);
    setPanel('create');
  }

  function openEdit(zone: GeofenceZone) {
    setEditingZone(zone);
    setFormName(zone.name);
    setFormDesc(zone.description ?? '');
    setDrawnCoords([]);
    setDrawingMode(false);
    setPanel('edit');
  }

  function closePanel() {
    setPanel('none');
    setEditingZone(null);
    setDrawingMode(false);
    setDrawnCoords([]);
  }

  async function activate(id: string) {
    if (!session) return;
    setActivating(id);
    const res = await geofenceApi.activate(session.accessToken, id);
    if (res.success) {
      setZones(prev => prev.map(z => ({ ...z, isActive: z.id === id })));
      toast.success('Boundary activated — mobile clients notified');
    } else {
      toast.error((res as any).error?.message ?? 'Activation failed');
    }
    setActivating(null);
  }

  function buildRing(coords: [number, number][]) {
    // coords are [lat, lng] from map clicks — GeoJSON needs [lng, lat]
    const ring = coords.map(([lat, lng]) => [lng, lat] as [number, number]);
    ring.push(ring[0]); // close the ring
    return ring;
  }

  async function handleSave() {
    if (!session) return;
    if (!formName.trim()) { toast.error('Name is required'); return; }

    if (panel === 'create' && drawnCoords.length < 3) {
      toast.error('Draw at least 3 points on the map to define the boundary');
      return;
    }

    setSaving(true);
    const body: any = { name: formName.trim(), description: formDesc.trim() || undefined };

    if (drawnCoords.length >= 3) {
      body.boundary = { type: 'Polygon', coordinates: [buildRing(drawnCoords)] };
    }

    const res = panel === 'create'
      ? await geofenceApi.create(session.accessToken, body)
      : await geofenceApi.update(session.accessToken, editingZone!.id, body);

    setSaving(false);

    if (res.success) {
      if (panel === 'create') {
        setZones(prev => [...prev, res.data as GeofenceZone]);
        toast.success('New boundary saved');
      } else {
        setZones(prev => prev.map(z =>
          z.id === editingZone!.id
            ? { ...z, name: formName.trim(), description: formDesc.trim(),
                ...(drawnCoords.length >= 3 && {
                  boundary: { type: 'Polygon' as const,
                    coordinates: [buildRing(drawnCoords)] },
                }) }
            : z
        ));
        toast.success('Boundary updated');
      }
      closePanel();
    } else {
      toast.error((res as any).error?.message ?? 'Save failed');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  const active = zones.find(z => z.isActive);
  const showPanel = panel !== 'none';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Geofence Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active ? `Active: ${active.name}` : 'No active boundary'}
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Boundary
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Map — spans 2 cols normally, full width when panel open */}
        <div className={showPanel ? 'col-span-3' : 'col-span-2'}>
          <Card className="overflow-hidden">
            {/* Draw mode toolbar */}
            {showPanel && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b">
                <span className="text-sm font-medium text-gray-700">
                  {panel === 'create' ? 'New Boundary' : `Editing: ${editingZone?.name}`}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {!drawingMode ? (
                    <Button
                      size="sm" variant="outline"
                      onClick={() => { setDrawnCoords([]); setDrawingMode(true); }}
                    >
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {drawnCoords.length > 0 ? 'Redraw Polygon' : 'Draw Polygon'}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Click points · Double-click to finish
                      <button onClick={() => setDrawingMode(false)} className="ml-1 text-gray-400 hover:text-gray-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {drawnCoords.length >= 3 && !drawingMode && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      {drawnCoords.length} points drawn
                    </span>
                  )}
                </div>
              </div>
            )}

            <div style={{ height: showPanel ? 420 : 480 }}>
              <GeofenceMap
                zones={zones}
                drawingMode={drawingMode}
                drawnCoords={drawnCoords}
                onDrawComplete={coords => {
                  setDrawnCoords(coords);
                  setDrawingMode(false);
                  toast.success(`Polygon captured — ${coords.length} points. Fill in details below.`);
                }}
              />
            </div>
          </Card>

          {/* Inline form — shown below map when panel is open */}
          {showPanel && (
            <Card className="mt-4">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold">
                    {panel === 'create' ? 'New Boundary Details' : 'Edit Boundary'}
                  </h3>
                  <button onClick={closePanel} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Boundary Name *</Label>
                    <Input
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Redemption City — HGC 2026"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Description (optional)</Label>
                    <Input
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="Extended boundary for Dec congress"
                    />
                  </div>
                </div>

                {/* Polygon status */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {panel === 'create' && drawnCoords.length < 3 && (
                      <p className="text-sm text-amber-600 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        Use the <strong>Draw Polygon</strong> button above to mark the boundary on the map
                      </p>
                    )}
                    {panel === 'edit' && drawnCoords.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Polygon not redrawn — existing boundary will be kept
                      </p>
                    )}
                    {drawnCoords.length >= 3 && (
                      <p className="text-sm text-green-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        Polygon ready — {drawnCoords.length} points
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={closePanel}>Cancel</Button>
                    <Button
                      loading={saving}
                      onClick={handleSave}
                      disabled={
                        panel === 'create'
                          ? !formName.trim() || drawnCoords.length < 3
                          : !formName.trim()
                      }
                    >
                      {panel === 'create' ? 'Save Boundary' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            ℹ Activating a boundary refreshes the server cache and broadcasts
            a <code className="bg-gray-100 px-1 rounded text-xs">GeofenceBoundaryUpdated</code> SignalR
            event to all connected mobile clients.
          </p>
        </div>

        {/* Zone list — hidden when panel is open (map takes full width) */}
        {!showPanel && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Saved Boundaries ({zones.length})</h3>
            {zones.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No boundaries yet. Click + New Boundary to draw one.
              </p>
            )}
            {zones.map(zone => (
              <Card key={zone.id}
                className={zone.isActive ? 'border-blue-500 ring-1 ring-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm">{zone.name}</div>
                    {zone.isActive
                      ? <Badge variant="success">Active</Badge>
                      : <Badge variant="secondary">Saved</Badge>}
                  </div>
                  {zone.description && (
                    <p className="text-xs text-muted-foreground mb-2">{zone.description}</p>
                  )}
                  {zone.activatedAt && (
                    <p className="text-xs text-muted-foreground font-mono mb-3">
                      Activated: {formatDate(zone.activatedAt)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {!zone.isActive && (
                      <Button size="sm" className="flex-1"
                        loading={activating === zone.id}
                        disabled={activating === zone.id}
                        onClick={() => activate(zone.id)}>
                        Activate
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEdit(zone)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
