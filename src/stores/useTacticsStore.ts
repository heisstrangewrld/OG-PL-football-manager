import { create } from 'zustand';
import { PlayerInput, TeamTactics, PlayerRole, PlayerDuty } from '@/engine/types';
import { sampleManCity } from '@/engine/data/defaultSquads';

export interface TacticsState {
  tactics: TeamTactics;
  startingXI: PlayerInput[];
  substitutes: PlayerInput[];
  selectedPlayerId: string | null;

  // Actions
  setFormation: (formation: string) => void;
  updateInstruction: <K extends keyof TeamTactics>(key: K, value: TeamTactics[K]) => void;
  swapPlayers: (slotIndexA: number, slotIndexB: number) => void;
  substitutePlayer: (startingIndex: number, subIndex: number) => void;
  setPlayerRole: (playerId: string, role: PlayerRole) => void;
  setPlayerDuty: (playerId: string, duty: PlayerDuty) => void;
  selectPlayer: (playerId: string | null) => void;
}

export const useTacticsStore = create<TacticsState>((set) => ({
  tactics: sampleManCity.tactics,
  startingXI: sampleManCity.lineup,
  substitutes: [
    {
      ...sampleManCity.lineup[0],
      id: 'mci-sub1',
      name: 'Stefan Ortega',
      shirtNumber: 18,
      position: 'GK',
    },
    {
      ...sampleManCity.lineup[1],
      id: 'mci-sub2',
      name: 'Rico Lewis',
      shirtNumber: 82,
      position: 'RB',
    },
    {
      ...sampleManCity.lineup[2],
      id: 'mci-sub3',
      name: 'John Stones',
      shirtNumber: 5,
      position: 'CB',
    },
    {
      ...sampleManCity.lineup[6],
      id: 'mci-sub4',
      name: 'Mateo Kovacic',
      shirtNumber: 8,
      position: 'CM',
    },
    {
      ...sampleManCity.lineup[8],
      id: 'mci-sub5',
      name: 'Savinho',
      shirtNumber: 26,
      position: 'RW',
    },
    {
      ...sampleManCity.lineup[9],
      id: 'mci-sub6',
      name: 'Oscar Bobb',
      shirtNumber: 52,
      position: 'RW',
    },
    {
      ...sampleManCity.lineup[10],
      id: 'mci-sub7',
      name: 'Jack Grealish',
      shirtNumber: 10,
      position: 'LW',
    },
  ],
  selectedPlayerId: null,

  setFormation: (formation) =>
    set((state) => ({
      tactics: { ...state.tactics, formation },
    })),

  updateInstruction: (key, value) =>
    set((state) => ({
      tactics: { ...state.tactics, [key]: value },
    })),

  swapPlayers: (slotA, slotB) =>
    set((state) => {
      const nextXI = [...state.startingXI];
      const temp = nextXI[slotA];
      nextXI[slotA] = nextXI[slotB];
      nextXI[slotB] = temp;
      return { startingXI: nextXI };
    }),

  substitutePlayer: (startIndex, subIndex) =>
    set((state) => {
      const nextXI = [...state.startingXI];
      const nextSubs = [...state.substitutes];
      const startingPlayer = nextXI[startIndex];
      const subPlayer = nextSubs[subIndex];

      nextXI[startIndex] = subPlayer;
      nextSubs[subIndex] = startingPlayer;

      return { startingXI: nextXI, substitutes: nextSubs };
    }),

  setPlayerRole: (playerId, role) =>
    set((state) => ({
      startingXI: state.startingXI.map((p) => (p.id === playerId ? { ...p, role } : p)),
    })),

  setPlayerDuty: (playerId, duty) =>
    set((state) => ({
      startingXI: state.startingXI.map((p) => (p.id === playerId ? { ...p, duty } : p)),
    })),

  selectPlayer: (selectedPlayerId) => set(() => ({ selectedPlayerId })),
}));
