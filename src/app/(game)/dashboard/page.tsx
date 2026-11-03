'use client';

import React from 'react';
import Link from 'next/link';
import { useCareerStore } from '@/stores/useCareerStore';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { Trophy, Calendar, ArrowRight, Shield, Award, Users, TrendingUp } from 'lucide-react';
import { formatGBP } from '@/lib/utils';

export default function DashboardPage() {
  const { clubName, balance, transferBudget, currentWageBillWeekly } = useCareerStore();
  const { tactics, startingXI } = useTacticsStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-pl-purple via-[#250036] to-surface border border-pl-purple/40 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-pl-cyan font-bold">Manager Hub</span>
          <h1 className="text-3xl font-black text-white mt-1">Welcome back, Boss</h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Preparations are underway for the opening fixture of the 2025/2026 Premier League campaign.
          </p>
        </div>

        <Link
          href="/tactics"
          className="px-5 py-2.5 bg-pl-cyan text-black font-extrabold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Tactical Setup</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid: Next Fixture + League Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Match Card */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Next Competitive Fixture
              </span>
              <span className="text-xs font-bold text-pl-pink bg-pl-pink/10 px-2.5 py-1 rounded-full border border-pl-pink/20">
                Premier League • Gameweek 1
              </span>
            </div>

            <div className="flex items-center justify-around py-6 border-y border-border/70 my-2">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6CABDD]/30 to-blue-600/10 border-2 border-[#6CABDD]/60 flex items-center justify-center font-black text-xl text-[#6CABDD] mx-auto shadow-md">
                  MCI
                </div>
                <h3 className="text-base font-bold text-white mt-2">{clubName}</h3>
                <span className="text-[11px] text-emerald-400 font-semibold">Home</span>
              </div>

              <div className="text-center">
                <span className="text-3xl font-black text-gray-500">VS</span>
                <span className="block text-[11px] text-gray-400 font-medium mt-1">Etihad Stadium</span>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/30 to-red-600/10 border-2 border-rose-500/60 flex items-center justify-center font-black text-xl text-rose-500 mx-auto shadow-md">
                  ARS
                </div>
                <h3 className="text-base font-bold text-white mt-2">Arsenal</h3>
                <span className="text-[11px] text-gray-400 font-semibold">Away</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-gray-400">
              Active Tactic: <span className="text-white font-bold">{tactics.formation}</span> ({startingXI.length} Ready)
            </div>
            <Link
              href="/matchday"
              className="px-6 py-2.5 bg-gradient-to-r from-pl-cyan to-emerald-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-pl-cyan/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Play Match</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Club Snapshot */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Club Snapshot</h3>

          <div className="space-y-3">
            <div className="p-3 bg-background/50 rounded-xl border border-border flex items-center justify-between">
              <span className="text-xs text-gray-400">Liquid Balance</span>
              <span className="text-sm font-bold text-white">{formatGBP(balance)}</span>
            </div>

            <div className="p-3 bg-background/50 rounded-xl border border-border flex items-center justify-between">
              <span className="text-xs text-gray-400">Transfer Budget</span>
              <span className="text-sm font-bold text-pl-cyan">{formatGBP(transferBudget)}</span>
            </div>

            <div className="p-3 bg-background/50 rounded-xl border border-border flex items-center justify-between">
              <span className="text-xs text-gray-400">Weekly Wage Bill</span>
              <span className="text-sm font-bold text-white">{formatGBP(currentWageBillWeekly)}</span>
            </div>

            <div className="p-3 bg-background/50 rounded-xl border border-border flex items-center justify-between">
              <span className="text-xs text-gray-400">Stadium Capacity</span>
              <span className="text-sm font-bold text-white">53,400</span>
            </div>
          </div>

          <div className="p-3 bg-pl-cyan/10 border border-pl-cyan/30 rounded-xl text-[11px] text-pl-cyan font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Target: Premier League Champions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
