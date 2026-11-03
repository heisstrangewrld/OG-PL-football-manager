'use client';

import React from 'react';
import { useMatchdayStore } from '@/stores/useMatchdayStore';
import { Play, Pause, FastForward, SkipForward, Flame, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchHUDProps {
  onOpenTactics: () => void;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({ onOpenTactics }) => {
  const {
    matchResult,
    currentTick,
    isPlaying,
    speedMultiplier,
    togglePlay,
    setSpeed,
    jumpToNextEvent,
  } = useMatchdayStore();

  if (!matchResult) return null;

  // Calculate current minute and second
  const currentMinute = Math.min(90, Math.floor(currentTick / 240));
  const currentSecond = Math.floor((currentTick % 240) / 4);
  const timeFormatted = `${currentMinute.toString().padStart(2, '0')}:${currentSecond
    .toString()
    .padStart(2, '0')}`;

  // Filter events up to current tick to determine live score
  const eventsSoFar = matchResult.events.filter((e) => e.tick <= currentTick);
  const homeGoals = eventsSoFar.filter(
    (e) => e.type === 'GOAL' && e.teamId === matchResult.homeTeam.id
  ).length;
  const awayGoals = eventsSoFar.filter(
    (e) => e.type === 'GOAL' && e.teamId === matchResult.awayTeam.id
  ).length;

  return (
    <div className="bg-surface/95 backdrop-blur-md rounded-2xl border border-border p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
      {/* Live Scoreboard */}
      <div className="flex items-center gap-6">
        {/* Home */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6CABDD]/20 border border-[#6CABDD]/60 flex items-center justify-center font-black text-sm text-[#6CABDD] shadow-sm">
            MCI
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{matchResult.homeTeam.name}</h3>
            <span className="text-[10px] text-gray-400 font-semibold">Home</span>
          </div>
        </div>

        {/* Score & Clock Display */}
        <div className="flex flex-col items-center px-4 py-1 bg-background/80 rounded-xl border border-border">
          <div className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
            <span>{homeGoals}</span>
            <span className="text-gray-500 text-lg">-</span>
            <span>{awayGoals}</span>
          </div>
          <span className="text-[11px] font-bold text-pl-cyan font-mono">{timeFormatted}</span>
        </div>

        {/* Away */}
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-white text-sm text-right">{matchResult.awayTeam.name}</h3>
            <span className="text-[10px] text-gray-400 font-semibold block text-right">Away</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center font-black text-sm text-rose-500 shadow-sm">
            ARS
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95',
            isPlaying
              ? 'bg-background border border-border text-white hover:border-pl-cyan'
              : 'bg-pl-cyan text-black font-bold hover:brightness-110 shadow-pl-cyan/20'
          )}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
        </button>

        {/* Speed Multipliers */}
        <div className="flex items-center bg-background/80 p-1 rounded-xl border border-border text-xs font-bold">
          {([1, 2, 4] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all',
                speedMultiplier === spd
                  ? 'bg-pl-cyan text-black font-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Skip to Next Event */}
        <button
          onClick={jumpToNextEvent}
          className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-pl-cyan active:scale-95 transition-all shadow-sm"
          title="Jump to Next Highlight"
        >
          <SkipForward className="w-3.5 h-3.5 text-pl-cyan" />
          <span>Next Event</span>
        </button>

        {/* In-Game Tactics Modal Toggle */}
        <button
          onClick={onOpenTactics}
          className="flex items-center gap-2 px-4 py-2 bg-surfaceHover border border-pl-cyan/40 rounded-xl text-xs font-bold text-pl-cyan hover:bg-pl-cyan/15 active:scale-95 transition-all shadow-sm"
        >
          <Flame className="w-4 h-4" />
          <span>Tactics & Subs</span>
        </button>
      </div>
    </div>
  );
};
