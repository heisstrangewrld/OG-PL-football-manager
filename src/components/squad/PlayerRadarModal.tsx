'use client';

import React from 'react';
import { PlayerInput } from '@/engine/types';
import { X, ShieldAlert, Award } from 'lucide-react';

interface PlayerRadarModalProps {
  player: PlayerInput | null;
  onClose: () => void;
}

export const PlayerRadarModal: React.FC<PlayerRadarModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  const a = player.attributes;

  // Compute 6 high-level macro categories (0-100)
  const pace = Math.round((a.pace + a.acceleration) / 2);
  const shooting = Math.round((a.finishing * 0.6 + a.longShots * 0.4));
  const passing = Math.round((a.passing * 0.5 + a.vision * 0.3 + a.crossing * 0.2));
  const dribbling = Math.round((a.dribbling * 0.5 + a.agility * 0.3 + a.firstTouch * 0.2));
  const defending = Math.round((a.tackling * 0.5 + a.marking * 0.3 + a.positioning * 0.2));
  const physical = Math.round((a.strength * 0.4 + a.stamina * 0.4 + a.jumpingReach * 0.2));

  // Compute polygon points for SVG radar (center at 100,100, radius 70)
  const categories = [
    { label: 'PAC', val: pace, angle: -Math.PI / 2 },
    { label: 'SHO', val: shooting, angle: -Math.PI / 6 },
    { label: 'PAS', val: passing, angle: Math.PI / 6 },
    { label: 'DRI', val: dribbling, angle: Math.PI / 2 },
    { label: 'DEF', val: defending, angle: (5 * Math.PI) / 6 },
    { label: 'PHY', val: physical, angle: -(5 * Math.PI) / 6 },
  ];

  const polygonPoints = categories
    .map((c) => {
      const r = (c.val / 100) * 70;
      const x = 100 + r * Math.cos(c.angle);
      const y = 100 + r * Math.sin(c.angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surfaceHover/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pl-cyan/30 to-blue-500/20 border border-pl-cyan/50 flex items-center justify-center font-black text-xl text-pl-cyan">
              {player.shirtNumber}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{player.name}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className="font-bold text-pl-cyan">{player.position}</span>
                <span>•</span>
                <span>{player.role.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span className="text-yellow-400 font-semibold">{player.duty}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-surfaceHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Radar & Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Radar Polygon */}
            <div className="flex justify-center">
              <svg width="220" height="220" viewBox="0 0 200 200" className="overflow-visible">
                {/* Background Concentric Webs */}
                {[0.25, 0.5, 0.75, 1.0].map((level) => {
                  const pts = categories
                    .map((c) => {
                      const r = level * 70;
                      return `${100 + r * Math.cos(c.angle)},${100 + r * Math.sin(c.angle)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={level}
                      points={pts}
                      fill="none"
                      stroke="#2A384F"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radar Value Shape */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(0, 255, 135, 0.25)"
                  stroke="#00FF87"
                  strokeWidth="2.5"
                />

                {/* Category Labels */}
                {categories.map((c) => {
                  const labelR = 88;
                  const x = 100 + labelR * Math.cos(c.angle);
                  const y = 100 + labelR * Math.sin(c.angle);
                  return (
                    <text
                      key={c.label}
                      x={x}
                      y={y + 4}
                      fill="#CBD5E1"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {c.label} ({c.val})
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Quick Macro Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-background/50 rounded-xl border border-border">
                <span className="text-gray-400 font-semibold block">Pace</span>
                <span className="text-lg font-black text-white">{pace}</span>
              </div>
              <div className="p-3 bg-background/50 rounded-xl border border-border">
                <span className="text-gray-400 font-semibold block">Shooting</span>
                <span className="text-lg font-black text-white">{shooting}</span>
              </div>
              <div className="p-3 bg-background/50 rounded-xl border border-border">
                <span className="text-gray-400 font-semibold block">Passing</span>
                <span className="text-lg font-black text-white">{passing}</span>
              </div>
              <div className="p-3 bg-background/50 rounded-xl border border-border">
                <span className="text-gray-400 font-semibold block">Dribbling</span>
                <span className="text-lg font-black text-white">{dribbling}</span>
              </div>
              <div className="p-3 bg-background/50 rounded-xl border border-border">
                <span className="text-gray-400 font-semibold block">Defending</span>
                <span className="text-lg font-black text-white">{defending}</span>
              </div>
              <div className="p-3 bg-background/50 rounded-xl border border-border">
                <span className="text-gray-400 font-semibold block">Physical</span>
                <span className="text-lg font-black text-white">{physical}</span>
              </div>
            </div>
          </div>

          {/* Granular Attribute Breakdown */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
              Technical & Mental Attributes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Finishing</span>
                <span className="font-bold text-white">{a.finishing}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Passing</span>
                <span className="font-bold text-white">{a.passing}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Tackling</span>
                <span className="font-bold text-white">{a.tackling}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Dribbling</span>
                <span className="font-bold text-white">{a.dribbling}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Composure</span>
                <span className="font-bold text-white">{a.composure}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Vision</span>
                <span className="font-bold text-white">{a.vision}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Positioning</span>
                <span className="font-bold text-white">{a.positioning}</span>
              </div>
              <div className="flex justify-between p-2 bg-background/40 rounded border border-border/50">
                <span className="text-gray-400">Work Rate</span>
                <span className="font-bold text-white">{a.workRate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
