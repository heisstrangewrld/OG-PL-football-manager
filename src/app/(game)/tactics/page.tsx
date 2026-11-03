'use client';

import React from 'react';
import { TacticalPitch } from '@/components/tactics/TacticalPitch';
import { InstructionsPanel } from '@/components/tactics/InstructionsPanel';
import { SubstitutesList } from '@/components/tactics/SubstitutesList';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { PlayerRole, PlayerDuty } from '@/engine/types';

const AVAILABLE_ROLES: PlayerRole[] = [
  'GOALKEEPER',
  'SWEEPER_KEEPER',
  'CENTER_BACK',
  'BALL_PLAYING_DEFENDER',
  'FULL_BACK',
  'WING_BACK',
  'DEFENSIVE_MIDFIELDER',
  'BALL_WINNING_MIDFIELDER',
  'CENTRAL_MIDFIELDER',
  'BOX_TO_BOX',
  'DEEP_LYING_PLAYMAKER',
  'ATTACKING_MIDFIELDER',
  'WINGER',
  'INSIDE_FORWARD',
  'STRIKER',
  'TARGET_MAN',
  'POACHER',
];

const AVAILABLE_DUTIES: PlayerDuty[] = ['DEFEND', 'SUPPORT', 'ATTACK'];

export default function TacticsPage() {
  const {
    startingXI,
    selectedPlayerId,
    setPlayerRole,
    setPlayerDuty,
  } = useTacticsStore();

  const selectedPlayer = startingXI.find((p) => p.id === selectedPlayerId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Tactical Command</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure team shape, player roles, spatial duties, and game instructions.
          </p>
        </div>

        {/* Selected Player Role / Duty Quick Editor */}
        {selectedPlayer && (
          <div className="flex items-center gap-3 bg-surface p-2 px-4 rounded-xl border border-pl-cyan/40 shadow-lg">
            <span className="text-xs font-bold text-white">
              {selectedPlayer.name} ({selectedPlayer.position})
            </span>
            <div className="h-4 w-[1px] bg-border" />
            <select
              value={selectedPlayer.role}
              onChange={(e) => setPlayerRole(selectedPlayer.id, e.target.value as PlayerRole)}
              className="bg-background border border-border text-xs font-bold text-pl-cyan rounded px-2 py-1 outline-none cursor-pointer"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <select
              value={selectedPlayer.duty}
              onChange={(e) => setPlayerDuty(selectedPlayer.id, e.target.value as PlayerDuty)}
              className="bg-background border border-border text-xs font-bold text-yellow-400 rounded px-2 py-1 outline-none cursor-pointer"
            >
              {AVAILABLE_DUTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Tactical Grid: Pitch (Left) + Instructions Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pitch Container */}
        <div className="lg:col-span-6 flex justify-center">
          <TacticalPitch />
        </div>

        {/* Instructions Container */}
        <div className="lg:col-span-6 h-[580px]">
          <InstructionsPanel />
        </div>
      </div>

      {/* Bench / Substitutes List */}
      <div>
        <SubstitutesList />
      </div>
    </div>
  );
}
