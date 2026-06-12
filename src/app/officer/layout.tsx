import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OfficerSidebar } from '@/components/officer/OfficerSidebar';

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const allowed = ['medical_officer', 'security_officer', 'admin'];
  if (!allowed.includes(session.user.role)) redirect('/');
  return (
    <div className="flex h-screen bg-gray-50">
      <OfficerSidebar user={session.user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
