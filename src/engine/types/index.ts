// =============================================================================
// Engine Type Definitions
// =============================================================================

export type Vector2D = { x: number; y: number };
export type Vector3D = { x: number; y: number; z: number };

export const PITCH_LENGTH = 105.0; // X axis in meters
export const PITCH_WIDTH = 68.0;   // Y axis in meters
export const GOAL_WIDTH = 7.32;    // Y: 30.34 to 37.66
export const GOAL_HEIGHT = 2.44;   // Z: 0.0 to 2.44
export const GOAL_Y_MIN = (PITCH_WIDTH - GOAL_WIDTH) / 2; // 30.34
export const GOAL_Y_MAX = (PITCH_WIDTH + GOAL_WIDTH) / 2; // 37.66

export type PositionCode =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'DM'
  | 'CM'
  | 'LM'
  | 'RM'
  | 'CAM'
  | 'LW'
  | 'RW'
  | 'ST';

export type PlayerRole =
  | 'GOALKEEPER'
  | 'SWEEPER_KEEPER'
  | 'CENTER_BACK'
  | 'BALL_PLAYING_DEFENDER'
  | 'FULL_BACK'
  | 'WING_BACK'
  | 'DEFENSIVE_MIDFIELDER'
  | 'BALL_WINNING_MIDFIELDER'
  | 'CENTRAL_MIDFIELDER'
  | 'BOX_TO_BOX'
  | 'DEEP_LYING_PLAYMAKER'
  | 'ATTACKING_MIDFIELDER'
  | 'WINGER'
  | 'INSIDE_FORWARD'
  | 'STRIKER'
  | 'TARGET_MAN'
  | 'POACHER';

export type PlayerDuty = 'DEFEND' | 'SUPPORT' | 'ATTACK';

export interface PlayerAttributes {
  // Physical (1-99)
  pace: number;
  acceleration: number;
  stamina: number;
  strength: number;
  agility: number;
  jumpingReach: number;
  // Technical (1-99)
  finishing: number;
  passing: number;
  dribbling: number;
  tackling: number;
  heading: number;
  firstTouch: number;
  crossing: number;
  longShots: number;
  marking: number;
  // Mental (1-99)
  composure: number;
  vision: number;
  positioning: number;
  decisions: number;
  workRate: number;
  aggression: number;
  bravery: number;
  leadership: number;
  // Goalkeeping (1-99)
  reflexes: number;
  handling: number;
  gkPositioning: number;
  shotStopping: number;
  distribution: number;
  // Hidden / Traits
  consistency: number;     // 1-20
  injuryProneness: number; // 1-20
}

export type PlayerState =
  | 'IDLE'
  | 'PRESSING'
  | 'TACKLING'
  | 'DRIBBLING'
  | 'PASSING'
  | 'SHOOTING'
  | 'INTERCEPTING'
  | 'RECOVERING'
  | 'GOALKEEPING';

export interface PlayerInput {
  id: string;
  name: string;
  shirtNumber: number;
  position: PositionCode;
  role: PlayerRole;
  duty: PlayerDuty;
  attributes: PlayerAttributes;
  condition?: number; // 0-100 (default 100)
  morale?: number;    // 0-100 (default 80)
}

export interface TeamTactics {
  formation: string; // e.g. "4-3-3", "4-2-3-1"
  width: 'NARROW' | 'BALANCED' | 'WIDE';
  tempo: 'LOW' | 'BALANCED' | 'HIGH';
  passingStyle: 'SHORT' | 'MIXED' | 'DIRECT';
  defensiveLine: 'DEEP' | 'MID' | 'HIGH';
  pressingIntensity: 'LOW' | 'BALANCED' | 'INTENSE';
  playOutFromBack: boolean;
  offsideTrap: boolean;
  counterPress: boolean;
  counterAttack: boolean;
}

export interface TeamInput {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  tactics: TeamTactics;
  lineup: PlayerInput[]; // 11 starting players
  substitutes: PlayerInput[];
}

export type MatchEventType =
  | 'KICK_OFF'
  | 'HALF_TIME'
  | 'FULL_TIME'
  | 'GOAL'
  | 'SHOT'
  | 'SAVED'
  | 'FOUL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'CORNER'
  | 'OFFSIDE'
  | 'SUBSTITUTION'
  | 'INJURY';

export interface MatchEvent {
  id: string;
  tick: number;
  minute: number;
  second: number;
  type: MatchEventType;
  teamId: string;
  primaryPlayerId: string;
  secondaryPlayerId?: string;
  position: Vector2D;
  description: string;
  data?: {
    xG?: number;
    shotOutcome?: 'GOAL' | 'SAVED' | 'BLOCKED' | 'OFF_TARGET' | 'POST';
    foulSeverity?: 'LOW' | 'MEDIUM' | 'HIGH';
    substitutedInId?: string;
  };
}

// 4Hz Keyframe payload (compressed for fast transmission and replay)
// Player frame: [playerIdNum, x, y, stateCode, staminaPct]
export type CompactPlayerKeyframe = [number, number, number, number, number];

export interface MatchKeyframe {
  tick: number;
  minute: number;
  second: number;
  ball: [number, number, number]; // x, y, z
  players: CompactPlayerKeyframe[];
}

export interface TeamMatchStats {
  possession: number; // percentage (0-100)
  shots: number;
  shotsOnTarget: number;
  xG: number;
  passesAttempted: number;
  passesCompleted: number;
  tacklesAttempted: number;
  tacklesWon: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  offsides: number;
}

export interface PlayerMatchStats {
  minutesPlayed: number;
  rating: number; // 1.0 to 10.0
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xG: number;
  passesAttempted: number;
  passesCompleted: number;
  tacklesAttempted: number;
  tacklesWon: number;
  interceptions: number;
  saves: number;
  fouls: number;
  yellowCard: boolean;
  redCard: boolean;
  distanceCoveredMeters: number;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  homeTeam: TeamInput;
  awayTeam: TeamInput;
  stats: {
    home: TeamMatchStats;
    away: TeamMatchStats;
  };
  playerStats: Record<string, PlayerMatchStats>;
  events: MatchEvent[];
  keyframes: MatchKeyframe[];
  durationMinutes: number;
  seed: number;
}

