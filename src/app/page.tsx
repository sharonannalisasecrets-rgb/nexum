import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Role } from '@/types';
import Link from 'next/link';

const ROLE_HOME: Record<Role, string> = {
  worshipper:       '/worshipper/bookings',
  medical_officer:  '/officer/incidents',
  security_officer: '/officer/missing-persons',
  driver:           '/driver/rides',
  admin:            '/admin/dashboard',
  host:             '/host/properties',
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0047AB] py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-white p-2 rounded-md shadow-sm">
            <span className="font-extrabold text-[#0047AB] text-sm tracking-tight">Nexum</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-white text-sm font-semibold">
          <a href="#features" className="hover:text-[#FFA500] transition-colors">Features</a>
          <a href="#modules" className="hover:text-[#FFA500] transition-colors">Modules</a>
          <Link href="/properties" className="hover:text-[#FFA500] transition-colors">Properties</Link>
        </nav>
        <button className="bg-[#FFA500] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-sm">
          <Link href="/login">Login / Sign up</Link>
        </button>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 text-center relative" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(239,246,255,0.88)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuAYwGOK22-q1DQYz7mFflh5HGs7S7pKP5lSrrODhlPPeBXwjwXBx2lsJFbpLeYdJKehoE0rDPj5yISwsSU8w0fWWbjJMtoeO2ToXIZDEHOux-oEMArwqIAkXPE5aRSykxe4JbQHbwjaKuN38D9qmTTcbnZwcsA7MAgM9luEooXi2z-znjxn_n7LFwJqhbaDg5HWVWh44u5s5NoVmoBQ1S6aFrd_BxrGWZxB20pGKB_wVNO9104KFFuRlhCoTgnm5apFazu1o7h6RSc)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">Safety Intelligence for <br/><span className="text-[#0047AB]">Redemption City</span></h1>
<p className="text-slate-700 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">Real-time emergency dispatch, automated escalation, and crowd coordination for the world&apos;s largest regular gathering — 5 million worshippers, one platform.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register" className="bg-[#0047AB] text-white px-10 py-3 rounded-lg font-bold shadow-md hover:bg-[#003380] transition-all inline-block">Create Account</Link>
            <Link href="/properties" className="bg-white border border-slate-200 text-slate-800 px-10 py-3 rounded-lg font-bold hover:bg-slate-50 transition-all inline-block">Browse Properties</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            <div className="bg-[#0047AB] text-white p-4 rounded-lg flex flex-col justify-center">
              <span className="text-2xl md:text-3xl font-extrabold">5M+</span>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-1">Peak worshippers</span>
            </div>
            <div className="bg-white/90 text-[#0047AB] p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
              <span className="text-2xl md:text-3xl font-extrabold">2,500</span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-600 mt-1">Hectares covered</span>
            </div>
            <div className="bg-white/90 text-[#0047AB] p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
              <span className="text-2xl md:text-3xl font-extrabold">3s</span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-600 mt-1">Emergency dispatch</span>
            </div>
            <div className="bg-[#0047AB] text-white p-4 rounded-lg flex flex-col justify-center">
              <span className="text-2xl md:text-3xl font-extrabold">24/7</span>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-1">Always active</span>
            </div>
          </div>
        </div>
      </section>

      {/* The coordination gap */}
      <section className="bg-gray-50 py-16 px-6" id="features">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">The coordination gap Nexum closes</h2>
Real-time emergency dispatch, automated escalation, and crowd coordination for the world&apos;s largest regular gathering — 5 million worshippers, one platform.
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-lg">⏱</div>
            <h3 className="font-bold text-base mb-2 text-slate-900">Manual response is too slow</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Locating a responder in a crowd of millions takes over 15 minutes. In cardiac arrest, every minute reduces survival rate by 10%.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-lg">🔔</div>
            <h3 className="font-bold text-base mb-2 text-slate-900">Escalation depends on humans</h3>
            <p className="text-sm text-slate-600 leading-relaxed">No automated protocol exists to reward and route text-based emergencies or broadcast missing person alerts to every device inside camp.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-lg">🗂</div>
            <h3 className="font-bold text-base mb-2 text-slate-900">Infrastructure is invisible</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Guest properties operate with no unified security directory. Bookings happen through WhatsApp leading to leakage with no double booking protection.</p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 px-6 bg-white" id="modules">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">One platform, every module</h2>
            <p className="text-slate-500 text-sm md:text-base">Built specifically for Redemption City. Each module addresses a real operational failure.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '📍', title: 'Emergency Dispatch', desc: 'One-tap emergency report. Server captures GPS, runs PostGIS proximity match, dispatches the nearest available officer within 3 seconds via SignalR WebSocket and FCM push.' },
              { icon: '👤', title: 'Missing Persons', desc: 'Geofenced broadcast of missing person alerts with photographs to every device inside camp simultaneously. Sightings reported with GPS coordinates update a live map for security officers.' },
              { icon: '🚗', title: 'Smart Parking', desc: 'Worshippers pin their car\'s GPS location on arrival. Blocking vehicle reports trigger immediate owner notification. No response in 5 minutes escalates automatically to traffic wardens.' },
              { icon: '🚐', title: 'Transit & Shuttle Routing', desc: 'Shuttle dispatch via pgRouting over a digitised camp road network. Real-time congestion detection reroutes active journeys automatically. Admin can close road segments instantly.' },
            ].map(mod => (
              <div key={mod.title} className="bg-blue-50 p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{mod.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{mod.desc}</p>
                <a href="#" className="text-[#0047AB] font-bold text-sm">Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Built for every role</h2>
          <p className="text-slate-500 text-sm md:text-base">One app, personalised for how you serve the camp.</p>
        </div>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🙏', name: 'Worshipper', desc: 'Report emergencies, find missing persons, pin your car, and book verified accommodation.' },
            { icon: '⚕️', name: 'Medical Officer', desc: 'Receive real-time dispatch alerts, manage incident cases, and locate nearest equipment.' },
            { icon: '👮', name: 'Security Officer', desc: 'Monitor missing person alerts, receive dispatch notifications, and coordinate responses.' },
            { icon: '🚌', name: 'Shuttle Driver', desc: 'Accept pickup requests based on your location and navigate the camp road network.' },
          ].map(role => (
            <div key={role.name} className="bg-white p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{role.icon}</div>
              <h4 className="font-bold text-slate-900 mb-2">{role.name}</h4>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0047AB] text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Looking for accommodation at Redemption City?</h2>
          <p className="text-blue-100 text-sm md:text-base mb-6">Browse approved guest properties. No account needed to explore, only required when you book.</p>
          <Link href="/properties" className="inline-block bg-[#FFA500] text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all">Browse Properties</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded">
              <span className="font-black text-slate-900 text-xs">Nexum</span>
            </div>
          </div>
          <div className="text-center">© 2026 Nexum Intelligence. All rights reserved. · Designed for Redemption City</div>
        </div>
      </footer>
    </div>
  );
}
