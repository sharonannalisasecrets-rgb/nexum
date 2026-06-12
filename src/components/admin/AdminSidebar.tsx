'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, AlertTriangle, Search, Map, Bus,
  Building2, BookOpen, Users, LogOut, Shield,
} from 'lucide-react';
import { cn, roleName } from '@/lib/utils';

const NAV = [
  { label: 'Overview', items: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'Safety', items: [
    { href: '/admin/missing-persons', label: 'Missing Persons', icon: Search },
    { href: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  ]},
  { label: 'Camp', items: [
    { href: '/admin/geofence', label: 'Geofence', icon: Map },
    { href: '/admin/transit', label: 'Transit', icon: Bus },
  ]},
  { label: 'Accommodation', items: [
    { href: '/admin/properties', label: 'Properties', icon: Building2 },
    { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  ]},
  { label: 'Admin', items: [
    { href: '/admin/users', label: 'Users', icon: Users },
  ]},
];

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-primary text-white flex flex-col">
      {/* Brand */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-200" />
          <span className="font-bold text-lg">Nexum</span>
        </div>
        <div className="text-xs text-orange-200 mt-1">{roleName(user.role)}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV.map(group => (
          <div key={group.label} className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-blue-300 px-2 mb-1 font-medium">
              {group.label}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors',
                    active
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-primary/80 hover:bg-white/10 hover:text-white'
                  )}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/10">
        <div className="text-sm font-medium truncate">{user.name}</div>
        <div className="text-xs text-orange-200 truncate">{user.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-2 flex items-center gap-2 text-xs text-orange-200 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
