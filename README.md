# Smart Shuttle Management System

Enterprise-grade web application for managing shuttle transportation for cultural and public events. Optimize routes, track vehicles in real-time, manage reservations, and deliver a seamless transportation experience.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Tailwind │ │ Shadcn UI│ │ Recharts │ │  Socket.IO    │  │
│  │   CSS    │ │Components│ │  Charts  │ │  Client       │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                     Backend (Node.js + Express)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  JWT Auth│ │  Socket  │ │   REST   │ │   Swagger     │  │
│  │          │ │    IO    │ │   API    │ │   Docs        │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────────┐
│                     PostgreSQL Database                      │
│  12 tables: Users, Events, Vehicles, Drivers, Routes,       │
│  Trips, Reservations, Notifications, TrackingLogs, etc.     │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn UI** / Radix UI for components
- **TanStack Query** for server state
- **React Hook Form** + **Zod** for forms
- **Recharts** for data visualization
- **react-router-dom** for routing
- **Socket.IO Client** for real-time
- **Zustand** for state management

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Prisma ORM** for database
- **PostgreSQL** for data storage
- **JWT** for authentication
- **Socket.IO** for real-time tracking
- **Swagger** for API documentation
- **Zod** for validation
- **Nodemailer** for emails

### DevOps
- **Docker** & **Docker Compose**
- Multi-stage Docker builds

## Features

### Authentication & Authorization
- Register, Login, JWT tokens
- Refresh token rotation
- Email verification
- Forgot/Reset password
- Role-Based Access Control (4 roles)

### Role-Based Dashboards
- **Super Admin** — Full system control
- **Organizer** — Event & reservation management
- **Driver** — Trip management & navigation
- **Participant** — Booking & live tracking

### Event Management
- Create, edit, archive events
- Capacity management
- GPS location & poster image
- Status workflow (Draft → Published → Ongoing → Completed)

### Shuttle & Driver Management
- Vehicle registry with status tracking
- Driver profiles and licensing
- Vehicle-driver assignment
- Availability management

### Route & Pickup Points
- Multi-stop route planning
- GPS coordinates for all points
- Estimated duration & distance
- Stop ordering

### Reservation System
- QR code generation for each booking
- Pickup point selection
- Real-time availability
- Cancelation management

### Real-Time Tracking
- Live GPS location updates via Socket.IO
- Trip progress monitoring
- Estimated arrival time
- Speed & heading data
- Driver-participant communication

### Notifications
- In-app notifications
- Email notifications
- Real-time push events via Socket.IO
- Reservation confirmations
- Trip status updates

### Reports & Analytics
- Daily, weekly, monthly reports
- Route analytics
- Occupancy rate tracking
- Export to PDF & Excel ready

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7 (optional, for rate limiting)
- Docker & Docker Compose (optional)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd smart-shuttle

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed the database
docker-compose exec backend npx tsx prisma/seed.ts
```

### Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
createdb smart_shuttle

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:postgres@localhost:5432/smart_shuttle` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_USER` | Email user | (required for email) |
| `SMTP_PASS` | Email password/app-password | (required for email) |
| `FRONTEND_URL` | CORS origin | `http://localhost:5173` |
| `GOOGLE_MAPS_API_KEY` | Google Maps | (optional) |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | WebSocket URL | `http://localhost:5000` |

## Test Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@smartshuttle.com` | `Admin@123` |
| Organizer | `organizer@smartshuttle.com` | `Admin@123` |
| Driver | `driver@smartshuttle.com` | `Admin@123` |
| Participant | `participant@smartshuttle.com` | `Admin@123` |

## API Documentation

When the backend is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health

### API Endpoints Overview

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/auth/verify-email/:token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
GET    /api/auth/profile
PUT    /api/auth/profile
PUT    /api/auth/change-password
```

#### Users (Admin)
```
GET    /api/users
GET    /api/users/:id
GET    /api/users/stats
PUT    /api/users/:id
DELETE /api/users/:id
```

#### Events
```
GET    /api/events
GET    /api/events/upcoming
GET    /api/events/stats
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

#### Drivers
```
GET    /api/drivers
GET    /api/drivers/:id
GET    /api/drivers/:id/today-trips
POST   /api/drivers
PUT    /api/drivers/:id
DELETE /api/drivers/:id
```

#### Vehicles
```
GET    /api/vehicles
GET    /api/vehicles/available
GET    /api/vehicles/:id
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
```

#### Routes
```
GET    /api/routes
GET    /api/routes/:id
POST   /api/routes
PUT    /api/routes/:id
DELETE /api/routes/:id
```

#### Pickup Points
```
GET    /api/pickup-points
GET    /api/pickup-points/:id
POST   /api/pickup-points
PUT    /api/pickup-points/:id
DELETE /api/pickup-points/:id
```

#### Reservations
```
GET    /api/reservations
GET    /api/reservations/my-reservations
GET    /api/reservations/stats
GET    /api/reservations/:id
POST   /api/reservations
PUT    /api/reservations/:id
PUT    /api/reservations/:id/cancel
```

#### Trips
```
GET    /api/trips
GET    /api/trips/active
GET    /api/trips/:id
POST   /api/trips
PUT    /api/trips/:id
PATCH  /api/trips/:id/start
PATCH  /api/trips/:id/complete
PATCH  /api/trips/:id/delay
DELETE /api/trips/:id
```

#### Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

#### Dashboard
```
GET    /api/dashboard/admin
GET    /api/dashboard/organizer
GET    /api/dashboard/driver
GET    /api/dashboard/participant
```

#### Reports
```
GET    /api/reports/daily
GET    /api/reports/weekly
GET    /api/reports/monthly
GET    /api/reports/routes
```

## Database Schema

### Entity Relationship Diagram

```
Users ──┬── Driver ── Vehicle
        │
        ├── Event ──┬── Route ── RouteStop
        │           ├── PickupPoint
        │           └── Reservation
        │
        ├── Reservation ──┬── Trip
        │                 └── PickupPoint
        │
        ├── Notification
        ├── ActivityLog
        └── ChatMessage

Trip ──┬── Driver
       ├── Vehicle
       ├── Route
       ├── Reservation
       └── TrackingLog
```

### Key Tables

- **users** — System users with role-based access
- **drivers** — Driver profiles linked to users
- **vehicles** — Shuttle bus registry
- **events** — Event management
- **routes** — Route definitions with stops
- **pickup_points** — Pickup locations per event
- **reservations** — Participant bookings with QR codes
- **trips** — Scheduled shuttle trips
- **tracking_logs** — GPS tracking history
- **notifications** — In-app notifications
- **chat_messages** — Driver-participant chat
- **activity_logs** — Audit trail

## Project Structure

```
smart-shuttle/
├── backend/
│   ├── docker/
│   │   └── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       │   ├── index.ts
│       │   ├── database.ts
│       │   └── swagger.ts
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
├── frontend/
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   ├── shared/
│       │   ├── charts/
│       │   └── maps/
│       ├── pages/
│       │   ├── auth/
│       │   ├── admin/
│       │   ├── organizer/
│       │   ├── driver/
│       │   └── participant/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       ├── types/
│       ├── lib/
│       ├── App.tsx
│       └── main.tsx
├── docker-compose.yml
└── README.md
```

## Scripts

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## Security

- JWT tokens with short expiration (15 min)
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Helmet.js for HTTP headers
- Rate limiting on API routes
- CORS restricted to frontend origin
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- Role-based access control middleware

## License

MIT
