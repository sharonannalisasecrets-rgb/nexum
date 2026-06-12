import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DriverSidebar } from '@/components/driver/DriverSidebar';

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'driver' && session.user.role !== 'admin') redirect('/');
  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar user={session.user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
