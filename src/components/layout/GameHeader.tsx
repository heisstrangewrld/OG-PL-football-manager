'use client';

import React from 'react';
import { useCareerStore } from '@/stores/useCareerStore';
import { useSeasonStore } from '@/stores/useSeasonStore';
import { formatGBP, formatDate } from '@/lib/utils';
import { Play, Calendar, Award, CalendarDays } from 'lucide-react';

export const GameHeader: React.FC = () => {
  const {
    currentDate,
    clubName,
    clubId,
    transferBudget,
    wageBudgetWeekly,
    currentWageBillWeekly,
    boardConfidence,
    advanceDay,
  } = useCareerStore();

  const { currentGameweek, fixtures, initSeason, simulateGameweek, advanceGameweek } =
    useSeasonStore();

  const handleContinue = () => {
    // Init season if not done yet
    if (fixtures.length === 0) {
      initSeason(clubId);
    }

    // Simulate all non-user matches in the current gameweek
    simulateGameweek(currentGameweek, clubId);

    // Advance the in-game calendar day
    advanceDay();

    // Check if all GW fixtures are settled → advance GW
    const gwFixtures = fixtures.filter((f) => f.gameweek === currentGameweek);
    const allDone = gwFixtures.length > 0 && gwFixtures.every((f) => f.played);
    if (allDone) {
      advanceGameweek();
    }
  };

  return (
    <header className="h-14 lg:h-16 border-b border-border bg-surface px-3 lg:px-6 flex items-center justify-between sticky top-0 z-40 gap-2">
      {/* Club & Date */}
      <div className="flex items-center gap-2 lg:gap-6 min-w-0">
        <div className="min-w-0">
          <span className="hidden sm:block text-xs uppercase tracking-wider text-gray-400 font-semibold leading-none">
            Managed Club
          </span>
          <h1 className="text-sm lg:text-lg font-bold text-white flex items-center gap-1.5 lg:gap-2 truncate">
            <span className="inline-block w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-pl-cyan shadow-sm shadow-pl-cyan/50 shrink-0" />
            <span className="truncate">{clubName}</span>
          </h1>
        </div>

        <div className="hidden md:block h-8 w-[1px] bg-border" />

        <div className="hidden md:flex items-center gap-2 text-sm text-gray-300 bg-background/60 px-3 py-1.5 rounded-md border border-border/80 shrink-0">
          <Calendar className="w-4 h-4 text-pl-cyan" />
          <span className="font-medium">{formatDate(currentDate)}</span>
        </div>

        {/* Gameweek pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-300 bg-background/60 px-3 py-1.5 rounded-md border border-border/80 shrink-0">
          <CalendarDays className="w-3.5 h-3.5 text-pl-cyan" />
          <span className="font-semibold">GW {currentGameweek}</span>
          <span className="text-gray-500">/ 38</span>
        </div>
      </div>

      {/* Financials & Confidence */}
      <div className="flex items-center gap-2 lg:gap-6">
        <div className="hidden lg:flex items-center gap-4 bg-background/50 px-4 py-1.5 rounded-lg border border-border/70 text-xs">
          <div>
            <span className="text-gray-400">Transfer:</span>{' '}
            <span className="text-white font-semibold">{formatGBP(transferBudget)}</span>
          </div>
          <div className="w-[1px] h-4 bg-border" />
          <div>
            <span className="text-gray-400">Wage:</span>{' '}
            <span className="text-white font-semibold">
              {formatGBP(currentWageBillWeekly)} / {formatGBP(wageBudgetWeekly)}
            </span>
          </div>
          <div className="w-[1px] h-4 bg-border" />
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-gray-400">Board:</span>{' '}
            <span className="text-green-400 font-semibold">{boardConfidence}%</span>
          </div>
        </div>

        {/* Board confidence — compact on medium screens */}
        <div className="hidden md:flex lg:hidden items-center gap-1 text-xs bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/70">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-green-400 font-semibold">{boardConfidence}%</span>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 bg-gradient-to-r from-pl-cyan to-emerald-400 text-black font-bold rounded-lg shadow-lg shadow-pl-cyan/20 hover:brightness-110 active:scale-95 transition-all text-xs lg:text-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-black" />
          <span>Continue</span>
        </button>
      </div>
    </header>
  );
};
