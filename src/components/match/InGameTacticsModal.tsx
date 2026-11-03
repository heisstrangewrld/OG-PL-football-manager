'use client';

import React from 'react';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { useMatchdayStore } from '@/stores/useMatchdayStore';
import { X, RefreshCw, Flame, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InGameTacticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InGameTacticsModal: React.FC<InGameTacticsModalProps> = ({ isOpen, onClose }) => {
  const { startingXI, substitutes, substitutePlayer } = useTacticsStore();
  const { pause } = useMatchdayStore();

  const [selectedStarterIdx, setSelectedStarterIdx] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const handleSub = (subIdx: number) => {
    if (selectedStarterIdx !== null) {
      substitutePlayer(selectedStarterIdx, subIdx);
      setSelectedStarterIdx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surfaceHover/50">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-pl-cyan" />
              <span>In-Game Tactical Adjustments</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select an on-pitch player and swap with a substitute.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Starting XI on Left, Bench on Right */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting XI */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              On Pitch ({startingXI.length})
            </h3>
            <div className="space-y-2">
              {startingXI.map((player, idx) => {
                const isSelected = selectedStarterIdx === idx;
                return (
                  <div
                    key={player.id}
                    onClick={() => setSelectedStarterIdx(isSelected ? null : idx)}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs',
                      isSelected
                        ? 'bg-pl-cyan/15 border-pl-cyan text-white shadow-sm ring-1 ring-pl-cyan'
                        : 'bg-background/50 border-border hover:bg-surfaceHover text-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-surface border border-white/20 flex items-center justify-center font-bold text-[11px] text-white">
                        {player.shirtNumber}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{player.name}</span>
                        <span className="text-[10px] text-pl-cyan font-bold">{player.position}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold">{player.role}</span>
                      {isSelected && <ArrowLeftRight className="w-3.5 h-3.5 text-pl-cyan animate-pulse" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Substitutes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Available Substitutes ({substitutes.length})
              </h3>
              {selectedStarterIdx !== null && (
                <span className="text-[10px] font-bold text-pl-cyan bg-pl-cyan/10 px-2 py-0.5 rounded border border-pl-cyan/30 animate-pulse">
                  Click sub to complete swap
                </span>
              )}
            </div>

            <div className="space-y-2">
              {substitutes.map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => handleSub(idx)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs',
                    selectedStarterIdx !== null
                      ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20 text-white'
                      : 'bg-background/40 border-border/60 hover:bg-background/80 text-gray-400'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface border border-white/20 flex items-center justify-center font-bold text-[11px] text-white">
                      {sub.shirtNumber}
                    </span>
                    <div>
                      <span className="font-bold text-gray-200 block">{sub.name}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">{sub.position}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-semibold">{sub.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-surfaceHover/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-pl-cyan text-black font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Done & Resume
          </button>
        </div>
      </div>
    </div>
  );
};
