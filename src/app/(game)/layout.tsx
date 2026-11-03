import React from 'react';
import { GameSidebar } from '@/components/layout/GameSidebar';
import { GameHeader } from '@/components/layout/GameHeader';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop only */}
      <GameSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GameHeader />
        {/* pb-16 reserves space for the mobile bottom nav bar */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
