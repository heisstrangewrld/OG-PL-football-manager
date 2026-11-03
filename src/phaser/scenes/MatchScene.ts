// =============================================================================
// Phaser 3 Match Scene
// 2D Classic Disc/Token Pitch Visualizer with 60FPS Lerp Interpolation
// =============================================================================

import type Phaser from 'phaser';
import { MatchKeyframe, MatchEvent } from '@/engine/types';

export interface MatchSceneData {
  keyframes: MatchKeyframe[];
  homeColor: number;
  awayColor: number;
  onTickUpdate?: (tick: number, minute: number, second: number) => void;
  onEventTriggered?: (event: MatchEvent) => void;
}

export class MatchScene {
  private scene!: Phaser.Scene;
  private keyframes: MatchKeyframe[] = [];
  private currentTickIndex = 0;
  private tickProgress = 0.0; // [0..1] progress between current and next keyframe
  private isPlaying = true;
  private speedMultiplier = 2; // 1x, 2x, 4x

  private homeColor = 0x6cabdd; // Man City sky blue
  private awayColor = 0xef0107; // Arsenal red

  private pitchGraphics!: Phaser.GameObjects.Graphics;
  private playerSprites: Array<{
    container: Phaser.GameObjects.Container;
    disc: Phaser.GameObjects.Arc;
    label: Phaser.GameObjects.Text;
    pointer: Phaser.GameObjects.Triangle;
  }> = [];

  private ballContainer!: Phaser.GameObjects.Container;
  private ballDisc!: Phaser.GameObjects.Arc;
  private ballShadow!: Phaser.GameObjects.Arc;

  private pitchScaleX = 1.0;
  private pitchScaleY = 1.0;
  private pitchOffsetX = 40;
  private pitchOffsetY = 40;
  private pitchWidth = 840;
  private pitchHeight = 544;

  private onTickUpdate?: (tick: number, minute: number, second: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(data: MatchSceneData): void {
    this.keyframes = data.keyframes || [];
    this.homeColor = data.homeColor ?? 0x6cabdd;
    this.awayColor = data.awayColor ?? 0xef0107;
    this.onTickUpdate = data.onTickUpdate;
  }

  public create(): void {
    const { width, height } = this.scene.scale;

    // Pitch layout calculations (Aspect ratio ~105/68 = 1.54)
    this.pitchOffsetX = 35;
    this.pitchOffsetY = 30;
    this.pitchWidth = width - this.pitchOffsetX * 2;
    this.pitchHeight = height - this.pitchOffsetY * 2;

    this.pitchScaleX = this.pitchWidth / 105.0;
    this.pitchScaleY = this.pitchHeight / 68.0;

    // 1. Draw 2D Pitch Graphics
    this.pitchGraphics = this.scene.add.graphics();
    this.drawPitch();

    // 2. Initialize Ball
    this.ballShadow = this.scene.add.circle(0, 0, 5, 0x000000, 0.4);
    this.ballDisc = this.scene.add.circle(0, 0, 5, 0xffffff);
    this.ballDisc.setStrokeStyle(1.5, 0x111111);
    this.ballContainer = this.scene.add.container(
      this.toScreenX(52.5),
      this.toScreenY(34.0),
      [this.ballShadow, this.ballDisc]
    );

    // 3. Initialize 22 Player Disc Tokens
    this.playerSprites = [];
    for (let i = 0; i < 22; i++) {
      const isHome = i < 11;
      const color = isHome ? this.homeColor : this.awayColor;
      const shirtNumber = isHome ? (i === 0 ? 1 : i + 1) : i === 11 ? 1 : i - 10;

      const disc = this.scene.add.circle(0, 0, 11, color);
      disc.setStrokeStyle(2, 0xffffff, 0.95);

      const label = this.scene.add.text(0, 0, `${shirtNumber}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
      });
      label.setOrigin(0.5, 0.5);

      const pointer = this.scene.add.triangle(0, -14, 0, 0, 6, 8, -6, 8, 0xffffff, 0.85);

      const container = this.scene.add.container(0, 0, [disc, pointer, label]);
      this.playerSprites.push({ container, disc, label, pointer });
    }

    // Set initial positions from first keyframe
    if (this.keyframes.length > 0) {
      this.applyKeyframe(this.keyframes[0], this.keyframes[0], 0);
    }
  }

  public update(time: number, delta: number): void {
    if (!this.isPlaying || this.keyframes.length === 0) return;

    // Delta in seconds
    const dt = delta / 1000.0;
    // Base playback: 4 ticks per second * speedMultiplier
    const ticksPerSecond = 4.0 * this.speedMultiplier;
    this.tickProgress += dt * ticksPerSecond;

    while (this.tickProgress >= 1.0) {
      this.tickProgress -= 1.0;
      this.currentTickIndex++;

      if (this.currentTickIndex >= this.keyframes.length - 1) {
        this.currentTickIndex = this.keyframes.length - 1;
        this.isPlaying = false;
        break;
      }
    }

    const currentFrame = this.keyframes[this.currentTickIndex];
    const nextFrame = this.keyframes[Math.min(this.keyframes.length - 1, this.currentTickIndex + 1)];

    this.applyKeyframe(currentFrame, nextFrame, this.tickProgress);

    if (this.onTickUpdate && currentFrame) {
      this.onTickUpdate(currentFrame.tick, currentFrame.minute, currentFrame.second);
    }
  }

  private applyKeyframe(curr: MatchKeyframe, next: MatchKeyframe, t: number): void {
    // 1. Lerp Ball Position
    const bx = curr.ball[0] + (next.ball[0] - curr.ball[0]) * t;
    const by = curr.ball[1] + (next.ball[1] - curr.ball[1]) * t;
    const bz = curr.ball[2] + (next.ball[2] - curr.ball[2]) * t;

    const screenBX = this.toScreenX(bx);
    const screenBY = this.toScreenY(by);

    this.ballContainer.setPosition(screenBX, screenBY);
    // Ball height elevates disc and scales shadow
    this.ballDisc.setPosition(0, -bz * 8);
    this.ballDisc.setScale(1.0 + bz * 0.15);
    this.ballShadow.setScale(Math.max(0.4, 1.0 - bz * 0.15));

    // 2. Lerp 22 Player Positions
    for (let i = 0; i < Math.min(22, curr.players.length); i++) {
      const pCurr = curr.players[i];
      const pNext = next.players[i] || pCurr;
      const sprite = this.playerSprites[i];
      if (!sprite) continue;

      const px = pCurr[1] + (pNext[1] - pCurr[1]) * t;
      const py = pCurr[2] + (pNext[2] - pCurr[2]) * t;

      const sx = this.toScreenX(px);
      const sy = this.toScreenY(py);
      sprite.container.setPosition(sx, sy);

      // Orientation pointer towards movement direction or ball
      const dx = pNext[1] - pCurr[1];
      const dy = pNext[2] - pCurr[2];
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        const angleRad = Math.atan2(dy * this.pitchScaleY, dx * this.pitchScaleX);
        sprite.pointer.setRotation(angleRad + Math.PI / 2);
        sprite.pointer.setVisible(true);
      } else {
        sprite.pointer.setVisible(false);
      }
    }
  }

  private drawPitch(): void {
    const g = this.pitchGraphics;
    g.clear();

    const ox = this.pitchOffsetX;
    const oy = this.pitchOffsetY;
    const pw = this.pitchWidth;
    const ph = this.pitchHeight;

    // Grass alternating stripes
    const stripeCount = 12;
    const stripeWidth = pw / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const color = i % 2 === 0 ? 0x1a4a1f : 0x163f1b;
      g.fillStyle(color, 1);
      g.fillRect(ox + i * stripeWidth, oy, stripeWidth, ph);
    }

    // Touchlines
    g.lineStyle(2, 0x4fa856, 0.7);
    g.strokeRect(ox, oy, pw, ph);

    // Halfway Line
    g.lineBetween(ox + pw / 2, oy, ox + pw / 2, oy + ph);

    // Center Circle (Radius 9.15m scaled)
    const centerRadius = 9.15 * this.pitchScaleY;
    g.strokeCircle(ox + pw / 2, oy + ph / 2, centerRadius);
    g.fillStyle(0x4fa856, 0.8);
    g.fillCircle(ox + pw / 2, oy + ph / 2, 3);

    // Penalty Areas (16.5m deep, 40.32m wide)
    const boxDepth = 16.5 * this.pitchScaleX;
    const boxWidth = 40.32 * this.pitchScaleY;
    const boxY = oy + (ph - boxWidth) / 2;

    // Left Penalty Box
    g.strokeRect(ox, boxY, boxDepth, boxWidth);
    // Right Penalty Box
    g.strokeRect(ox + pw - boxDepth, boxY, boxDepth, boxWidth);

    // Goal Areas (5.5m deep, 18.32m wide)
    const goalDepth = 5.5 * this.pitchScaleX;
    const goalAreaWidth = 18.32 * this.pitchScaleY;
    const goalY = oy + (ph - goalAreaWidth) / 2;

    g.strokeRect(ox, goalY, goalDepth, goalAreaWidth);
    g.strokeRect(ox + pw - goalDepth, goalY, goalDepth, goalAreaWidth);

    // Goals (depth behind touchline)
    const netDepth = 2.44 * this.pitchScaleX;
    const netWidth = 7.32 * this.pitchScaleY;
    const netY = oy + (ph - netWidth) / 2;

    g.lineStyle(2, 0xffffff, 0.9);
    g.strokeRect(ox - netDepth, netY, netDepth, netWidth);
    g.strokeRect(ox + pw, netY, netDepth, netWidth);
  }

  private toScreenX(pitchX: number): number {
    return this.pitchOffsetX + pitchX * this.pitchScaleX;
  }

  private toScreenY(pitchY: number): number {
    return this.pitchOffsetY + pitchY * this.pitchScaleY;
  }

  public setPlaying(playing: boolean): void {
    this.isPlaying = playing;
  }

  public setSpeed(speed: number): void {
    this.speedMultiplier = speed;
  }

  public seekTick(tick: number): void {
    const idx = this.keyframes.findIndex((k) => k.tick >= tick);
    if (idx !== -1) {
      this.currentTickIndex = idx;
      this.tickProgress = 0.0;
    }
  }
}
