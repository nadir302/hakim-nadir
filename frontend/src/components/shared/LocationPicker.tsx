import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = L.divIcon({
  html: '<div style="background:#2563eb;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(37,99,235,0.5);border:3px solid white;">📍</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
  height?: string;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef({ lat, lng });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
      prev.current = { lat, lng };
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onMove, height = '250px' }: LocationPickerProps) {
  const markerRef = useRef<L.Marker>(null);

  const handleDrag = (e: L.LeafletEvent) => {
    const pos = (e.target as L.Marker).getLatLng();
    onMove(pos.lat, pos.lng);
  };

  const validLat = lat !== 0 && lat !== undefined;
  const center: [number, number] = validLat ? [lat, lng] : [40.7128, -74.006];

  return (
    <div className="overflow-hidden rounded-lg border" style={{ height }}>
      <MapContainer center={center} zoom={validLat ? 15 : 3} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater lat={center[0]} lng={center[1]} />
        <MapClickHandler onClick={onMove} />
        {validLat && (
          <Marker
            position={[lat, lng]}
            draggable={true}
            icon={pickupIcon}
            ref={markerRef}
            eventHandlers={{ dragend: handleDrag }}
          />
        )}
      </MapContainer>
    </div>
  );
}
