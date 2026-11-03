'use client';

import React from 'react';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { cn } from '@/lib/utils';

export const SubstitutesList: React.FC = () => {
  const {
    startingXI,
    substitutes,
    selectedPlayerId,
    selectPlayer,
    substitutePlayer,
  } = useTacticsStore();

  const handleSubClick = (subIdx: number) => {
    if (selectedPlayerId === null) {
      // If nothing selected on pitch, do nothing or select sub
      return;
    }

    // Find starting index of selected player
    const startIdx = startingXI.findIndex((p) => p.id === selectedPlayerId);
    if (startIdx !== -1) {
      substitutePlayer(startIdx, subIdx);
      selectPlayer(null);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold">
          Substitutes ({substitutes.length})
        </h3>
        {selectedPlayerId && (
          <span className="text-[10px] text-pl-cyan font-bold bg-pl-cyan/10 px-2 py-0.5 rounded border border-pl-cyan/30 animate-pulse">
            Click a substitute to swap
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {substitutes.map((sub, idx) => (
          <div
            key={sub.id}
            onClick={() => handleSubClick(idx)}
            className={cn(
              'flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none',
              selectedPlayerId
                ? 'hover:border-pl-cyan hover:bg-pl-cyan/10 active:scale-95 border-border bg-background/60'
                : 'border-border/60 bg-background/40 hover:bg-background/80'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-surface border border-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {sub.shirtNumber}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-emerald-400 block leading-tight">
                {sub.position}
              </span>
              <span className="text-xs font-semibold text-gray-200 truncate block">
                {sub.name.split(' ').pop()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
