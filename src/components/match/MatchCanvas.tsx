'use client';

import React, { useEffect, useRef } from 'react';
import { useMatchdayStore } from '@/stores/useMatchdayStore';
import { MatchScene } from '@/phaser/scenes/MatchScene';

export const MatchCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const sceneInstanceRef = useRef<MatchScene | null>(null);

  const { matchResult, isPlaying, speedMultiplier, currentTick, setTick } = useMatchdayStore();

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Phaser on client side
    const initPhaser = async () => {
      if (!containerRef.current || !matchResult) return;

      const Phaser = (await import('phaser')).default;

      if (!isMounted) return;

      // Clean up previous instance if exists
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 900,
        height: 580,
        backgroundColor: '#0E2812',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: {
          create(this: Phaser.Scene) {
            const matchScene = new MatchScene(this);
            sceneInstanceRef.current = matchScene;

            matchScene.init({
              keyframes: matchResult.keyframes,
              homeColor: 0x6cabdd, // Man City
              awayColor: 0xef0107, // Arsenal
              onTickUpdate: (tick) => {
                setTick(tick);
              },
            });

            matchScene.create();
            matchScene.setPlaying(isPlaying);
            matchScene.setSpeed(speedMultiplier);
          },
          update(this: Phaser.Scene, time: number, delta: number) {
            if (sceneInstanceRef.current) {
              sceneInstanceRef.current.update(time, delta);
            }
          },
        },
      };

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneInstanceRef.current = null;
      }
    };
  }, [matchResult?.seed]);

  // Sync isPlaying
  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setPlaying(isPlaying);
    }
  }, [isPlaying]);

  // Sync speedMultiplier
  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setSpeed(speedMultiplier);
    }
  }, [speedMultiplier]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden border border-border shadow-2xl relative">
      <div ref={containerRef} className="w-full max-w-[900px] aspect-[900/580]" />
    </div>
  );
};

