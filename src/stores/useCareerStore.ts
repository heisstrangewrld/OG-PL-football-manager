import { create } from 'zustand';

export interface CareerState {
  saveId: string;
  managerName: string;
  clubId: string;
  clubName: string;
  currentDate: string; // ISO date 'YYYY-MM-DD'
  season: string;
  balance: number;
  transferBudget: number;
  wageBudgetWeekly: number;
  currentWageBillWeekly: number;
  boardConfidence: number; // 0-100
  fanConfidence: number;   // 0-100

  // Actions
  advanceDay: () => void;
  updateBudgets: (transfer: number, wage: number) => void;
  setClub: (id: string, name: string) => void;
}

export const useCareerStore = create<CareerState>((set) => ({
  saveId: 'default-save-1',
  managerName: 'Pep Guardiola',
  clubId: 'mci',
  clubName: 'Manchester City',
  currentDate: '2025-07-01',
  season: '2025/2026',
  balance: 145_000_000,
  transferBudget: 85_000_000,
  wageBudgetWeekly: 4_200_000,
  currentWageBillWeekly: 3_850_000,
  boardConfidence: 85,
  fanConfidence: 88,

  advanceDay: () =>
    set((state) => {
      const d = new Date(state.currentDate);
      d.setDate(d.getDate() + 1);
      return { currentDate: d.toISOString().split('T')[0] };
    }),

  updateBudgets: (transfer, wage) =>
    set(() => ({
      transferBudget: transfer,
      wageBudgetWeekly: wage,
    })),

  setClub: (id, name) =>
    set(() => ({
      clubId: id,
      clubName: name,
    })),
}));

