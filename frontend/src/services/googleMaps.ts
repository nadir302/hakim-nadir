export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapPoint extends LatLng {
  name?: string;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SmartShuttle/1.0' } });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!data.length) throw new Error('Address not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SmartShuttle/1.0' } });
  if (!res.ok) throw new Error('Reverse geocoding failed');
  const data = await res.json();
  return data.display_name || 'Unknown location';
}

export async function getRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<{ path: [number, number][]; distance: number; duration: number }> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Route fetch failed');
  const data = await res.json();
  if (!data.routes?.length) throw new Error('No route found');
  const route = data.routes[0];
  const path = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
  return { path, distance: route.distance / 1000, duration: route.duration / 60 };
}
