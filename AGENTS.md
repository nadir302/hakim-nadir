# Smart Shuttle Management System — Developer Reference

## 1. Base Types (frontend/src/types/index.ts)

```typescript
type Role = 'SUPER_ADMIN' | 'ORGANIZER' | 'DRIVER' | 'PARTICIPANT'

interface User {
  id: string; email: string; firstName: string; lastName: string;
  phone?: string; avatar?: string; role: Role; status: string;
  emailVerified: boolean; createdAt: string;
}

interface AuthTokens     { accessToken: string; refreshToken: string }
interface AuthResponse   { user: User; tokens: AuthTokens }

interface Event {
  id: string; name: string; description?: string; date: string;
  startTime: string; endTime: string; address: string;
  latitude?: number; longitude?: number; capacity: number;
  status: string; posterImage?: string; createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string; email: string };
  _count?: { reservations: number; routes: number; pickupPoints: number };
}

interface Vehicle {
  id: string; busNumber: string; plateNumber: string; capacity: number;
  model?: string; year?: number; color?: string; status: string;
  currentLat?: number; currentLng?: number; driver?: Driver;
}

interface Driver {
  id: string; licenseNumber: string; phone: string;
  availability: boolean; rating: number; totalTrips: number;
  user: { id: string; firstName: string; lastName: string; email: string; phone?: string; avatar?: string };
  vehicle?: Vehicle; _count?: { trips: number };
}

interface Route {
  id: string; name: string; origin: string; originLat?: number; originLng?: number;
  destination: string; destinationLat?: number; destinationLng?: number;
  distance?: number; estimatedDuration?: number; isActive: boolean;
  eventId: string; stops: RouteStop[];
  event?: { id: string; name: string };
}

interface RouteStop {
  id: string; name: string; latitude: number; longitude: number; order: number;
}

interface PickupPoint {
  id: string; name: string; latitude: number; longitude: number;
  address?: string; maxCapacity: number; eventId: string;
}

interface Reservation {
  id: string; reservationCode: string; date: string; time: string;
  status: string; qrCode?: string; notes?: string;
  participant: User; event: { id: string; name: string; date: string };
  pickupPoint?: PickupPoint; trip?: Trip;
}

interface Trip {
  id: string; name?: string; date: string; departureTime: string;
  arrivalTime?: string; status: string; currentLat?: number; currentLng?: number;
  currentSpeed?: number; tripProgress: number; estimatedArrival?: string;
  driver: Driver; vehicle: Vehicle; route: Route; reservations: Reservation[];
  _count?: { reservations: number };
}

interface Notification {
  id: string; type: string; title: string; message: string;
  read: boolean; createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; limit: number; totalPages: number;
}

interface DashboardStats {
  overview: { totalEvents: number; totalParticipants: number; totalDrivers: number;
    totalVehicles: number; todayTrips: number; activeTrips: number;
    completedTrips: number; totalReservations: number; };
  reservationsByStatus: { status: string; _count: number }[];
  tripsByStatus: { status: string; _count: number }[];
  recentReservations: Reservation[]; upcomingEvents: Event[];
  recentActivity: ActivityLog[];
}

interface ActivityLog {
  id: string; action: string; entity: string; details: any;
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  createdAt: string;
}
```

---

## 2. Backend Services — Input / Output / Types

### 2.1 auth.service.ts

| Méthode | Input | Output | Notes |
|---------|-------|--------|-------|
| `register` | `{ email: string, password: string, firstName: string, lastName: string, phone?: string }` | `{ user: User (select), tokens: AuthTokens }` | Hash bcrypt 12 rounds, envoie email vérification |
| `login` | `email: string, password: string` | `{ user: User (sans password), tokens: AuthTokens }` | Verrouillage après 5 échecs |
| `refreshToken` | `refreshToken: string` | `AuthTokens` | Rotation du refresh token |
| `logout` | `userId: string` | `void` | Supprime refreshToken en DB |
| `verifyEmail` | `token: string` | `void` | Marque emailVerified: true |
| `forgotPassword` | `email: string` | `void` | Envoie email avec lien |
| `resetPassword` | `token: string, newPassword: string` | `void` | Hash et sauvegarde |
| `changePassword` | `userId, currentPassword, newPassword` | `void` | Vérifie ancien mot de passe |
| `getProfile` | `userId: string` | `User + driverProfile` | Inclut véhicule |
| `updateProfile` | `userId, { firstName?, lastName?, phone?, avatar? }` | `User (select)` | |

### 2.2 tracking.service.ts

| Méthode | Input | Output | Notes |
|---------|-------|--------|-------|
| `updateLocation` | `tripId, driverId, { lat, lng, speed?, heading? }` | `{ eta: Date\|null, distance: number, progress: number }` | Crée TrackingLog, met à jour Vehicle + Trip, émet Socket.IO `location-update`, vérifie proximité arrêts |
| `changeTripStatus` | `tripId, driverId, newStatus` | `{ tripId, status, label }` | Machine à états : SCHEDULED→IN_PROGRESS→COMPLETED/DELAYED. Notifie participants si IN_PROGRESS |
| `getActiveShuttles` | — | `Trip[]` (avec vehicle, driver, route, _count reservations) | Status IN_PROGRESS ou SCHEDULED aujourd'hui |
| `getTripHistory` | `tripId` | `TrackingLog[]` (5000 max, tri croissant) | |
| `replayTrip` | `tripId` | `Trip + trackingLogs[] + route.stops[]` | Pour la page Replay |

**Types internes :**
```
STATUS_TRANSITIONS = {
  SCHEDULED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED', 'DELAYED'],
  DELAYED: ['IN_PROGRESS', 'COMPLETED'],
  COMPLETED: [], CANCELLED: []
}
PROXIMITY_KM = 0.3  // 300m pour alerte proximité
```

**Méthodes privées :**
- `calculateETA(trip, lat, lng, speed): Date|null` — basé sur distance restante / vitesse moyenne
- `calculateRemainingDistance(trip, lat, lng): number` — distance haversine vers destination (km)
- `calculateProgress(trip, lat, lng): number` — 0-100%
- `haversineDistance(lat1, lng1, lat2, lng2): number` — distance en km
- `checkProximityToPickups(tripId, lat, lng): Promise<void>` — notifie participants si ≤300m

### 2.3 reservation.service.ts

| Méthode | Input | Output | Notes |
|---------|-------|--------|-------|
| `generateQrToken` | `reservation: { id, reservationCode, eventId, participantId, date }` | `string` (JWT signé 24h) | Payload: sub, code, eventId, participantId, date, iat |
| `validateQrToken` | `token: string` | `{ valid: true, payload } \| { valid: false, status: 'EXPIRED'\|'INVALID' }` | Vérifie signature + expiration JWT |
| `validateScan` | `token, scanData?: { lat?, lng?, device?, driverId?, tripId? }` | `{ status: 'VALID'\|'INVALID'\|'EXPIRED'\|'ALREADY_USED', message, reservation? }` | Vérifie statut reservation, marque CHECKED_IN, log ActivityLog |
| `findAll` | `{ page?, limit?, status?, eventId?, participantId? }` | `PaginatedResponse<Reservation>` | |
| `findById` | `id` | `Reservation + event + pickupPoint + trip( driver, vehicle, route )` | |
| `create` | `{ participantId, eventId, pickupPointId?, date, time, routeId?, notes? }` | `Reservation` | Génère code + JWT QR, notifie participant |
| `cancel` | `id, userId` | `Reservation` (status→CANCELLED) | Vérifie autorisation |
| `getParticipantReservations` | `participantId` | `Reservation[]` (avec event, pickupPoint, trip) | |
| `getStats` | — | `{ total, confirmed, checkedIn, completed, cancelled }` | |

### 2.4 report.service.ts

| Méthode | Output | Notes |
|---------|--------|-------|
| `getDailyReport(date?)` | `{ date, trips: number, reservations: number, newUsers: number, tripDetails: Trip[] }` | |
| `getWeeklyReport` | `{ period: 'weekly', trips, reservations, newUsers, mostUsedRoutes }` | Top 5 routes |
| `getMonthlyReport` | `{ period: 'monthly', trips, reservations, newUsers, occupancyRate }` | |
| `getRouteAnalytics` | `Array<{ id, name, totalTrips, totalPassengers, avgPassengersPerTrip }>` | |
| `getTripsPerDay(days=30)` | `Array<{ day: Date, trips: number, completed: number, delayed: number, cancelled: number }>` | SQL raw |
| `getDriverPerformance` | `Array<{ id, name, totalTrips, completedTrips, rating, availability }>` | |
| `getVehicleUsage` | `Array<{ id, busNumber, plateNumber, capacity, status, totalTrips, driverName }>` | |
| `getOccupancyStats` | `{ occupancyRate, totalCapacity, totalPassengers, byTrip: Array<{ tripId, capacity, passengers, occupancy }> }` | 30 jours |

### 2.5 socket.service.ts

| Événement (client→serveur) | Payload | Réponse |
|---------------------------|---------|---------|
| `join-trip` | `tripId: string` | Rejoint room `trip:<id>` |
| `leave-trip` | `tripId: string` | Quitte room |
| `gps-update` | `{ tripId, lat, lng, speed?, heading? }` | `gps-ack: { tripId, eta, distance, progress, timestamp }` ou `gps-error` |
| `trip-status-change` | `{ tripId, status }` | `trip-status-changed: { tripId, status, label }` ou `trip-status-error` |
| `subscribe-shuttle` | `tripId: string` | `subscribed: { tripId }` |
| `unsubscribe-shuttle` | `tripId: string` | Silence |
| `send-message` | `{ receiverId, content }` | `new-message` vers receiver, `message-sent` vers sender |

| Événement (serveur→client) | Payload | Destinataire |
|---------------------------|---------|-------------|
| `location-update` | `{ tripId, lat, lng, speed, heading, estimatedArrival, remainingDistance, progress, timestamp }` | Room `trip:<id>` |
| `trip-status-changed` | `{ tripId, status, label }` | Room `trip:<id>` |
| `notification` | `{ id, type, title, message, read, createdAt }` | Room `user:<id>` |
| `shuttle-near` | `{ pickupPoint, distance, tripId }` | Room `user:<id>` |
| `new-message` | ChatMessage complet | Room `user:<receiverId>` |

**Rooms :**
- `user:<userId>` — notifications personnelles
- `role:<role>` — broadcast par rôle
- `trip:<tripId>` — suivi GPS
- `drivers` — tous les conducteurs connectés

---

## 3. Frontend Services — Input / Output

### 3.1 API (api.ts)

```typescript
// Axios instance — intercepteur auto-refresh token sur 401
// Base: VITE_API_URL || 'http://localhost:5000/api'

authApi.login(email, password)                             → AuthResponse
authApi.register({ firstName, lastName, email, phone?, password }) → AuthResponse
authApi.refreshToken(refreshToken)                         → { accessToken, refreshToken }
authApi.logout()                                            → void
authApi.getProfile()                                       → User
authApi.updateProfile(data)                                → User
authApi.changePassword({ currentPassword, newPassword, confirmPassword }) → void
authApi.verifyEmail(token)                                 → void
authApi.forgotPassword(email)                              → void
authApi.resetPassword(token, password)                     → void

usersApi.getAll(params?)            → PaginatedResponse<User>
usersApi.getById(id)                → User
usersApi.update(id, data)           → User
usersApi.delete(id)                 → void
usersApi.getStats()                 → { totalUsers, ... }

eventsApi.getAll(params?)           → PaginatedResponse<Event>
eventsApi.getById(id)               → Event
eventsApi.create(data)              → Event
eventsApi.update(id, data)          → Event
eventsApi.delete(id)                → void
eventsApi.getUpcoming()             → Event[]
eventsApi.getStats()                → { total, ... }

driversApi.getAll(params?)          → PaginatedResponse<Driver>
driversApi.getById(id)              → Driver
driversApi.create(data)             → Driver
driversApi.update(id, data)         → Driver
driversApi.delete(id)               → void
driversApi.getTodayTrips(id)        → Trip[]

vehiclesApi.getAll(params?)         → PaginatedResponse<Vehicle>
vehiclesApi.getById(id)             → Vehicle
vehiclesApi.create(data)            → Vehicle
vehiclesApi.update(id, data)        → Vehicle
vehiclesApi.delete(id)              → void
vehiclesApi.getAvailable()          → Vehicle[]

routesApi.getAll(params?)           → PaginatedResponse<Route>
routesApi.getById(id)               → Route
routesApi.create(data)              → Route
routesApi.update(id, data)          → Route
routesApi.delete(id)                → void

pickupPointsApi.getAll(params?)     → PaginatedResponse<PickupPoint>
pickupPointsApi.getById(id)         → PickupPoint
pickupPointsApi.create(data)        → PickupPoint
pickupPointsApi.update(id, data)    → PickupPoint
pickupPointsApi.delete(id)          → void

reservationsApi.getAll(params?)     → PaginatedResponse<Reservation>
reservationsApi.getById(id)         → Reservation
reservationsApi.create(data)        → Reservation
reservationsApi.update(id, data)    → Reservation
reservationsApi.cancel(id)          → Reservation
reservationsApi.getMyReservations() → Reservation[]
reservationsApi.getStats()          → { total, confirmed, checkedIn, completed, cancelled }
reservationsApi.validateQR(token, scanData?) → { status: 'VALID'|'INVALID'|'EXPIRED'|'ALREADY_USED', message, reservation? }

tripsApi.getAll(params?)            → PaginatedResponse<Trip>
tripsApi.getById(id)                → Trip
tripsApi.create(data)               → Trip
tripsApi.update(id, data)           → Trip
tripsApi.delete(id)                 → void
tripsApi.startTrip(id)              → Trip
tripsApi.completeTrip(id)           → Trip
tripsApi.delayTrip(id, delayMinutes) → Trip
tripsApi.getActive()                → Trip[]

notificationsApi.getAll(params?)    → { data: Notification[], total, unreadCount, page, limit }
notificationsApi.markAsRead(id)     → void
notificationsApi.markAllAsRead()    → void
notificationsApi.delete(id)         → void

dashboardApi.getAdmin()             → DashboardStats
dashboardApi.getOrganizer()         → { myEvents, totalReservations, activeTrips, totalParticipants }
dashboardApi.getDriver()            → { todayTrips, totalTrips, totalPassengers, activeTrip }
dashboardApi.getParticipant()       → { totalReservations, upcomingTrips, completedTrips, cancelledTrips }

reportsApi.getDaily(date?)          → DailyReport
reportsApi.getWeekly()              → WeeklyReport
reportsApi.getMonthly()             → MonthlyReport
reportsApi.getRouteAnalytics()      → RouteAnalytics[]
reportsApi.getTripsPerDay(days?)    → TripsPerDay[]
reportsApi.getDriverPerformance()   → DriverPerformance[]
reportsApi.getVehicleUsage()        → VehicleUsage[]
reportsApi.getOccupancyStats()      → OccupancyStats

trackingApi.getActiveShuttles()         → Trip[]
trackingApi.getOrganizerMonitoring()    → Trip[]
trackingApi.getDriverCurrentTrip()      → Trip|null
trackingApi.getTripHistory(tripId)      → TrackingLog[]
trackingApi.replayTrip(tripId)          → Trip + trackingLogs[]
trackingApi.updateLocation(tripId, { lat, lng, speed?, heading? }) → { eta, distance, progress }
trackingApi.changeTripStatus(tripId, status) → { tripId, status, label }
```

### 3.2 googleMaps.ts

```typescript
geocodeAddress(address: string): Promise<{ lat: number; lng: number }>  — Nominatim (gratuit)
reverseGeocode(lat: number, lng: number): Promise<string>               — Nominatim (gratuit)
getRoute(origin: [number,number], dest: [number,number])                — OSRM (gratuit)
  → { path: [number,number][]; distance: number; duration: number }

interface LatLng  { lat: number; lng: number; }
interface MapPoint extends LatLng { name?: string; }
// Stack gratuit : Leaflet + OSM + Nominatim + OSRM — aucune clé API requise
```

---

## 4. Composants Frontend — Props / Emits

### 4.1 maps/TrackingMap.tsx

```typescript
interface TrackingMapProps {
  shuttlePosition?: [number, number];     // [lat, lng] position actuelle
  shuttleHeading?: number;                // cap en degrés
  stops?: MapPoint[];                     // points d'arrêt
  origin?: MapPoint;                      // point de départ
  destination?: MapPoint;                 // destination
  routePath?: [number, number][];         // polyline du trajet
  onMapReady?: (map: L.Map) => void;       // callback quand la carte Leaflet est prête
  height?: string;                        // hauteur (def: '400px')
  zoom?: number;                          // zoom (def: 13)
  showControls?: boolean;                 // afficher les boutons (def: true)
  showTraffic?: boolean;                  // (ignoré — gratuit)
  showSatellite?: boolean;                // vue satellite initiale (def: false)
}
// Stack Leaflet + OSM (free, no key) : bascule street / dark / satellite
```

### 4.2 maps/ShuttleMap.tsx

```typescript
interface ShuttleMapProps {
  center?: [number, number];        // centre de la carte (def: [40.7128, -74.006])
  shuttlePosition?: [number, number];
  stops?: { lat: number; lng: number; name?: string }[];
  origin?: { lat: number; lng: number; name?: string };
  destination?: { lat: number; lng: number; name?: string };
  zoom?: number;
  height?: string;
}
// Leaflet avec icône bus 🚌, marqueurs ronds verts pour arrêts, polyline en tiretés
```

### 4.3 shared/DataTable.tsx

```typescript
interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}
interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}
```

### 4.4 shared/EntityModal.tsx

```typescript
interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;  // def: 'Save'
}
```

### 4.5 shared/NotificationCenter.tsx

```typescript
// Pas de props — utilise useSocket + useQuery internes
// Affiche badge décompte non-lus sur icône Bell
// Dropdown avec liste, marquer lu, marquer tout lu, supprimer, temps réel
// Types d'icônes: TRIP_STARTED→Bus, TRIP_ARRIVED→MapPin, TRIP_DELAYED→Clock,
//   TRIP_CANCELLED→XCircle, RESERVATION_CONFIRMATION→CheckCircle2,
//   REMINDER→AlertTriangle, GENERAL→Info
```

### 4.6 shared/Skeleton.tsx

```typescript
Skeleton({ className? })          ⇒ div animé (pulse + rounded-md bg-muted)
SkeletonCard()                    ⇒ carte avec 3 lignes de skeleton
SkeletonTable({ rows?: 5 })       ⇒ entête + N lignes skeleton
SkeletonMap()                     ⇒ rectangle h-[400px]
SkeletonStats()                   ⇒ grille de 4 SkeletonCards
SkeletonPage()                    ⇒ titre + sous-titre + stats + table complets
```

### 4.7 shared/ErrorBoundary.tsx

```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;     // fallback personnalisé
}
// Capture les erreurs React, affiche message + bouton "Try again"
```

### 4.8 shared/OfflineDetector.tsx

```typescript
// Pas de props
// Affiche bannière rouge "You are offline" quand navigator.onLine === false
```

---

## 5. Validation Zod (frontend/src/lib/validation.ts)

| Schéma | Champs | Règles |
|--------|--------|--------|
| `loginSchema` | email, password | email valide, password ≥6 |
| `registerSchema` | firstName (2-50), lastName (2-50), email, phone? (regex /^\+?[\d\s-]{7,15}$/), password (≥8, maj+min+chiffre), confirmPassword | confirmPassword==password |
| `forgotPasswordSchema` | email | email valide |
| `resetPasswordSchema` | password (≥8), confirmPassword | confirmation match |
| `eventSchema` | name (3-100), description? (≤500), date, startTime, endTime, address (≥5), latitude? (-90..90), longitude? (-180..180), capacity (1-100000), status? | endTime > startTime |
| `vehicleSchema` | busNumber (2-20), plateNumber (3-20), capacity (1-100), model? (≤50), year? (2000-2030), color? (≤30), status? | — |
| `driverSchema` | firstName (≥2), lastName (≥2), email, phone (regex), licenseNumber (≥3), address?, password? (≥8) | — |
| `routeSchema` | name (≥3), origin (≥3), originLat?, originLng?, destination (≥3), destinationLat?, destinationLng?, distance? (≥0), estimatedDuration? (≥1), description? (≤500), isActive?, eventId | — |
| `pickupPointSchema` | name (≥2), latitude (-90..90), longitude (-180..180), address? (≤200), maxCapacity (≥1), eventId | — |
| `reservationSchema` | eventId, pickupPointId, tripId?, notes? (≤300) | — |
| `userSchema` | firstName (≥2), lastName (≥2), email, phone? (regex), role, status? | — |
| `changePasswordSchema` | currentPassword, newPassword (≥8, maj+min+chiffre), confirmPassword | passwords match |
| `profileSchema` | firstName (≥2), lastName (≥2), phone? (regex) | — |

---

## 6. Auth Store (frontend/src/store/authStore.ts)

```typescript
interface AuthState {
  user: User | null;                  // Persisté dans localStorage
  isAuthenticated: boolean;           // Basé sur présence accessToken
  isLoading: boolean;
  setUser: (user: User | null) => void;   // Persiste dans localStorage
  setLoading: (loading: boolean) => void;
  logout: () => void;                     // Nettoie localStorage + state
  hasRole: (...roles: Role[]) => boolean; // Vérifie rôle utilisateur
}
```

---

## 7. Hooks

### useSocket.ts

```typescript
useSocket(): React.MutableRefObject<Socket | null>
// Connecte Socket.IO avec JWT token, se déconnecte au cleanup
// URL: VITE_SOCKET_URL || 'http://localhost:5000'
// Transport: websocket + polling
```

---

## 8. Backend Middleware

### auth.middleware.ts
```typescript
authenticate: (req, res, next) => void
  // Lit Bearer token du header Authorization
  // Vérifie JWT (secret), vérifie user ACTIF en DB
  // Définit req.user = { userId, email, role }
  // Erreurs: 401 (pas de token), 401 (token expiré→TOKEN_EXPIRED), 401 (token invalide)

authorize(...roles: string[]): (req, res, next) => void
  // Vérifie req.user.role inclus dans roles
  // Erreurs: 401 (non auth), 403 (mauvais rôle)
```

### error.middleware.ts
```typescript
class AppError extends Error {
  constructor(message: string, statusCode: number = 500)
  // this.statusCode, this.isOperational
}

errorHandler: (err, req, res, next) => void
  // AppError → statusCode + message
  // ZodError → 400 + { field, message }[]
  // Prisma P2002 → 409 (duplicate)
  // Prisma P2025 → 404 (not found)
  // Autres → 500
```

### audit.middleware.ts
```typescript
auditLogger: (req, res, next) => void
  // Logge POST/PUT/PATCH/DELETE vers ActivityLog (sauf auth/login, register, refresh-token, health)
  // Sanitize: supprime password, tokens du body
  // Fire-and-forget (catch silencieux)
```

---

## 9. Configuration (backend/src/config/index.ts)

```typescript
config = {
  env: string,                    // NODE_ENV (def: 'development')
  port: number,                   // PORT (def: 5000)
  jwt: {
    secret: string,               // JWT_SECRET
    refreshSecret: string,        // JWT_REFRESH_SECRET
    expiresIn: string,            // JWT_EXPIRES_IN (def: '15m')
    refreshExpiresIn: string      // JWT_REFRESH_EXPIRES_IN (def: '7d')
  },
  smtp: { host, port, user, pass, from },
  frontendUrl: string,            // FRONTEND_URL (def: 'http://localhost:5173')
  googleMaps: { apiKey: string },
}
```

---

## 10. Variables d'Environnement

### backend/.env
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_shuttle
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@smartshuttle.com
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
GOOGLE_MAPS_API_KEY=
UPLOAD_DIR=uploads
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### frontend/.env
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
# Free map stack — Leaflet + OSM + Nominatim + OSRM (no API key needed)
```
