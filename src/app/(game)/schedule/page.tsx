'use client';

import React, { useEffect, useState } from 'react';
import { useSeasonStore } from '@/stores/useSeasonStore';
import { useCareerStore } from '@/stores/useCareerStore';
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Swords,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Form pill
// ---------------------------------------------------------------------------
const FormPill: React.FC<{ result: 'W' | 'D' | 'L' }> = ({ result }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black',
      result === 'W' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      result === 'D' && 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      result === 'L' && 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    )}
  >
    {result}
  </span>
);

// ---------------------------------------------------------------------------
// Zone chip in table
// ---------------------------------------------------------------------------
const ZoneLabel: React.FC<{ pos: number }> = ({ pos }) => {
  if (pos <= 4)
    return <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">UCL</span>;
  if (pos <= 6)
    return <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">UEL</span>;
  if (pos <= 7)
    return <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/30">UECL</span>;
  if (pos >= 18)
    return <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">REL</span>;
  return null;
};

// ---------------------------------------------------------------------------
// Score badge
// ---------------------------------------------------------------------------
const ScoreBadge: React.FC<{ hg: number | null; ag: number | null; played: boolean }> = ({
  hg,
  ag,
  played,
}) => {
  if (!played || hg === null || ag === null) {
    return <span className="text-gray-500 font-mono text-xs">vs</span>;
  }
  return (
    <span className="font-mono font-black text-white text-sm">
      {hg} – {ag}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SchedulePage() {
  const { initSeason, fixtures, standings, currentGameweek, simulateGameweek } =
    useSeasonStore();
  const { clubId } = useCareerStore();
  const [activeTab, setActiveTab] = useState<'fixtures' | 'table'>('table');
  const [viewGW, setViewGW] = useState(currentGameweek);

  // Init season on first render if no fixtures loaded
  useEffect(() => {
    if (fixtures.length === 0) {
      initSeason(clubId);
    }
  }, [fixtures.length, initSeason, clubId]);

  // Sync viewGW when currentGameweek advances
  useEffect(() => {
    setViewGW(currentGameweek);
  }, [currentGameweek]);

  const gwFixtures = fixtures.filter((f) => f.gameweek === viewGW);

  const handleSimGW = () => {
    simulateGameweek(viewGW, clubId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Season 2025/26</h1>
          <p className="text-xs text-gray-400 mt-1">
            Gameweek {currentGameweek} of 38 · Premier League
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-surface border border-border rounded-xl p-1 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('table')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeTab === 'table'
                ? 'bg-pl-cyan text-black'
                : 'text-gray-400 hover:text-white',
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeTab === 'fixtures'
                ? 'bg-pl-cyan text-black'
                : 'text-gray-400 hover:text-white',
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Fixtures
          </button>
        </div>
      </div>

      {/* ── LEAGUE TABLE ── */}
      {activeTab === 'table' && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
          {/* Table header */}
          <div className="px-4 py-3 border-b border-border/80 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-pl-cyan" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-300">
              Premier League Table
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-background/60 text-gray-400 uppercase tracking-wider text-[10px] font-bold border-b border-border">
                <tr>
                  <th className="py-2 px-3 text-left w-8">#</th>
                  <th className="py-2 px-3 text-left">Club</th>
                  <th className="py-2 px-3 text-center">P</th>
                  <th className="py-2 px-3 text-center hidden sm:table-cell">W</th>
                  <th className="py-2 px-3 text-center hidden sm:table-cell">D</th>
                  <th className="py-2 px-3 text-center hidden sm:table-cell">L</th>
                  <th className="py-2 px-3 text-center hidden md:table-cell">GF</th>
                  <th className="py-2 px-3 text-center hidden md:table-cell">GA</th>
                  <th className="py-2 px-3 text-center">GD</th>
                  <th className="py-2 px-3 text-center font-black text-white">Pts</th>
                  <th className="py-2 px-3 text-center hidden lg:table-cell">Form</th>
                  <th className="py-2 px-3 text-center hidden sm:table-cell">Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {standings.map((club, idx) => {
                  const pos = idx + 1;
                  const isUser = club.clubId === clubId;

                  // Zone left-border colour
                  const zoneBorder =
                    pos <= 4
                      ? 'border-l-2 border-l-blue-500'
                      : pos <= 6
                      ? 'border-l-2 border-l-amber-500'
                      : pos <= 7
                      ? 'border-l-2 border-l-orange-500'
                      : pos >= 18
                      ? 'border-l-2 border-l-rose-500'
                      : '';

                  return (
                    <tr
                      key={club.clubId}
                      className={cn(
                        'transition-colors hover:bg-surfaceHover/60',
                        isUser && 'bg-pl-cyan/5',
                        zoneBorder,
                      )}
                    >
                      <td className="py-2.5 px-3 font-bold text-gray-400 text-center">{pos}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {/* Club colour dot */}
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: club.primaryColor }}
                          />
                          <span
                            className={cn(
                              'font-bold truncate',
                              isUser ? 'text-pl-cyan' : 'text-white',
                            )}
                          >
                            {club.shortName}
                          </span>
                          {isUser && (
                            <span className="hidden sm:inline text-[9px] font-black text-black bg-pl-cyan px-1 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-300">{club.played}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300 hidden sm:table-cell">{club.won}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300 hidden sm:table-cell">{club.drawn}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300 hidden sm:table-cell">{club.lost}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300 hidden md:table-cell">{club.goalsFor}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300 hidden md:table-cell">{club.goalsAgainst}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300">
                        {club.goalDifference > 0 ? `+${club.goalDifference}` : club.goalDifference}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-white">{club.points}</td>
                      <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-0.5">
                          {club.form.map((r, i) => (
                            <FormPill key={i} result={r} />
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center hidden sm:table-cell">
                        <ZoneLabel pos={pos} />
                      </td>
                    </tr>
                  );
                })}
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-10 text-center text-gray-500 text-xs">
                      Season not started yet — click Continue to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Zone legend */}
          <div className="px-4 py-3 border-t border-border/60 flex flex-wrap gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Champions League</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Europa League</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Conference League</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Relegation Zone</span>
          </div>
        </div>
      )}

      {/* ── FIXTURES ── */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          {/* Gameweek selector */}
          <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-3 justify-between">
            <button
              onClick={() => setViewGW((g) => Math.max(1, g - 1))}
              disabled={viewGW <= 1}
              className="p-1.5 rounded-lg bg-background border border-border text-gray-400 hover:text-white hover:border-pl-cyan disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <p className="text-xs font-black text-white uppercase tracking-wider">
                Gameweek {viewGW}
              </p>
              <p className="text-[10px] text-gray-400">
                {gwFixtures[0]?.date ?? '—'}
              </p>
            </div>

            <button
              onClick={() => setViewGW((g) => Math.min(38, g + 1))}
              disabled={viewGW >= 38}
              className="p-1.5 rounded-lg bg-background border border-border text-gray-400 hover:text-white hover:border-pl-cyan disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Simulate GW button (only for past / current GWs with unplayed non-user matches) */}
          {viewGW <= currentGameweek && gwFixtures.some((f) => !f.played && f.homeId !== clubId && f.awayId !== clubId) && (
            <button
              onClick={handleSimGW}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface border border-pl-cyan/30 rounded-xl text-xs font-bold text-pl-cyan hover:bg-pl-cyan/10 transition-all"
            >
              <Swords className="w-4 h-4" />
              Simulate GW {viewGW} — AI Matches
            </button>
          )}

          {/* Fixture cards */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
            {gwFixtures.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-xs">
                No fixtures for Gameweek {viewGW}.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {gwFixtures.map((f) => {
                  const isUserMatch = f.homeId === clubId || f.awayId === clubId;
                  return (
                    <div
                      key={f.id}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 gap-2',
                        isUserMatch && 'bg-pl-cyan/5 border-l-2 border-l-pl-cyan',
                      )}
                    >
                      {/* Home team */}
                      <div className="flex-1 text-right">
                        <span
                          className={cn(
                            'text-xs font-bold',
                            f.homeId === clubId ? 'text-pl-cyan' : 'text-white',
                          )}
                        >
                          {f.homeShort}
                        </span>
                      </div>

                      {/* Score / vs */}
                      <div className="flex flex-col items-center px-3 min-w-[60px]">
                        <ScoreBadge hg={f.homeGoals} ag={f.awayGoals} played={f.played} />
                        {f.played && (
                          <span className="text-[9px] text-gray-500 mt-0.5">FT</span>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex-1">
                        <span
                          className={cn(
                            'text-xs font-bold',
                            f.awayId === clubId ? 'text-pl-cyan' : 'text-white',
                          )}
                        >
                          {f.awayShort}
                        </span>
                      </div>

                      {/* User badge */}
                      {isUserMatch && !f.played && (
                        <span className="text-[9px] font-black text-black bg-pl-cyan px-1.5 py-0.5 rounded shrink-0">
                          YOUR MATCH
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats blurb */}
          {gwFixtures.every((f) => f.played) && gwFixtures.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface border border-border rounded-xl px-4 py-2.5">
              <TrendingUp className="w-4 h-4 text-pl-cyan shrink-0" />
              <span>All GW {viewGW} results are in. Check the table for standings.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
