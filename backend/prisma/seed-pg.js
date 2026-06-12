const postgres = require('postgres');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(2);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: false });

async function main() {
  const users = [
    { email: 'admin@nexum.ng', fullName: 'Admin', password: 'Nexum@Admin2026!', role: 'admin' },
    { email: 'worshipper@nexum.ng', fullName: 'Worshipper', password: 'Nexum@2026!', role: 'worshipper' },
    { email: 'medical@nexum.ng', fullName: 'Medical Officer', password: 'Nexum@2026!', role: 'medical_officer' },
    { email: 'security@nexum.ng', fullName: 'Security Officer', password: 'Nexum@2026!', role: 'security_officer' },
    { email: 'driver@nexum.ng', fullName: 'Driver', password: 'Nexum@2026!', role: 'driver' },
    { email: 'host@nexum.ng', fullName: 'Host', password: 'Nexum@2026!', role: 'host' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const id = `seed_${randomUUID()}`;

    await sql`
      INSERT INTO "User" (id, "fullName", email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (${id}, ${u.fullName}, ${u.email}, ${passwordHash}, ${u.role}, now(), now())
      ON CONFLICT (email) DO UPDATE
      SET "fullName" = EXCLUDED."fullName",
          "passwordHash" = EXCLUDED."passwordHash",
          role = EXCLUDED.role,
          "updatedAt" = now();
    `;

    console.log(`Upserted ${u.email}`);
  }

  await sql.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
