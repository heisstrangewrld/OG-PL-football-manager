'use client';

import React, { useState } from 'react';
import { useTacticsStore } from '@/stores/useTacticsStore';
import { cn } from '@/lib/utils';

export const InstructionsPanel: React.FC = () => {
  const { tactics, setFormation, updateInstruction } = useTacticsStore();
  const [activeTab, setActiveTab] = useState<'POSSESSION' | 'TRANSITION' | 'DEFENDING'>('POSSESSION');

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xl flex flex-col h-full">
      {/* Formation Selector */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-2">
          Formation System
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['4-3-3', '4-2-3-1', '4-4-2'].map((f) => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              className={cn(
                'py-2.5 px-3 rounded-lg text-sm font-bold border transition-all',
                tactics.formation === f
                  ? 'bg-pl-cyan/15 text-pl-cyan border-pl-cyan shadow-sm shadow-pl-cyan/20'
                  : 'bg-background/60 text-gray-300 border-border hover:bg-surfaceHover'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('POSSESSION')}
          className={cn(
            'flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            activeTab === 'POSSESSION'
              ? 'border-pl-cyan text-pl-cyan'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          )}
        >
          In Possession
        </button>
        <button
          onClick={() => setActiveTab('TRANSITION')}
          className={cn(
            'flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            activeTab === 'TRANSITION'
              ? 'border-pl-cyan text-pl-cyan'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          )}
        >
          In Transition
        </button>
        <button
          onClick={() => setActiveTab('DEFENDING')}
          className={cn(
            'flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            activeTab === 'DEFENDING'
              ? 'border-pl-cyan text-pl-cyan'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          )}
        >
          Out of Possession
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {activeTab === 'POSSESSION' && (
          <div className="space-y-5">
            {/* Attacking Width */}
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-2">Attacking Width</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {(['NARROW', 'BALANCED', 'WIDE'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateInstruction('width', opt)}
                    className={cn(
                      'py-2 rounded-lg border transition-all',
                      tactics.width === opt
                        ? 'bg-pl-cyan text-black border-pl-cyan font-black'
                        : 'bg-background/60 text-gray-400 border-border hover:bg-surfaceHover'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo */}
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-2">Match Tempo</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {(['LOW', 'BALANCED', 'HIGH'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateInstruction('tempo', opt)}
                    className={cn(
                      'py-2 rounded-lg border transition-all',
                      tactics.tempo === opt
                        ? 'bg-pl-cyan text-black border-pl-cyan font-black'
                        : 'bg-background/60 text-gray-400 border-border hover:bg-surfaceHover'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Passing Style */}
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-2">Passing Directness</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {(['SHORT', 'MIXED', 'DIRECT'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateInstruction('passingStyle', opt)}
                    className={cn(
                      'py-2 rounded-lg border transition-all',
                      tactics.passingStyle === opt
                        ? 'bg-pl-cyan text-black border-pl-cyan font-black'
                        : 'bg-background/60 text-gray-400 border-border hover:bg-surfaceHover'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Play Out From Back Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold text-white block">Play Out From Back</span>
                <span className="text-[11px] text-gray-400">Invite press and build through defenders</span>
              </div>
              <button
                onClick={() => updateInstruction('playOutFromBack', !tactics.playOutFromBack)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  tactics.playOutFromBack ? 'bg-pl-cyan' : 'bg-background border border-border'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-black absolute top-1 transition-transform',
                    tactics.playOutFromBack ? 'right-1' : 'left-1 bg-gray-500'
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'TRANSITION' && (
          <div className="space-y-5">
            {/* Counter-Press */}
            <div className="flex items-center justify-between p-3.5 bg-background/50 rounded-xl border border-border">
              <div>
                <span className="text-xs font-bold text-white block">Upon Losing Ball</span>
                <span className="text-[11px] text-gray-400">
                  {tactics.counterPress ? 'Counter-Press immediately' : 'Regroup into defensive block'}
                </span>
              </div>
              <button
                onClick={() => updateInstruction('counterPress', !tactics.counterPress)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                  tactics.counterPress ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-surface text-gray-400 border-border'
                )}
              >
                {tactics.counterPress ? 'COUNTER-PRESS' : 'REGROUP'}
              </button>
            </div>

            {/* Counter-Attack */}
            <div className="flex items-center justify-between p-3.5 bg-background/50 rounded-xl border border-border">
              <div>
                <span className="text-xs font-bold text-white block">Upon Winning Ball</span>
                <span className="text-[11px] text-gray-400">
                  {tactics.counterAttack ? 'Direct counter-attack forward' : 'Hold shape & recycle possession'}
                </span>
              </div>
              <button
                onClick={() => updateInstruction('counterAttack', !tactics.counterAttack)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                  tactics.counterAttack ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-surface text-gray-400 border-border'
                )}
              >
                {tactics.counterAttack ? 'COUNTER-ATTACK' : 'HOLD SHAPE'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'DEFENDING' && (
          <div className="space-y-5">
            {/* Defensive Line */}
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-2">Defensive Line Height</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {(['DEEP', 'MID', 'HIGH'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateInstruction('defensiveLine', opt)}
                    className={cn(
                      'py-2 rounded-lg border transition-all',
                      tactics.defensiveLine === opt
                        ? 'bg-pl-cyan text-black border-pl-cyan font-black'
                        : 'bg-background/60 text-gray-400 border-border hover:bg-surfaceHover'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Pressing Intensity */}
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-2">Pressing Trigger</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {(['LOW', 'BALANCED', 'INTENSE'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateInstruction('pressingIntensity', opt)}
                    className={cn(
                      'py-2 rounded-lg border transition-all',
                      tactics.pressingIntensity === opt
                        ? 'bg-pl-cyan text-black border-pl-cyan font-black'
                        : 'bg-background/60 text-gray-400 border-border hover:bg-surfaceHover'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Offside Trap */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold text-white block">Offside Trap</span>
                <span className="text-[11px] text-gray-400">Synchronized step up when opponent passes forward</span>
              </div>
              <button
                onClick={() => updateInstruction('offsideTrap', !tactics.offsideTrap)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  tactics.offsideTrap ? 'bg-pl-cyan' : 'bg-background border border-border'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-black absolute top-1 transition-transform',
                    tactics.offsideTrap ? 'right-1' : 'left-1 bg-gray-500'
                  )}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
