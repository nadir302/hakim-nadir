import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const busIcon = L.divIcon({
  html: `<div style="background:#2563eb;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(37,99,235,0.5);border:2px solid white;">🚌</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const stopIcon = L.divIcon({
  html: `<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface MapPoint {
  lat: number;
  lng: number;
  name?: string;
}

interface ShuttleMapProps {
  center?: [number, number];
  shuttlePosition?: [number, number];
  stops?: MapPoint[];
  origin?: MapPoint;
  destination?: MapPoint;
  zoom?: number;
  height?: string;
}

export default function ShuttleMap({
  center = [40.7128, -74.006],
  shuttlePosition,
  stops = [],
  origin,
  destination,
  zoom = 13,
  height = '100%',
}: ShuttleMapProps) {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (shuttlePosition && mapRef.current) {
      mapRef.current.setView(shuttlePosition, mapRef.current.getZoom());
    }
  }, [shuttlePosition]);

  const routePoints: [number, number][] = [];
  if (origin) routePoints.push([origin.lat, origin.lng]);
  stops.forEach((s) => routePoints.push([s.lat, s.lng]));
  if (destination) routePoints.push([destination.lat, destination.lng]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={stopIcon}>
          <Popup>{origin.name || 'Origin'}</Popup>
        </Marker>
      )}

      {stops.map((stop, i) => (
        <Marker key={i} position={[stop.lat, stop.lng]} icon={stopIcon}>
          <Popup>{stop.name || `Stop ${i + 1}`}</Popup>
        </Marker>
      ))}

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={stopIcon}>
          <Popup>{destination.name || 'Destination'}</Popup>
        </Marker>
      )}

      {routePoints.length > 1 && (
        <Polyline positions={routePoints} color="#2563eb" weight={3} opacity={0.6} dashArray="10 6" />
      )}

      {shuttlePosition && (
        <Marker position={shuttlePosition} icon={busIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>Shuttle Here</strong>
              <br />
              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                {shuttlePosition[0].toFixed(4)}, {shuttlePosition[1].toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
