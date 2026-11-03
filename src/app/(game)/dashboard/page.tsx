'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCareerStore } from '@/stores/useCareerStore';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { useSeasonStore } from '@/stores/useSeasonStore';
import { Trophy, ArrowRight, CalendarDays } from 'lucide-react';
import { formatGBP } from '@/lib/utils';

export default function DashboardPage() {
  const { clubId, clubName, balance, transferBudget, currentWageBillWeekly } = useCareerStore();
  const { tactics, startingXI } = useTacticsStore();
  const { fixtures, standings, currentGameweek, initSeason } = useSeasonStore();

  // Init season if not yet done
  useEffect(() => {
    if (fixtures.length === 0) initSeason(clubId);
  }, [fixtures.length, initSeason, clubId]);

  // Next fixture for user club
  const nextFixture = fixtures.find(
    (f) => !f.played && (f.homeId === clubId || f.awayId === clubId),
  );

  // User standing
  const userStanding = standings.find((s) => s.clubId === clubId);
  const userPos = standings.findIndex((s) => s.clubId === clubId) + 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-5 lg:p-6 rounded-2xl bg-gradient-to-r from-pl-purple via-[#250036] to-surface border border-pl-purple/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-pl-cyan font-bold">Manager Hub</span>
          <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">Welcome back, Boss</h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Season 2025/2026 is underway — GW {currentGameweek} of 38.
          </p>
        </div>

        <Link
          href="/tactics"
          className="px-5 py-2.5 bg-pl-cyan text-black font-extrabold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <span>Tactical Setup</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid: Next Fixture + League Status + Club Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Match Card */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Next Competitive Fixture
              </span>
              <span className="text-xs font-bold text-pl-pink bg-pl-pink/10 px-2.5 py-1 rounded-full border border-pl-pink/20">
                Premier League • GW {nextFixture?.gameweek ?? currentGameweek}
              </span>
            </div>

            {nextFixture ? (
              <div className="flex items-center justify-around py-6 border-y border-border/70 my-2">
                {/* Home */}
                <div className="text-center">
                  <div
                    className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl border-2 flex items-center justify-center font-black text-lg mx-auto shadow-md"
                    style={{
                      background: `color-mix(in srgb, ${nextFixture.homeId === clubId ? '#6CABDD' : '#DC2626'} 15%, transparent)`,
                      borderColor: `color-mix(in srgb, ${nextFixture.homeId === clubId ? '#6CABDD' : '#DC2626'} 60%, transparent)`,
                      color: nextFixture.homeId === clubId ? '#6CABDD' : '#ef4444',
                    }}
                  >
                    {nextFixture.homeShort.slice(0, 3).toUpperCase()}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2">{nextFixture.homeName}</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">Home</span>
                </div>

                <div className="text-center">
                  <span className="text-3xl font-black text-gray-500">VS</span>
                  <span className="block text-[11px] text-gray-400 font-medium mt-1">
                    {nextFixture.date}
                  </span>
                </div>

                {/* Away */}
                <div className="text-center">
                  <div
                    className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl border-2 flex items-center justify-center font-black text-lg mx-auto shadow-md"
                    style={{
                      background: `color-mix(in srgb, ${nextFixture.awayId === clubId ? '#6CABDD' : '#DC2626'} 15%, transparent)`,
                      borderColor: `color-mix(in srgb, ${nextFixture.awayId === clubId ? '#6CABDD' : '#DC2626'} 60%, transparent)`,
                      color: nextFixture.awayId === clubId ? '#6CABDD' : '#ef4444',
                    }}
                  >
                    {nextFixture.awayShort.slice(0, 3).toUpperCase()}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2">{nextFixture.awayName}</h3>
                  <span className="text-[11px] text-gray-400 font-semibold">Away</span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm border-y border-border/70 my-2">
                No upcoming fixtures found. Season may be complete.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-gray-400">
              Active Tactic: <span className="text-white font-bold">{tactics.formation}</span> ({startingXI.length} Ready)
            </div>
            <Link
              href="/matchday"
              className="px-5 lg:px-6 py-2.5 bg-gradient-to-r from-pl-cyan to-emerald-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-pl-cyan/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Play Match</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right column: League pos + Club snapshot */}
        <div className="space-y-4">
          {/* League Position */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-pl-cyan" /> League Standing
            </h3>
            {userStanding ? (
              <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                  <span className="text-5xl font-black text-white">{userPos}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-1">Position</span>
                </div>
                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points</span>
                    <span className="font-bold text-white">{userStanding.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Played</span>
                    <span className="font-bold text-white">{userStanding.played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">W / D / L</span>
                    <span className="font-bold text-white">
                      {userStanding.won} / {userStanding.drawn} / {userStanding.lost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goal Diff</span>
                    <span className={`font-bold ${userStanding.goalDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {userStanding.goalDifference >= 0 ? '+' : ''}{userStanding.goalDifference}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Hit Continue to start the season.</p>
            )}
            <Link href="/schedule" className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-pl-cyan hover:underline">
              <CalendarDays className="w-3 h-3" /> View full table &amp; fixtures →
            </Link>
          </div>

          {/* Club Snapshot */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Club Snapshot</h3>

            <div className="space-y-2.5">
              <div className="p-2.5 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                <span className="text-xs text-gray-400">Liquid Balance</span>
                <span className="text-sm font-bold text-white">{formatGBP(balance)}</span>
              </div>
              <div className="p-2.5 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                <span className="text-xs text-gray-400">Transfer Budget</span>
                <span className="text-sm font-bold text-pl-cyan">{formatGBP(transferBudget)}</span>
              </div>
              <div className="p-2.5 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                <span className="text-xs text-gray-400">Weekly Wage Bill</span>
                <span className="text-sm font-bold text-white">{formatGBP(currentWageBillWeekly)}</span>
              </div>
            </div>

            <div className="p-2.5 bg-pl-cyan/10 border border-pl-cyan/30 rounded-xl text-[11px] text-pl-cyan font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Target: Premier League Champions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
