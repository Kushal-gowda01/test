import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@both/utils';
import { Wind, LayoutDashboard, Users, Home } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/community', label: 'Community', icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wind className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AIR</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = router.pathname === item.href ||
                  (item.href !== '/' && router.pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      active
                        ? 'bg-white/10 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-400" />
              <span className="font-bold gradient-text">AIR</span>
              <span className="text-sm text-gray-500">— Air Intelligence & Response</span>
            </div>
            <p className="text-xs text-gray-600 text-center">
              © 2026 AIR. Making environmental data accessible for everyone.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
              <Link href="/community" className="hover:text-emerald-400 transition-colors">Community</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
