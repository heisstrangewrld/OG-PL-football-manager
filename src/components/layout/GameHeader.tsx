'use client';

import React from 'react';
import { useCareerStore } from '@/stores/useCareerStore';
import { formatGBP, formatDate } from '@/lib/utils';
import { Play, Calendar, Wallet, Award, Bell } from 'lucide-react';

export const GameHeader: React.FC = () => {
  const {
    currentDate,
    clubName,
    transferBudget,
    wageBudgetWeekly,
    currentWageBillWeekly,
    boardConfidence,
    advanceDay,
  } = useCareerStore();

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Club & Date */}
      <div className="flex items-center gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Managed Club</span>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-pl-cyan shadow-sm shadow-pl-cyan/50" />
            {clubName}
          </h1>
        </div>

        <div className="h-8 w-[1px] bg-border" />

        <div className="flex items-center gap-2 text-sm text-gray-300 bg-background/60 px-3 py-1.5 rounded-md border border-border/80">
          <Calendar className="w-4 h-4 text-pl-cyan" />
          <span className="font-medium">{formatDate(currentDate)}</span>
        </div>
      </div>

      {/* Financials & Confidence */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 bg-background/50 px-4 py-1.5 rounded-lg border border-border/70 text-xs">
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

        {/* Continue Button */}
        <button
          onClick={advanceDay}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pl-cyan to-emerald-400 text-black font-bold rounded-lg shadow-lg shadow-pl-cyan/20 hover:brightness-110 active:scale-95 transition-all text-sm"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Continue</span>
        </button>
      </div>
    </header>
  );
};
