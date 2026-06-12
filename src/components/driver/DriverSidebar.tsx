'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Car, LogOut, Shield } from 'lucide-react';
import { cn, roleName } from '@/lib/utils';

export function DriverSidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 bg-primary text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-200" />
          <span className="font-bold">Nexum</span>
        </div>
        <div className="text-xs text-orange-200 mt-1">{roleName(user.role)}</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <Link href="/driver/rides"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
            pathname.startsWith('/driver/rides')
              ? 'bg-white/15 text-white font-medium'
              : 'text-white/80 hover:bg-white/10'
          )}>
          <Car className="h-4 w-4" />
          My Rides
        </Link>
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="text-sm font-medium truncate">{user.name}</div>
            <button onClick={() => signOut({ callbackUrl: 'http://localhost:3000/login', redirect: true })}
              className="mt-2 flex items-center gap-2 text-xs text-orange-200 hover:text-white transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
