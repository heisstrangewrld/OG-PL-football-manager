// =============================================================================
// Premier League 2025/2026 — All 20 Clubs
// Squads use realistic overall ratings per position group.
// defaultStats(ovr) generates plausible attribute spreads from one number.
// Full deep squads (Man City & Arsenal) remain in this file; the other 18
// clubs use template squads built from their positional overalls so the
// season simulation engine has meaningful strength differentials.
// =============================================================================

import { TeamInput, PlayerAttributes, TeamTactics } from '../types/index.js';

// ---------------------------------------------------------------------------
// Attribute helpers
// ---------------------------------------------------------------------------

const gkStats = (ovr: number): PlayerAttributes => ({
  pace: ovr - 20,
  acceleration: ovr - 20,
  stamina: 70,
  strength: ovr - 10,
  agility: ovr - 5,
  jumpingReach: ovr,
  finishing: 30,
  passing: ovr - 10,
  dribbling: 30,
  tackling: 30,
  heading: ovr - 15,
  firstTouch: ovr - 10,
  crossing: 30,
  longShots: 30,
  marking: 30,
  composure: ovr,
  vision: ovr - 5,
  positioning: ovr,
  decisions: ovr,
  workRate: 60,
  aggression: 55,
  bravery: 80,
  leadership: ovr - 5,
  reflexes: ovr,
  handling: ovr,
  gkPositioning: ovr,
  shotStopping: ovr,
  distribution: ovr - 5,
  consistency: Math.min(20, Math.floor(ovr / 5)),
  injuryProneness: 5,
});

const defStats = (ovr: number): PlayerAttributes => ({
  pace: ovr - 5,
  acceleration: ovr - 5,
  stamina: Math.min(99, ovr + 3),
  strength: ovr + 3,
  agility: ovr - 5,
  jumpingReach: ovr + 5,
  finishing: ovr - 30,
  passing: ovr - 5,
  dribbling: ovr - 15,
  tackling: ovr + 5,
  heading: ovr + 5,
  firstTouch: ovr - 5,
  crossing: ovr - 20,
  longShots: ovr - 25,
  marking: ovr + 8,
  composure: ovr,
  vision: ovr - 10,
  positioning: ovr + 5,
  decisions: ovr,
  workRate: 82,
  aggression: 72,
  bravery: 80,
  leadership: ovr - 5,
  reflexes: 50,
  handling: 50,
  gkPositioning: 50,
  shotStopping: 50,
  distribution: 50,
  consistency: Math.min(20, Math.floor(ovr / 5)),
  injuryProneness: 6,
});

const midStats = (ovr: number): PlayerAttributes => ({
  pace: ovr - 5,
  acceleration: ovr - 5,
  stamina: Math.min(99, ovr + 5),
  strength: ovr - 8,
  agility: ovr,
  jumpingReach: ovr - 10,
  finishing: ovr - 10,
  passing: ovr + 5,
  dribbling: ovr,
  tackling: ovr - 5,
  heading: ovr - 10,
  firstTouch: ovr + 3,
  crossing: ovr - 5,
  longShots: ovr - 5,
  marking: ovr - 10,
  composure: ovr + 3,
  vision: ovr + 5,
  positioning: ovr,
  decisions: ovr + 3,
  workRate: 85,
  aggression: 60,
  bravery: 72,
  leadership: ovr - 8,
  reflexes: 50,
  handling: 50,
  gkPositioning: 50,
  shotStopping: 50,
  distribution: 50,
  consistency: Math.min(20, Math.floor(ovr / 5)),
  injuryProneness: 7,
});

const attStats = (ovr: number): PlayerAttributes => ({
  pace: ovr + 5,
  acceleration: ovr + 5,
  stamina: ovr - 3,
  strength: ovr - 8,
  agility: ovr + 5,
  jumpingReach: ovr - 5,
  finishing: ovr + 8,
  passing: ovr - 5,
  dribbling: ovr + 8,
  tackling: ovr - 25,
  heading: ovr - 5,
  firstTouch: ovr + 5,
  crossing: ovr - 10,
  longShots: ovr,
  marking: ovr - 25,
  composure: ovr + 5,
  vision: ovr,
  positioning: ovr + 8,
  decisions: ovr,
  workRate: 78,
  aggression: 65,
  bravery: 75,
  leadership: ovr - 10,
  reflexes: 50,
  handling: 50,
  gkPositioning: 50,
  shotStopping: 50,
  distribution: 50,
  consistency: Math.min(20, Math.floor(ovr / 5)),
  injuryProneness: 8,
});

// Clamp helpers
const clamp = (v: number) => Math.min(99, Math.max(1, Math.round(v)));
const ca = (stats: PlayerAttributes): PlayerAttributes =>
  (Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, clamp(v as number)])) as unknown) as PlayerAttributes;

// ---------------------------------------------------------------------------
// Template tactics presets
// ---------------------------------------------------------------------------

const highPressTactics = (formation: string = '4-3-3'): TeamTactics => ({
  formation,
  width: 'WIDE',
  tempo: 'HIGH',
  passingStyle: 'SHORT',
  defensiveLine: 'HIGH',
  pressingIntensity: 'INTENSE',
  playOutFromBack: true,
  offsideTrap: true,
  counterPress: true,
  counterAttack: false,
});

const balancedTactics = (formation: string = '4-2-3-1'): TeamTactics => ({
  formation,
  width: 'BALANCED',
  tempo: 'BALANCED',
  passingStyle: 'MIXED',
  defensiveLine: 'MID',
  pressingIntensity: 'BALANCED',
  playOutFromBack: true,
  offsideTrap: false,
  counterPress: false,
  counterAttack: true,
});

const counterTactics = (formation: string = '4-4-2'): TeamTactics => ({
  formation,
  width: 'NARROW',
  tempo: 'LOW',
  passingStyle: 'DIRECT',
  defensiveLine: 'DEEP',
  pressingIntensity: 'LOW',
  playOutFromBack: false,
  offsideTrap: false,
  counterPress: false,
  counterAttack: true,
});

// ---------------------------------------------------------------------------
// Club builder helper — creates a realistic 18-man squad from three overalls
// ---------------------------------------------------------------------------

function buildClub(
  id: string,
  name: string,
  shortName: string,
  primaryColor: string,
  secondaryColor: string,
  tactics: TeamTactics,
  defOvr: number,
  midOvr: number,
  attOvr: number,
  gkOvr: number = defOvr - 5,
): TeamInput {
  const prefix = id;

  const lineup = [
    // GK
    { id: `${prefix}-gk`, name: 'GK 1', shirtNumber: 1, position: 'GK' as const, role: 'SWEEPER_KEEPER' as const, duty: 'SUPPORT' as const, attributes: ca(gkStats(gkOvr)) },
    // Defenders
    { id: `${prefix}-rb`, name: 'RB 2', shirtNumber: 2, position: 'RB' as const, role: 'FULL_BACK' as const, duty: 'SUPPORT' as const, attributes: ca(defStats(defOvr)) },
    { id: `${prefix}-cb1`, name: 'CB 4', shirtNumber: 4, position: 'CB' as const, role: 'CENTER_BACK' as const, duty: 'DEFEND' as const, attributes: ca(defStats(defOvr + 2)) },
    { id: `${prefix}-cb2`, name: 'CB 5', shirtNumber: 5, position: 'CB' as const, role: 'CENTER_BACK' as const, duty: 'DEFEND' as const, attributes: ca(defStats(defOvr)) },
    { id: `${prefix}-lb`, name: 'LB 3', shirtNumber: 3, position: 'LB' as const, role: 'FULL_BACK' as const, duty: 'SUPPORT' as const, attributes: ca(defStats(defOvr)) },
    // Midfielders
    { id: `${prefix}-dm`, name: 'DM 6', shirtNumber: 6, position: 'DM' as const, role: 'DEFENSIVE_MIDFIELDER' as const, duty: 'DEFEND' as const, attributes: ca(midStats(midOvr - 2)) },
    { id: `${prefix}-cm1`, name: 'CM 8', shirtNumber: 8, position: 'CM' as const, role: 'CENTRAL_MIDFIELDER' as const, duty: 'SUPPORT' as const, attributes: ca(midStats(midOvr)) },
    { id: `${prefix}-cm2`, name: 'CM 10', shirtNumber: 10, position: 'CM' as const, role: 'BOX_TO_BOX' as const, duty: 'SUPPORT' as const, attributes: ca(midStats(midOvr + 2)) },
    // Attackers
    { id: `${prefix}-lw`, name: 'LW 11', shirtNumber: 11, position: 'LW' as const, role: 'WINGER' as const, duty: 'ATTACK' as const, attributes: ca(attStats(attOvr)) },
    { id: `${prefix}-st`, name: 'ST 9', shirtNumber: 9, position: 'ST' as const, role: 'STRIKER' as const, duty: 'ATTACK' as const, attributes: ca(attStats(attOvr + 3)) },
    { id: `${prefix}-rw`, name: 'RW 7', shirtNumber: 7, position: 'RW' as const, role: 'WINGER' as const, duty: 'ATTACK' as const, attributes: ca(attStats(attOvr)) },
  ];

  const substitutes = [
    { id: `${prefix}-gk2`, name: 'GK 13', shirtNumber: 13, position: 'GK' as const, role: 'GOALKEEPER' as const, duty: 'SUPPORT' as const, attributes: ca(gkStats(gkOvr - 8)) },
    { id: `${prefix}-cb3`, name: 'CB 15', shirtNumber: 15, position: 'CB' as const, role: 'CENTER_BACK' as const, duty: 'DEFEND' as const, attributes: ca(defStats(defOvr - 5)) },
    { id: `${prefix}-rb2`, name: 'RB 16', shirtNumber: 16, position: 'RB' as const, role: 'FULL_BACK' as const, duty: 'SUPPORT' as const, attributes: ca(defStats(defOvr - 5)) },
    { id: `${prefix}-dm2`, name: 'DM 14', shirtNumber: 14, position: 'DM' as const, role: 'BALL_WINNING_MIDFIELDER' as const, duty: 'DEFEND' as const, attributes: ca(midStats(midOvr - 5)) },
    { id: `${prefix}-cm3`, name: 'CM 17', shirtNumber: 17, position: 'CM' as const, role: 'CENTRAL_MIDFIELDER' as const, duty: 'SUPPORT' as const, attributes: ca(midStats(midOvr - 4)) },
    { id: `${prefix}-rw2`, name: 'RW 20', shirtNumber: 20, position: 'RW' as const, role: 'WINGER' as const, duty: 'ATTACK' as const, attributes: ca(attStats(attOvr - 5)) },
    { id: `${prefix}-st2`, name: 'ST 19', shirtNumber: 19, position: 'ST' as const, role: 'STRIKER' as const, duty: 'ATTACK' as const, attributes: ca(attStats(attOvr - 5)) },
  ];

  return { id, name, shortName, primaryColor, secondaryColor, tactics, lineup, substitutes };
}

// ---------------------------------------------------------------------------
// Man City (hand-crafted — user's default club)
// ---------------------------------------------------------------------------

const defaultStats = (ovr: number): PlayerAttributes => ({
  pace: ovr,
  acceleration: ovr,
  stamina: Math.min(99, ovr + 5),
  strength: ovr - 5,
  agility: ovr,
  jumpingReach: ovr - 10,
  finishing: ovr,
  passing: ovr,
  dribbling: ovr,
  tackling: ovr,
  heading: ovr - 5,
  firstTouch: ovr,
  crossing: ovr - 5,
  longShots: ovr,
  marking: ovr - 5,
  composure: ovr,
  vision: ovr,
  positioning: ovr,
  decisions: ovr,
  workRate: 80,
  aggression: 65,
  bravery: 75,
  leadership: 70,
  reflexes: 50,
  handling: 50,
  gkPositioning: 50,
  shotStopping: 50,
  distribution: 50,
  consistency: 15,
  injuryProneness: 8,
});

export const sampleManCity: TeamInput = {
  id: 'mci',
  name: 'Manchester City',
  shortName: 'Man City',
  primaryColor: '#6CABDD',
  secondaryColor: '#1C2C5B',
  tactics: highPressTactics('4-3-3'),
  lineup: [
    { id: 'mci-gk', name: 'Ederson', shirtNumber: 31, position: 'GK', role: 'SWEEPER_KEEPER', duty: 'SUPPORT', attributes: { ...defaultStats(85), reflexes: 88, handling: 86, gkPositioning: 87, shotStopping: 87, distribution: 85, pace: 60, finishing: 20, dribbling: 40, tackling: 15, marking: 15 } },
    { id: 'mci-rb', name: 'K. Walker', shirtNumber: 2, position: 'RB', role: 'FULL_BACK', duty: 'SUPPORT', attributes: { ...defaultStats(80), pace: 89, acceleration: 88, crossing: 75 } },
    { id: 'mci-cb1', name: 'M. Akanji', shirtNumber: 25, position: 'CB', role: 'CENTER_BACK', duty: 'DEFEND', attributes: { ...defaultStats(83), tackling: 87, marking: 85, heading: 83 } },
    { id: 'mci-cb2', name: 'R. Dias', shirtNumber: 3, position: 'CB', role: 'BALL_PLAYING_DEFENDER', duty: 'DEFEND', attributes: { ...defaultStats(85), tackling: 88, marking: 86, passing: 80, leadership: 85 } },
    { id: 'mci-lb', name: 'J. Gvardiol', shirtNumber: 24, position: 'LB', role: 'WING_BACK', duty: 'ATTACK', attributes: { ...defaultStats(82), pace: 84, crossing: 78, finishing: 72 } },
    { id: 'mci-dm', name: 'Rodri', shirtNumber: 16, position: 'DM', role: 'DEFENSIVE_MIDFIELDER', duty: 'DEFEND', attributes: { ...defaultStats(90), passing: 90, vision: 88, tackling: 88, decisions: 91 } },
    { id: 'mci-cm1', name: 'K. De Bruyne', shirtNumber: 17, position: 'CM', role: 'DEEP_LYING_PLAYMAKER', duty: 'SUPPORT', attributes: { ...defaultStats(91), passing: 94, vision: 95, longShots: 88, crossing: 85 } },
    { id: 'mci-cm2', name: 'B. Silva', shirtNumber: 20, position: 'CM', role: 'BOX_TO_BOX', duty: 'SUPPORT', attributes: { ...defaultStats(87), dribbling: 87, firstTouch: 88, positioning: 85 } },
    { id: 'mci-lw', name: 'J. Doku', shirtNumber: 11, position: 'LW', role: 'WINGER', duty: 'ATTACK', attributes: { ...defaultStats(83), pace: 96, acceleration: 97, dribbling: 88 } },
    { id: 'mci-st', name: 'E. Haaland', shirtNumber: 9, position: 'ST', role: 'TARGET_MAN', duty: 'ATTACK', attributes: { ...defaultStats(92), finishing: 97, pace: 89, positioning: 95, heading: 88, strength: 88 } },
    { id: 'mci-rw', name: 'P. Foden', shirtNumber: 47, position: 'RW', role: 'INSIDE_FORWARD', duty: 'ATTACK', attributes: { ...defaultStats(88), dribbling: 88, firstTouch: 90, finishing: 84, vision: 86 } },
  ],
  substitutes: [
    { id: 'mci-gk2', name: 'S. Carson', shirtNumber: 33, position: 'GK', role: 'GOALKEEPER', duty: 'SUPPORT', attributes: { ...defaultStats(68), reflexes: 70, handling: 68, gkPositioning: 70, shotStopping: 70 } },
    { id: 'mci-cb3', name: 'J. Gómez', shirtNumber: 21, position: 'CB', role: 'CENTER_BACK', duty: 'DEFEND', attributes: { ...defaultStats(79), tackling: 82, marking: 80 } },
    { id: 'mci-rb2', name: 'R. Lewis', shirtNumber: 82, position: 'RB', role: 'FULL_BACK', duty: 'SUPPORT', attributes: { ...defaultStats(76), pace: 82 } },
    { id: 'mci-dm2', name: 'M. Nunes', shirtNumber: 27, position: 'DM', role: 'BALL_WINNING_MIDFIELDER', duty: 'DEFEND', attributes: { ...defaultStats(79), tackling: 80, stamina: 86 } },
    { id: 'mci-cam', name: 'İ. Gündoğan', shirtNumber: 19, position: 'CM', role: 'ATTACKING_MIDFIELDER', duty: 'SUPPORT', attributes: { ...defaultStats(84), passing: 86, vision: 84 } },
    { id: 'mci-lw2', name: 'O. Bobb', shirtNumber: 52, position: 'LW', role: 'WINGER', duty: 'ATTACK', attributes: { ...defaultStats(77), pace: 85, dribbling: 80 } },
    { id: 'mci-st2', name: 'J. Doku B', shirtNumber: 18, position: 'ST', role: 'STRIKER', duty: 'ATTACK', attributes: { ...defaultStats(75), finishing: 76 } },
  ],
};

// ---------------------------------------------------------------------------
// Arsenal (hand-crafted)
// ---------------------------------------------------------------------------

export const sampleArsenal: TeamInput = {
  id: 'ars',
  name: 'Arsenal',
  shortName: 'Arsenal',
  primaryColor: '#EF0107',
  secondaryColor: '#063672',
  tactics: highPressTactics('4-3-3'),
  lineup: [
    { id: 'ars-gk', name: 'D. Raya', shirtNumber: 22, position: 'GK', role: 'SWEEPER_KEEPER', duty: 'SUPPORT', attributes: { ...defaultStats(84), reflexes: 86, handling: 84, gkPositioning: 85, shotStopping: 85 } },
    { id: 'ars-rb', name: 'B. White', shirtNumber: 4, position: 'RB', role: 'FULL_BACK', duty: 'SUPPORT', attributes: { ...defaultStats(82), tackling: 84, pace: 80 } },
    { id: 'ars-cb1', name: 'W. Saliba', shirtNumber: 12, position: 'CB', role: 'CENTER_BACK', duty: 'DEFEND', attributes: { ...defaultStats(87), tackling: 88, marking: 87, pace: 85, heading: 85 } },
    { id: 'ars-cb2', name: 'G. Magalhães', shirtNumber: 6, position: 'CB', role: 'BALL_PLAYING_DEFENDER', duty: 'DEFEND', attributes: { ...defaultStats(84), tackling: 85, marking: 84, passing: 79 } },
    { id: 'ars-lb', name: 'O. Zinchenko', shirtNumber: 35, position: 'LB', role: 'WING_BACK', duty: 'SUPPORT', attributes: { ...defaultStats(80), passing: 82, vision: 81 } },
    { id: 'ars-dm', name: 'T. Partey', shirtNumber: 5, position: 'DM', role: 'DEFENSIVE_MIDFIELDER', duty: 'DEFEND', attributes: { ...defaultStats(84), tackling: 86, strength: 84, stamina: 85 } },
    { id: 'ars-cm1', name: 'M. Ødegaard', shirtNumber: 8, position: 'CM', role: 'ATTACKING_MIDFIELDER', duty: 'SUPPORT', attributes: { ...defaultStats(89), passing: 90, vision: 90, dribbling: 86, longShots: 82 } },
    { id: 'ars-cm2', name: 'D. Rice', shirtNumber: 41, position: 'CM', role: 'BOX_TO_BOX', duty: 'SUPPORT', attributes: { ...defaultStats(87), tackling: 87, stamina: 89, passing: 83 } },
    { id: 'ars-lw', name: 'L. Trossard', shirtNumber: 19, position: 'LW', role: 'INSIDE_FORWARD', duty: 'ATTACK', attributes: { ...defaultStats(82), finishing: 82, dribbling: 82, pace: 81 } },
    { id: 'ars-st', name: 'K. Havertz', shirtNumber: 29, position: 'ST', role: 'TARGET_MAN', duty: 'ATTACK', attributes: { ...defaultStats(83), finishing: 83, heading: 82, strength: 79 } },
    { id: 'ars-rw', name: 'B. Saka', shirtNumber: 7, position: 'RW', role: 'INSIDE_FORWARD', duty: 'ATTACK', attributes: { ...defaultStats(88), pace: 87, dribbling: 88, finishing: 83, crossing: 82 } },
  ],
  substitutes: [
    { id: 'ars-gk2', name: 'K. Ramsdale', shirtNumber: 32, position: 'GK', role: 'GOALKEEPER', duty: 'SUPPORT', attributes: { ...defaultStats(79), reflexes: 81, handling: 79, gkPositioning: 80, shotStopping: 80 } },
    { id: 'ars-cb3', name: 'J. Timber', shirtNumber: 21, position: 'CB', role: 'CENTER_BACK', duty: 'DEFEND', attributes: { ...defaultStats(81), tackling: 83, pace: 80 } },
    { id: 'ars-lb2', name: 'K. Lewis-Potter', shirtNumber: 23, position: 'LB', role: 'FULL_BACK', duty: 'SUPPORT', attributes: { ...defaultStats(77), pace: 80 } },
    { id: 'ars-dm2', name: 'J. Elneny', shirtNumber: 35, position: 'DM', role: 'BALL_WINNING_MIDFIELDER', duty: 'DEFEND', attributes: { ...defaultStats(74), tackling: 77 } },
    { id: 'ars-cam', name: 'F. Vieira', shirtNumber: 11, position: 'CM', role: 'ATTACKING_MIDFIELDER', duty: 'SUPPORT', attributes: { ...defaultStats(78), passing: 80 } },
    { id: 'ars-lw2', name: 'G. Martinelli', shirtNumber: 11, position: 'LW', role: 'WINGER', duty: 'ATTACK', attributes: { ...defaultStats(83), pace: 88, dribbling: 83 } },
    { id: 'ars-st2', name: 'E. Nketiah', shirtNumber: 14, position: 'ST', role: 'STRIKER', duty: 'ATTACK', attributes: { ...defaultStats(76), finishing: 77, pace: 82 } },
  ],
};

// ---------------------------------------------------------------------------
// Remaining 18 PL clubs — built from template
// Overalls: [gkOvr, defOvr, midOvr, attOvr]
// Reflects realistic 2025/26 squad quality tiers
// ---------------------------------------------------------------------------

export const allPLClubs: TeamInput[] = [
  sampleManCity,
  sampleArsenal,

  // Big 6 / Champions League tier
  buildClub('liv', 'Liverpool', 'Liverpool', '#C8102E', '#00B2A9', highPressTactics('4-3-3'), 85, 86, 88, 86),
  buildClub('che', 'Chelsea', 'Chelsea', '#034694', '#DBA111', balancedTactics('4-2-3-1'), 81, 82, 84, 83),
  buildClub('mun', 'Manchester United', 'Man Utd', '#DA291C', '#FBE122', balancedTactics('4-2-3-1'), 80, 79, 81, 82),
  buildClub('tot', 'Tottenham Hotspur', 'Spurs', '#132257', '#FFFFFF', highPressTactics('4-3-3'), 79, 80, 83, 82),

  // Europa / Top-half tier
  buildClub('new', 'Newcastle United', 'Newcastle', '#241F20', '#41B6E6', highPressTactics('4-3-3'), 82, 81, 80, 80),
  buildClub('avl', 'Aston Villa', 'Aston Villa', '#95BFE5', '#670E36', highPressTactics('4-2-3-1'), 80, 81, 82, 81),
  buildClub('bha', 'Brighton & Hove Albion', 'Brighton', '#0057B8', '#FFCD00', highPressTactics('4-2-3-1'), 78, 80, 79, 78),
  buildClub('whu', 'West Ham United', 'West Ham', '#7A263A', '#1BB1E7', balancedTactics('4-2-3-1'), 77, 76, 78, 77),
  buildClub('ful', 'Fulham', 'Fulham', '#FFFFFF', '#000000', balancedTactics('4-4-2'), 76, 76, 76, 76),
  buildClub('wol', 'Wolverhampton Wanderers', 'Wolves', '#FDB913', '#231F20', counterTactics('3-4-3'), 75, 74, 75, 75),

  // Relegation battle tier
  buildClub('bou', 'AFC Bournemouth', 'Bournemouth', '#DA291C', '#000000', balancedTactics('4-4-2'), 73, 73, 73, 74),
  buildClub('cry', 'Crystal Palace', 'Crystal Palace', '#1B458F', '#C4122E', counterTactics('4-2-3-1'), 73, 72, 74, 74),
  buildClub('ips', 'Ipswich Town', 'Ipswich', '#3A64A3', '#FFFFFF', counterTactics('4-4-2'), 70, 69, 70, 70),
  buildClub('lei', 'Leicester City', 'Leicester', '#003090', '#FDBE11', balancedTactics('4-2-3-1'), 71, 70, 71, 72),
  buildClub('eve', 'Everton', 'Everton', '#003399', '#FFFFFF', counterTactics('4-4-2'), 72, 71, 71, 71),
  buildClub('not', 'Nottingham Forest', "Nott'm Forest", '#DD0000', '#FFFFFF', counterTactics('4-2-3-1'), 74, 73, 73, 73),
  buildClub('bre', 'Brentford', 'Brentford', '#E30613', '#FFFFFF', balancedTactics('4-3-3'), 74, 75, 74, 75),
  buildClub('sou', 'Southampton', 'Southampton', '#D71920', '#130C0E', counterTactics('4-4-2'), 68, 67, 68, 68),
];

// ---------------------------------------------------------------------------
// Club lookup helpers
// ---------------------------------------------------------------------------

export const PL_CLUBS_MAP: Record<string, TeamInput> = Object.fromEntries(
  allPLClubs.map((c) => [c.id, c]),
);

export const PL_CLUB_LIST = allPLClubs.map((c) => ({
  id: c.id,
  name: c.name,
  shortName: c.shortName,
  primaryColor: c.primaryColor,
  secondaryColor: c.secondaryColor,
}));
