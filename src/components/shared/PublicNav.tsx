'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Shield, LogOut, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui';
import { roleName } from '@/lib/utils';
import type { Session } from 'next-auth';

export function PublicNav({ session }: { session: Session | null }) {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-200" />
            <span className="font-bold text-lg">Nexum</span>
            <span className="text-orange-200 text-xs hidden sm:block">· Redemption City</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link href="/properties"
              className="text-sm text-primary/80 hover:text-white px-3 py-1.5 rounded hover:bg-white/10 transition-colors">
              Browse Properties
            </Link>

            {session ? (
              <>
                {session.user.role === 'worshipper' && (
                  <Link href="/worshipper/bookings"
                    className="flex items-center gap-1.5 text-sm text-blue-100 hover:text-white px-3 py-1.5 rounded hover:bg-white/10">
                    <BookOpen className="h-3.5 w-3.5" />
                    My Bookings
                  </Link>
                )}
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/20">
                  <div className="text-right">
                    <div className="text-xs font-medium">{session.user.name}</div>
                    <div className="text-[10px] text-orange-200">{roleName(session.user.role)}</div>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: '/login' })}
                    className="p-1.5 rounded hover:bg-white/10 text-orange-200 hover:text-white transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-primary/80 hover:text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-white text-primary hover:bg-primary/10">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
