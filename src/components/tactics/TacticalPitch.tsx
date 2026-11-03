'use client';

import React, { useState } from 'react';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { FORMATIONS } from '@/engine/tactics/FormationPresets';
import { PositionCode, PlayerInput } from '@/engine/types';
import { cn } from '@/lib/utils';

function getPosBadgeColor(pos: PositionCode): string {
  if (pos === 'GK') return 'bg-amber-600 text-amber-100';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'bg-blue-600 text-blue-100';
  if (['DM', 'CM', 'LM', 'RM', 'CAM'].includes(pos)) return 'bg-emerald-600 text-emerald-100';
  return 'bg-rose-600 text-rose-100';
}

export const TacticalPitch: React.FC = () => {
  const {
    tactics,
    startingXI,
    selectedPlayerId,
    selectPlayer,
    swapPlayers,
  } = useTacticsStore();

  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);

  const slots = FORMATIONS[tactics.formation] || FORMATIONS['4-3-3'];

  const handleSlotClick = (slotIdx: number) => {
    const clickedPlayer = startingXI[slotIdx];
    if (!clickedPlayer) return;

    if (selectedPlayerId === null) {
      selectPlayer(clickedPlayer.id);
    } else if (selectedPlayerId === clickedPlayer.id) {
      selectPlayer(null);
    } else {
      // Find slot index of selected player
      const prevIdx = startingXI.findIndex((p) => p.id === selectedPlayerId);
      if (prevIdx !== -1) {
        swapPlayers(prevIdx, slotIdx);
      }
      selectPlayer(null);
    }
  };

  return (
    <div className="relative w-full max-w-[540px] aspect-[68/105] bg-gradient-to-b from-[#1c4b22] to-[#143a19] rounded-2xl border-4 border-pitch-line shadow-2xl overflow-hidden select-none">
      {/* Turf Stripes Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06)_50%,transparent_50%)] bg-[length:100%_12.5%]" />

      {/* Pitch Markings (SVG overlay) */}
      <svg className="absolute inset-0 w-full h-full stroke-[#4ea854]/40 fill-none stroke-[1.8] pointer-events-none">
        {/* Outer Border Line */}
        <rect x="4%" y="3%" width="92%" height="94%" rx="4" />
        {/* Halfway Line */}
        <line x1="4%" y1="50%" x2="96%" y2="50%" />
        {/* Center Circle & Spot */}
        <circle cx="50%" cy="50%" r="14%" />
        <circle cx="50%" cy="50%" r="0.8%" fill="#4ea854" className="opacity-70" />

        {/* Top Penalty Box (Opponent) */}
        <rect x="22%" y="3%" width="56%" height="16%" />
        <rect x="36%" y="3%" width="28%" height="6%" />
        <path d="M 40% 19% A 10% 10% 0 0 0 60% 19%" />

        {/* Bottom Penalty Box (Own) */}
        <rect x="22%" y="81%" width="56%" height="16%" />
        <rect x="36%" y="91%" width="28%" height="6%" />
        <path d="M 40% 81% A 10% 10% 0 0 1 60% 81%" />
      </svg>

      {/* 11 Starting Players */}
      {startingXI.map((player, idx) => {
        const slot = slots[idx] || slots[0];
        // Vertical tactical board: X is horizontal (Y on 2D pitch), Y is vertical (X on 2D pitch)
        // normalizedPos.x is distance from own goal: 0.05 (GK) -> 0.85 (ST)
        // On vertical board: bottom is GK (92%), top is ST (12%)
        const topPct = 94 - slot.normalizedPos.x * 90;
        const leftPct = slot.normalizedPos.y * 100;
        const isSelected = selectedPlayerId === player.id;

        return (
          <div
            key={player.id}
            onClick={() => handleSlotClick(idx)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform duration-200 active:scale-95"
            style={{
              top: `${topPct}%`,
              left: `${leftPct}%`,
            }}
          >
            {/* Player Disc Token */}
            <div
              className={cn(
                'w-11 h-11 rounded-full flex flex-col items-center justify-center font-extrabold text-xs shadow-xl transition-all duration-150 border-2',
                isSelected
                  ? 'ring-4 ring-pl-cyan ring-offset-2 ring-offset-black scale-110 border-white bg-pl-cyan text-black'
                  : 'bg-surface border-white/80 text-white hover:border-pl-cyan hover:scale-105'
              )}
            >
              <span className="text-[13px] leading-none tracking-tight">{player.shirtNumber}</span>
            </div>

            {/* Position Badge & Name Label */}
            <div className="mt-1 flex flex-col items-center pointer-events-none">
              <span
                className={cn(
                  'text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider',
                  getPosBadgeColor(player.position)
                )}
              >
                {player.position}
              </span>
              <span className="text-[11px] font-bold text-white bg-black/75 px-2 py-0.5 rounded shadow-sm whitespace-nowrap mt-0.5 border border-white/10 group-hover:bg-black/90">
                {player.name.split(' ').pop()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
