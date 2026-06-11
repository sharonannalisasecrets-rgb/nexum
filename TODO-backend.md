# Backend Implementation TODO (NestJS + Prisma/Postgres)

## Phase 1 — Skeleton + contract alignment
- [ ] Create `backend/` NestJS project scaffolding (within repo).
- [ ] Add config: env vars, CORS, request-id generation.
- [ ] Implement global API response envelope: `{ success, data, error, meta }`.
- [ ] Add JWT auth system (access+refresh) and role-based guards.
- [ ] Implement auth endpoints required by frontend:
  - [ ] `POST /auth/register`
  - [ ] `POST /auth/login`
  - [ ] `POST /auth/refresh`
  - [ ] `GET /auth/me`
  - [ ] `PUT /auth/me/profile`
  - [ ] `POST /auth/forgot-password`
  - [ ] `POST /auth/verify-otp`
  - [ ] `POST /auth/reset-password`

## Phase 2 — Prisma + persistence models
- [ ] Add `backend/prisma/schema.prisma` aligned with `src/types/index.ts`.
- [ ] Configure Postgres + PostGIS for geofence polygons.
- [ ] Implement Prisma client wiring.
- [ ] Add migrations + seed (minimal dev seed).

## Phase 3 — Implement required endpoints (stubs → real)
- [ ] Properties endpoints:
  - [ ] `GET /properties`
  - [ ] `GET /properties/:id`
  - [ ] `GET /properties/:id/room-types`
  - [ ] `GET /properties/:id/availability?checkIn&checkOut`
- [ ] Booking endpoints:
  - [ ] `POST /bookings`
  - [ ] `GET /bookings/mine`
  - [ ] `GET /bookings/:id`
  - [ ] `GET /bookings/lookup/:code`
  - [ ] `POST /bookings/:id/check-in`
  - [ ] `GET /admin/bookings`
- [ ] Emergency endpoints:
  - [ ] `POST /emergency/report`
  - [ ] `GET /emergency/incidents`
  - [ ] `GET /emergency/incidents/:id`
  - [ ] `PUT /emergency/incidents/:id/status`
  - [ ] `PUT /emergency/officers/availability`
- [ ] Missing persons endpoints:
  - [ ] `GET /alerts/missing-persons`
  - [ ] `GET /alerts/missing-persons/:id`
  - [ ] `POST /alerts/missing-persons`
  - [ ] `PUT /alerts/missing-persons/:id/status`
  - [ ] `GET /alerts/missing-persons/:id/sightings`
- [ ] Admin geofence + properties + users:
  - [ ] `GET /admin/geofence/active`
  - [ ] `GET /admin/geofence`
  - [ ] `POST /admin/geofence`
  - [ ] `PUT /admin/geofence/:id`
  - [ ] `PUT /admin/geofence/:id/activate`
  - [ ] `GET /admin/properties`
  - [ ] `PUT /admin/properties/:id/approve`
  - [ ] `PUT /admin/properties/:id/reject`
  - [ ] `PUT /admin/properties/:id/supervise`
  - [ ] `GET /admin/users`
  - [ ] `POST /admin/users`
- [ ] Transit + shuttle endpoints:
  - [ ] `GET /transit/network/nodes`
  - [ ] `GET /transit/network/edges`
  - [ ] `GET /transit/vehicles/live`
  - [ ] `PUT /transit/network/edges/:id/close`
  - [ ] `PUT /transit/network/edges/:id/open`
- [ ] Host bank accounts endpoints:
  - [ ] `GET /host/bank-accounts/banks`
  - [ ] `POST /host/bank-accounts/verify`
  - [ ] `GET /host/bank-accounts`
  - [ ] `POST /host/bank-accounts`
  - [ ] `DELETE /host/bank-accounts/:id`
- [ ] Transfers:
  - [ ] `GET /admin/bookings/:bookingId/transfers`

## Phase 4 — SignalR hubs
- [ ] Implement SignalR hubs:
  - [ ] `emergency`
  - [ ] `missing-persons`
  - [ ] `shuttle`
- [ ] Wire hub event names to actual payloads used in frontend components.

## Phase 5 — Verification
- [ ] Run frontend against backend in dev.
- [ ] Validate login flow + one full workflow (incident report → admin dashboard shows it).
- [ ] Add minimal e2e smoke tests (or backend integration tests).

