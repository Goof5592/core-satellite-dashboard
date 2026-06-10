import { UserProfile, SectorKey, SectorAllocation } from '../types';

export interface YearlyProjection {
  year: number;
  totalAssets: number;
  sectorBreakdown: Record<SectorKey, number>;
  annualInvestment: number;
  cumulativeInvestment: number;
}

export function runSimulation(profile: UserProfile): YearlyProjection[] {
  const {
    initialInvestment,
    amexSplit,
    amexMonths,
    defaultCash,
    defaultVpoint,
    allocation,
    returnAssumptions,
    targetYears,
  } = profile;

  const monthlyBase = defaultCash + defaultVpoint;
  const monthlyAmex = amexSplit / amexMonths;

  const projections: YearlyProjection[] = [];
  const sectors = Object.keys(allocation) as SectorKey[];

  // セクター別に資産を追跡
  const sectorAssets: Record<SectorKey, number> = {} as any;
  for (const s of sectors) {
    sectorAssets[s] = initialInvestment * (allocation[s] / 100);
  }

  let cumulativeInvestment = initialInvestment;

  for (let y = 1; y <= Math.max(targetYears, 20); y++) {
    const annualMonths = 12;
    let annualInvestment = 0;

    // 月次複利計算
    for (let m = 1; m <= annualMonths; m++) {
      const totalMonths = (y - 1) * 12 + m;
      const monthlyAmexContrib = totalMonths <= amexMonths ? monthlyAmex : 0;
      const monthlyContrib = monthlyBase + monthlyAmexContrib;
      annualInvestment += monthlyContrib;

      for (const s of sectors) {
        const monthlyReturn = Math.pow(1 + returnAssumptions[s as keyof typeof returnAssumptions], 1 / 12) - 1;
        sectorAssets[s] = sectorAssets[s] * (1 + monthlyReturn) + monthlyContrib * (allocation[s] / 100);
      }
    }

    cumulativeInvestment += annualInvestment;

    const totalAssets = sectors.reduce((sum, s) => sum + sectorAssets[s], 0);

    projections.push({
      year: y,
      totalAssets,
      sectorBreakdown: { ...sectorAssets },
      annualInvestment,
      cumulativeInvestment,
    });
  }

  return projections;
}

export function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}億円`;
  }
  if (value >= 10000000) {
    return `${(value / 10000).toFixed(0)}万円`;
  }
  return `${Math.round(value).toLocaleString()}円`;
}

export function formatCurrencyShort(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}億`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万`;
  }
  return `${value.toLocaleString()}`;
}
