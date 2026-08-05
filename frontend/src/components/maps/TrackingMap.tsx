import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPoint } from '@/services/googleMaps';
import { Button } from '@/components/ui/button';
import { Layers, Map as MapIcon, Sun, Moon, Maximize2, Minimize2 } from 'lucide-react';

interface TrackingMapProps {
  shuttlePosition?: [number, number];
  shuttleHeading?: number;
  shuttles?: { id: string; label: string; position: [number, number]; heading?: number }[];
  stops?: MapPoint[];
  origin?: MapPoint;
  destination?: MapPoint;
  routePath?: [number, number][];
  onMapReady?: (map: L.Map) => void;
  height?: string;
  zoom?: number;
  showControls?: boolean;
  showTraffic?: boolean;
  showSatellite?: boolean;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createOriginIcon() {
  return L.divIcon({
    html: '<div style="background:#22c55e;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(34,197,94,0.5);"></div>',
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
  });
}

function createDestIcon() {
  return L.divIcon({
    html: '<div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(239,68,68,0.5);"></div>',
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
  });
}

function createStopIcon() {
  return L.divIcon({
    html: '<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
    className: '', iconSize: [14, 14], iconAnchor: [7, 7],
  });
}

function createShuttleIcon(heading: number) {
  return L.divIcon({
    html: `<div style="transform:rotate(${heading}deg);background:#2563eb;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 12px rgba(37,99,235,0.6);border:3px solid white;transition:transform 0.3s;">🚌</div>`,
    className: '', iconSize: [36, 36], iconAnchor: [18, 18],
  });
}

const TILE_CONFIGS: Record<string, { url: string; attribution: string }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
  },
};

const TILE_KEYS = ['street', 'dark', 'satellite'] as const;
type TileMode = (typeof TILE_KEYS)[number];

export default function TrackingMap({
  shuttlePosition, shuttleHeading, shuttles = [], stops = [], origin, destination,
  routePath, onMapReady, height = '400px', zoom = 13,
  showControls = true, showTraffic: _showTraffic = false,
  showSatellite: initialSatellite = false,
}: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const shuttleMarkerRef = useRef<L.Marker | null>(null);
  const multiShuttleRef = useRef<L.Marker[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const outerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tileMode, setTileMode] = useState<TileMode>('street');
  const [fullscreen, setFullscreen] = useState(false);

  const center: [number, number] = shuttlePosition || [40.7128, -74.006];

  const isDark = useCallback(() => document.documentElement.classList.contains('dark'), []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const mode: TileMode = isDark() ? 'dark' : initialSatellite ? 'satellite' : 'street';
    setTileMode(mode);
    const map = L.map(containerRef.current, {
      center: [center[0], center[1]], zoom,
      zoomControl: true, attributionControl: true,
    });
    const tile = L.tileLayer(TILE_CONFIGS[mode].url, { attribution: TILE_CONFIGS[mode].attribution }).addTo(map);
    tileLayerRef.current = tile;
    mapRef.current = map;
    setMapReady(true);
    onMapReady?.(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (tileMode !== 'satellite') {
        setTileMode(isDark() ? 'dark' : 'street');
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [tileMode, isDark]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();
    const config = TILE_CONFIGS[tileMode];
    const tile = L.tileLayer(config.url, { attribution: config.attribution }).addTo(mapRef.current);
    tileLayerRef.current = tile;
  }, [tileMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (origin) {
      const m = L.marker([origin.lat, origin.lng], { icon: createOriginIcon() }).addTo(map);
      if (origin.name) m.bindTooltip(origin.name, { permanent: false, direction: 'top' });
      markersRef.current.push(m);
    }
    if (destination) {
      const m = L.marker([destination.lat, destination.lng], { icon: createDestIcon() }).addTo(map);
      if (destination.name) m.bindTooltip(destination.name, { permanent: false, direction: 'top' });
      markersRef.current.push(m);
    }
    stops.forEach((stop) => {
      const m = L.marker([stop.lat, stop.lng], { icon: createStopIcon() }).addTo(map);
      if (stop.name) m.bindTooltip(stop.name, { permanent: false, direction: 'top' });
      markersRef.current.push(m);
    });
  }, [origin, destination, stops, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
    if (routePath && routePath.length > 1) {
      const poly = L.polyline(routePath, { color: '#2563eb', weight: 4, opacity: 0.6, dashArray: '10 6' }).addTo(map);
      routeLayerRef.current = poly;
      map.fitBounds(poly.getBounds().pad(0.1));
    }
  }, [routePath, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !shuttlePosition) return;
    const pos = L.latLng(shuttlePosition[0], shuttlePosition[1]);
    if (shuttleMarkerRef.current) {
      shuttleMarkerRef.current.setLatLng(pos);
      if (shuttleHeading !== undefined) {
        shuttleMarkerRef.current.setIcon(createShuttleIcon(shuttleHeading));
      }
    } else {
      const marker = L.marker(pos, { icon: createShuttleIcon(shuttleHeading || 0), zIndexOffset: 1000 }).addTo(map);
      marker.bindTooltip('Shuttle', { permanent: false, direction: 'top' });
      shuttleMarkerRef.current = marker;
    }
    map.panTo(pos);
  }, [shuttlePosition, shuttleHeading, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    multiShuttleRef.current.forEach(m => m.remove());
    multiShuttleRef.current = [];
    if (shuttles.length > 0) {
      const bounds = L.latLngBounds([]);
      shuttles.forEach((s) => {
        const pos = L.latLng(s.position[0], s.position[1]);
        const marker = L.marker(pos, { icon: createShuttleIcon(s.heading || 0), zIndexOffset: 1000 }).addTo(map);
        marker.bindPopup(`<strong>${s.label}</strong><br/><span style="font-size:0.8rem;color:#666">${s.position[0].toFixed(6)}, ${s.position[1].toFixed(6)}</span>`, { autoClose: false });
        multiShuttleRef.current.push(marker);
        bounds.extend(pos);
      });
      map.fitBounds(bounds.pad(0.2));
    }
  }, [shuttles, mapReady]);

  const toggleFullscreen = () => {
    if (!outerRef.current) return;
    if (!document.fullscreenElement) {
      outerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const tileCycle = useMemo(() => {
    const idx = TILE_KEYS.indexOf(tileMode);
    const next = TILE_KEYS[(idx + 1) % TILE_KEYS.length];
    return () => setTileMode(next);
  }, [tileMode]);

  const actualHeight = fullscreen ? '100vh' : height;

  return (
    <div ref={outerRef} className="relative overflow-hidden rounded-xl" style={{ height: actualHeight }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Button variant="secondary" size="sm" className="shadow-md" onClick={tileCycle} title="Toggle map style">
            <Layers className={`w-4 h-4 ${tileMode !== 'street' ? 'text-blue-600' : ''}`} />
          </Button>
          <Button variant="secondary" size="sm" className="shadow-md" onClick={toggleFullscreen} title="Toggle fullscreen">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      )}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
