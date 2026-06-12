import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { HostSidebar } from '@/components/host/HostSidebar';

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'host' && session.user.role !== 'admin') redirect('/');

  return (
    <div className="flex h-screen bg-gray-50">
      <HostSidebar user={session.user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
