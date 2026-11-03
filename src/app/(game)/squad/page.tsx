'use client';

import React, { useState } from 'react';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { PlayerInput } from '@/engine/types';
import { PlayerRadarModal } from '@/components/squad/PlayerRadarModal';
import { Eye, Activity, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SquadPage() {
  const { startingXI, substitutes } = useTacticsStore();
  const [modalPlayer, setModalPlayer] = useState<PlayerInput | null>(null);

  const allPlayers = [...startingXI, ...substitutes];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">First Team Squad</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage player fitness, morale, contracts, and view tactical attribute ratings.
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-surface px-4 py-2 rounded-xl border border-border">
          Total Registered: <span className="text-white font-bold">{allPlayers.length} / 25</span>
        </div>
      </div>

      {/* Squad Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 text-gray-400 uppercase tracking-wider text-[10px] font-bold border-b border-border">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Condition</th>
                <th className="py-3 px-4 text-center">Morale</th>
                <th className="py-3 px-4 text-center">PAC</th>
                <th className="py-3 px-4 text-center">SHO</th>
                <th className="py-3 px-4 text-center">PAS</th>
                <th className="py-3 px-4 text-center">DRI</th>
                <th className="py-3 px-4 text-center">DEF</th>
                <th className="py-3 px-4 text-center">PHY</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {allPlayers.map((player, idx) => {
                const isStarter = idx < 11;
                const a = player.attributes;
                const pac = Math.round((a.pace + a.acceleration) / 2);
                const sho = Math.round(a.finishing * 0.6 + a.longShots * 0.4);
                const pas = Math.round(a.passing * 0.6 + a.vision * 0.4);
                const dri = Math.round(a.dribbling * 0.6 + a.firstTouch * 0.4);
                const def = Math.round(a.tackling * 0.6 + a.marking * 0.4);
                const phy = Math.round(a.strength * 0.5 + a.stamina * 0.5);

                return (
                  <tr
                    key={player.id}
                    className="hover:bg-surfaceHover/80 transition-colors group cursor-pointer"
                    onClick={() => setModalPlayer(player)}
                  >
                    <td className="py-3 px-4 font-bold text-gray-400 group-hover:text-white">
                      {player.shirtNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isStarter && (
                          <span className="w-1.5 h-1.5 rounded-full bg-pl-cyan" title="Starting XI" />
                        )}
                        <span className="font-bold text-white group-hover:text-pl-cyan transition-colors">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-pl-cyan bg-pl-cyan/10 px-2 py-0.5 rounded border border-pl-cyan/20">
                        {player.position}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {player.role.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-gray-200">100%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        Superb
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-200">{pac}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-200">{sho}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-200">{pas}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-200">{dri}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-200">{def}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-200">{phy}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalPlayer(player);
                        }}
                        className="p-1.5 rounded-lg bg-background border border-border text-gray-400 hover:text-white hover:border-pl-cyan transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attribute Radar Modal */}
      <PlayerRadarModal player={modalPlayer} onClose={() => setModalPlayer(null)} />
    </div>
  );
}
