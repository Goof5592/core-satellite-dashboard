export type SectorKey = 'core' | 'semiconductor' | 'cleanEnergy' | 'healthcare' | 'defense' | 'autonomous';

export type ReturnScenario = 'conservative' | 'moderate' | 'aggressive';

export interface SectorAllocation {
  core: number;
  semiconductor: number;
  cleanEnergy: number;
  healthcare: number;
  defense: number;
  autonomous: number;
}

export interface MonthlyPlan {
  cash: number;
  vpoint: number;
  sectors: SectorAllocation;
}

export interface MonthlyActual {
  cash: number;
  vpoint: number;
  sectors: SectorAllocation;
  portfolioValue: number;
}

export interface MonthlyRecord {
  year: number;
  month: number;
  plan: MonthlyPlan;
  actual: MonthlyActual;
  notes: string;
}

export interface SectorInfo {
  key: SectorKey;
  name: string;
  fullName: string;
  color: string;
  returnMin: number;
  returnMax: number;
  volatility: number;
}

export interface ReturnAssumptions {
  core: number;
  semiconductor: number;
  cleanEnergy: number;
  healthcare: number;
  defense: number;
  autonomous: number;
}

export interface UserProfile {
  startDate: string;
  targetYears: number;
  initialInvestment: number;
  initialInvestmentDate: string;
  amexSplit: number;
  amexMonths: number;
  defaultCash: number;
  defaultVpoint: number;
  allocation: SectorAllocation;
  scenario: ReturnScenario;
  returnAssumptions: ReturnAssumptions;
  isSetupComplete: boolean;
}

export interface AppState {
  profile: UserProfile;
  records: MonthlyRecord[];
}
