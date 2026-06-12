Prerequisites

- Node.js and npm installed
- Docker (optional, to run Postgres)

Run Postgres locally (optional)

```bash
docker run -d --name nexum-db \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-e POSTGRES_DB=nexum_dev \
	-p 5432:5432 postgres:15
```

Setup and generate client

```bash
cd backend
npm install
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexum_dev"
npx prisma generate
npx prisma migrate deploy
```

Run the seed script (creates/upserts the demo users)

```bash
cd backend
# uses ts-node to run prisma/seed.ts
npm run seed

# Alternate JS fallback (uses postgres client):
# npm run seed-pg
```

Note: `backend/prisma/seed.ts` reads `DATABASE_URL` from environment or `backend/.env`.

Start the backend

```bash
export PORT=7001
npm run start:dev
```

Default seeded accounts

- Admin: admin@nexum.ng / Nexum@Admin2026!
- Worshipper: worshipper@nexum.ng / Nexum@2026!
- Medical officer: medical@nexum.ng / Nexum@2026!
- Security officer: security@nexum.ng / Nexum@2026!
- Driver: driver@nexum.ng / Nexum@2026!
- Host: host@nexum.ng / Nexum@2026!

Testing login (curl)

```bash
curl -i -X POST http://localhost:7001/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@nexum.ng","password":"Nexum@Admin2026!"}'
```

If you have issues, check:

- `npx prisma studio` to inspect DB records
- Backend logs for errors
- Ensure `DATABASE_URL` points to the same DB used by migrations/seed
