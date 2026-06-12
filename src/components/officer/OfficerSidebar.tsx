'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Search, LogOut, Shield } from 'lucide-react';
import { cn, roleName } from '@/lib/utils';
import type { Role } from '@/types';

const ALL_NAV = [
  { href: '/officer/incidents', label: 'Incidents', icon: AlertTriangle,
    roles: ['medical_officer', 'security_officer', 'admin'] },
  { href: '/officer/missing-persons', label: 'Missing Persons', icon: Search,
    roles: ['security_officer', 'admin'] },
];

export function OfficerSidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const pathname = usePathname();
  const nav = ALL_NAV.filter(item => item.roles.includes(user.role));

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
        {nav.map(item => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                active ? 'bg-white/15 text-white font-medium' : 'text-white/80 hover:bg-white/10'
              )}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="text-sm font-medium truncate">{user.name}</div>
        <button onClick={() => signOut({ callbackUrl: 'http://localhost:3000/login', redirect: true })}
          className="mt-2 flex items-center gap-2 text-xs text-orange-200 hover:text-white">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
