'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Trophy, DollarSign, CalendarDays, Activity, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Squad', href: '/squad', icon: Users },
  { name: 'Tactics', href: '/tactics', icon: Flame },
  { name: 'Transfers', href: '/transfers', icon: DollarSign },
  { name: 'Schedule', href: '/schedule', icon: CalendarDays },
  { name: 'Matchday', href: '/matchday', icon: Activity },
];

export const GameSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pl-purple to-pl-pink flex items-center justify-center font-black text-white text-sm shadow-md">
            PL
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">MANAGER</h2>
            <p className="text-[10px] text-gray-400 font-medium">Premier League 25/26</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-pl-cyan/15 text-pl-cyan border border-pl-cyan/30 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-surfaceHover'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-pl-cyan' : 'text-gray-400')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/80 text-[11px] text-gray-500 flex justify-between items-center">
        <span>Engine v1.0 • 4Hz</span>
        <span className="text-pl-cyan font-semibold">Ready</span>
      </div>
    </aside>
  );
};
