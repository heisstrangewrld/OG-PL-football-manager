'use client';

import React, { useEffect, useRef } from 'react';
import { useMatchdayStore } from '@/stores/useMatchdayStore';
import { MatchEventType } from '@/engine/types';
import { cn } from '@/lib/utils';
import { Goal, AlertTriangle, ShieldCheck, Footprints, Flame } from 'lucide-react';

function getEventBadge(type: MatchEventType) {
  switch (type) {
    case 'GOAL':
      return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', label: 'GOAL' };
    case 'SHOT':
      return { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40', label: 'SHOT' };
    case 'SAVED':
      return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', label: 'SAVE' };
    case 'YELLOW_CARD':
      return { bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', label: 'BOOKING' };
    case 'RED_CARD':
      return { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40', label: 'RED CARD' };
    case 'FOUL':
      return { bg: 'bg-gray-500/20 text-gray-400 border-gray-500/40', label: 'FOUL' };
    default:
      return { bg: 'bg-background/80 text-gray-300 border-border', label: type };
  }
}

export const CommentaryTicker: React.FC = () => {
  const { matchResult, currentTick } = useMatchdayStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!matchResult) return null;

  // Filter events up to current tick
  const activeEvents = matchResult.events.filter((e) => e.tick <= currentTick);

  // Auto-scroll to bottom as new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeEvents.length]);

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-xl flex flex-col h-[240px] sm:h-[320px]">
      <div className="flex items-center justify-between pb-3 border-b border-border/80 px-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-pl-cyan" />
          <span>Live Match Commentary</span>
        </h3>
        <span className="text-[10px] text-gray-500 font-semibold font-mono">
          {activeEvents.length} events logged
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
        {activeEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 font-medium">
            Waiting for kick-off...
          </div>
        ) : (
          activeEvents.map((evt) => {
            const badge = getEventBadge(evt.type);
            const isGoal = evt.type === 'GOAL';

            return (
              <div
                key={evt.id}
                className={cn(
                  'flex items-start gap-3 p-2.5 rounded-xl border transition-all text-xs',
                  isGoal
                    ? 'bg-pl-cyan/10 border-pl-cyan/40 shadow-sm'
                    : 'bg-background/50 border-border/60 hover:bg-background/80'
                )}
              >
                {/* Minute Badge */}
                <div className="font-mono font-bold text-[11px] text-pl-cyan bg-background px-2 py-0.5 rounded border border-border shrink-0">
                  {evt.minute}&apos;
                </div>

                {/* Event Type */}
                <span
                  className={cn(
                    'text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border shrink-0',
                    badge.bg
                  )}
                >
                  {badge.label}
                </span>

                {/* Event Description */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'leading-snug',
                      isGoal ? 'font-bold text-white' : 'font-medium text-gray-300'
                    )}
                  >
                    {evt.description}
                  </p>
                  {evt.data?.xG !== undefined && (
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                      xG: {evt.data.xG.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

