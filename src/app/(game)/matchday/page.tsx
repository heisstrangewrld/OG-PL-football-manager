'use client';

import React, { useEffect, useState } from 'react';
import { useMatchdayStore } from '@/stores/useMatchdayStore';
import { MatchCanvas } from '@/components/match/MatchCanvas';
import { MatchHUD } from '@/components/match/MatchHUD';
import { CommentaryTicker } from '@/components/match/CommentaryTicker';
import { InGameTacticsModal } from '@/components/match/InGameTacticsModal';
import { Activity, BarChart3, ShieldCheck } from 'lucide-react';

export default function MatchdayPage() {
  const { matchResult, initMatch, currentTick } = useMatchdayStore();
  const [isTacticsOpen, setIsTacticsOpen] = useState(false);

  useEffect(() => {
    if (!matchResult) {
      initMatch();
    }
  }, [matchResult, initMatch]);

  if (!matchResult) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-pl-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
          Generating Match Vectors...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Matchday HUD Header */}
      <MatchHUD onOpenTactics={() => setIsTacticsOpen(true)} />

      {/* 2D Phaser Match Pitch Visualizer */}
      <div className="w-full h-[580px]">
        <MatchCanvas />
      </div>

      {/* Match Stats & Commentary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Match Statistics Summary */}
        <div className="lg:col-span-5 bg-surface rounded-2xl border border-border p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-pl-cyan" />
              <span>Match Statistics</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">
              Live Analytical Feed
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Possession */}
            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span className="text-[#6CABDD]">{matchResult.stats.home.possession}%</span>
                <span className="text-gray-400 font-medium">Possession</span>
                <span className="text-rose-500">{matchResult.stats.away.possession}%</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden flex">
                <div
                  className="bg-[#6CABDD] h-full transition-all"
                  style={{ width: `${matchResult.stats.home.possession}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${matchResult.stats.away.possession}%` }}
                />
              </div>
            </div>

            {/* Shots */}
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-bold text-white">{matchResult.stats.home.shots}</span>
              <span className="text-gray-400">Total Shots</span>
              <span className="font-bold text-white">{matchResult.stats.away.shots}</span>
            </div>

            {/* Shots on Target */}
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-bold text-white">{matchResult.stats.home.shotsOnTarget}</span>
              <span className="text-gray-400">Shots on Target</span>
              <span className="font-bold text-white">{matchResult.stats.away.shotsOnTarget}</span>
            </div>

            {/* xG */}
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-bold text-pl-cyan font-mono">{matchResult.stats.home.xG.toFixed(2)}</span>
              <span className="text-gray-400">Expected Goals (xG)</span>
              <span className="font-bold text-pl-cyan font-mono">{matchResult.stats.away.xG.toFixed(2)}</span>
            </div>

            {/* Passes Completed */}
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-bold text-white">{matchResult.stats.home.passesCompleted}</span>
              <span className="text-gray-400">Passes Completed</span>
              <span className="font-bold text-white">{matchResult.stats.away.passesCompleted}</span>
            </div>

            {/* Tackles Won */}
            <div className="flex justify-between py-2">
              <span className="font-bold text-white">{matchResult.stats.home.tacklesWon}</span>
              <span className="text-gray-400">Tackles Won</span>
              <span className="font-bold text-white">{matchResult.stats.away.tacklesWon}</span>
            </div>
          </div>
        </div>

        {/* Live Commentary Feed */}
        <div className="lg:col-span-7">
          <CommentaryTicker />
        </div>
      </div>

      {/* In-Game Tactics Modal */}
      <InGameTacticsModal
        isOpen={isTacticsOpen}
        onClose={() => setIsTacticsOpen(false)}
      />
    </div>
  );
}
