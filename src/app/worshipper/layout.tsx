import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PublicNav } from '@/components/shared/PublicNav';

export default async function WorshipperLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'worshipper' && session.user.role !== 'admin') {
    redirect('/');
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
