# Nexum Web — Next.js 14 Frontend

Role-based web portal for Nexum. A single Next.js app renders different UI per role after login.

## Role → View mapping

| Role | Landing after login | Pages |
|------|---------------------|-------|
| Unauthenticated | `/properties` (public) | Browse properties, property detail |
| Worshipper | `/worshipper/bookings` | My bookings, browse + book properties |
| Medical Officer | `/officer/incidents` | Incident queue |
| Security Officer | `/officer/missing-persons` | Missing persons + incident queue |
| Driver | `/driver/rides` | Shuttle ride management |
| Admin | `/admin/dashboard` | Full portal — all modules |

## Tech Stack

- **Next.js 14** App Router + TypeScript
- **NextAuth v4** — JWT session, credentials provider, role-based middleware
- **Tailwind CSS** + Radix UI primitives
- **react-leaflet** — Leaflet maps for geofence editor
- **@microsoft/signalr** — Real-time incident and alert updates
- **sonner** — Toast notifications
- **Cypress 13** — E2E tests

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL and NEXTAUTH_SECRET

# Development
npm run dev
# → http://localhost:3000

# Build
npm run build && npm start
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:7001/v1     # Backend API URL
NEXTAUTH_URL=http://localhost:3000               # This app's URL
NEXTAUTH_SECRET=your-secret-min-32-chars        # Random string, keep secret
NEXT_PUBLIC_SIGNALR_URL=http://localhost:7001   # Backend for SignalR hubs
```

## Pages

### Public (no login required)
- `/` → redirects based on auth state
- `/properties` — Property listing grid
- `/properties/[id]` — Property detail + booking panel
- `/login` — Login form
- `/register` — Registration form
- `/forgot-password` — OTP-based password reset (3-step)

### Worshipper
- `/worshipper/bookings` — My bookings with confirmation codes

### Officer
- `/officer/incidents` — Incident queue (medical_officer, security_officer, admin)
- `/officer/missing-persons` — Alert queue (security_officer, admin)

### Driver
- `/driver/rides` — Shuttle management, on/off duty toggle

### Admin
- `/admin/dashboard` — Stats + live incident/alert panels
- `/admin/incidents` — Full incident management with detail panel
- `/admin/missing-persons` — Split pane: list + detail + sightings timeline
- `/admin/geofence` — Leaflet map editor + saved boundary list
- `/admin/bookings` — Booking table + check-in by confirmation code
- `/admin/users` — User list + create officer/driver modal
- `/admin/properties` — Property management (stub)
- `/admin/transit` — Transit ops (stub, connect ShuttleHub SignalR)

## Route Protection

Middleware in `src/middleware.ts` handles all redirects:
- Unauthenticated → `/login?callbackUrl=...`
- Wrong role → redirected to that role's home page
- Authenticated on login/register → redirected to role home

## SignalR Real-Time

Use the `useSignalR` hook for live updates:
```tsx
import { useSignalR } from '@/hooks/useSignalR';

useSignalR('emergency', {
  NewIncidentAlert: (incident) => { /* handle */ },
  IncidentStatusChanged: (update) => { /* handle */ },
});
```

Hubs: `emergency` | `missing-persons` | `shuttle`

## Running E2E Tests

```bash
# Start the dev server first
npm run dev

# In another terminal
npm run cy:open    # Interactive Cypress UI
npm run cy:run     # Headless CI mode

# Or both together
npm run test:e2e
```

Set test credentials in `cypress.config.ts` env section or `cypress.env.json`.

## Booking Flow (Worshipper)

1. Browse `/properties` — no login required
2. Click property → `/properties/[id]`
3. Select room type + dates in the booking panel
4. If unauthenticated: redirected to `/login?callbackUrl=/properties/[id]`
5. After login: booking form submits `POST /bookings`
6. Confirmation code displayed once Paystack webhook fires

## Deploying to Vercel

```bash
vercel --prod
```

Set environment variables in Vercel dashboard. The `next.config.js` rewrites
`/api/backend/*` to your backend API, keeping CORS clean.
