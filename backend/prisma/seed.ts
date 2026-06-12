import dotenv from 'dotenv';
// Use the generated Prisma client directly to avoid resolution issues
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: '.env' });
process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/nexum_dev';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, passwordHash, role: u.role as any },
      create: { email: u.email, fullName: u.fullName, passwordHash, role: u.role as any },
    });
    console.log(`Upserted ${u.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
