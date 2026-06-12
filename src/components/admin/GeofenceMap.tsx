'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeofenceZone } from '@/types';

// ── Fit map to active zone ────────────────────────────────────
function FitBounds({ zones }: { zones: GeofenceZone[] }) {
  const map = useMap();
  useEffect(() => {
    const active = zones.find(z => z.isActive);
    if (active?.boundary?.coordinates?.[0]) {
      const coords = active.boundary.coordinates[0].map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
      if (coords.length > 0) map.fitBounds(coords, { padding: [20, 20] });
    }
  }, [zones, map]);
  return null;
}

// ── Click-to-draw polygon ─────────────────────────────────────
// User clicks points on the map to draw a polygon.
// Double-click closes and finalises the shape.
function DrawMode({
  onComplete,
  drawing,
}: {
  onComplete: (coords: [number, number][]) => void;
  drawing: boolean;
}) {
  const points = useRef<[number, number][]>([]);
  const map = useMap();

  useEffect(() => {
    if (drawing) {
      map.getContainer().style.cursor = 'crosshair';
      points.current = [];
    } else {
      map.getContainer().style.cursor = '';
    }
    return () => { map.getContainer().style.cursor = ''; };
  }, [drawing, map]);

  useMapEvents({
    click(e) {
      if (!drawing) return;
      points.current = [...points.current, [e.latlng.lat, e.latlng.lng]];
    },
    dblclick(e) {
      if (!drawing) return;
      e.originalEvent.preventDefault();
      const pts = [...points.current, [e.latlng.lat, e.latlng.lng] as [number, number]];
      if (pts.length >= 3) {
        onComplete(pts);
      }
      points.current = [];
    },
  });

  return null;
}

// ── Main map component ────────────────────────────────────────
interface GeofenceMapProps {
  zones: GeofenceZone[];
  drawingMode?: boolean;
  drawnCoords?: [number, number][];
  onDrawComplete?: (coords: [number, number][]) => void;
}

export default function GeofenceMap({
  zones,
  drawingMode = false,
  drawnCoords = [],
  onDrawComplete,
}: GeofenceMapProps) {
  return (
    <MapContainer
      center={[6.8403, 3.3864]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      doubleClickZoom={false} // prevent zoom on polygon close
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Existing saved zones */}
      {zones.map(zone => {
        if (!zone.boundary?.coordinates?.[0]) return null;
        const positions = zone.boundary.coordinates[0].map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );
        return (
          <Polygon
            key={zone.id}
            positions={positions}
            pathOptions={{
              color:       zone.isActive ? '#2563EB' : '#F59E0B',
              fillColor:   zone.isActive ? '#2563EB' : '#F59E0B',
              fillOpacity: zone.isActive ? 0.12 : 0.05,
              dashArray:   zone.isActive ? undefined : '6,4',
              weight:      zone.isActive ? 2.5 : 1.5,
            }}
          />
        );
      })}

      {/* In-progress drawn polygon */}
      {drawnCoords.length >= 2 && (
        <Polygon
          positions={drawnCoords}
          pathOptions={{
            color: '#10B981', fillColor: '#10B981',
            fillOpacity: 0.15, dashArray: '4,4', weight: 2,
          }}
        />
      )}

      {/* Draw mode handler */}
      {drawingMode && onDrawComplete && (
        <DrawMode onComplete={onDrawComplete} drawing={drawingMode} />
      )}

      <FitBounds zones={zones} />
    </MapContainer>
  );
}
