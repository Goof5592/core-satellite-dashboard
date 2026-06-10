import { AppState, UserProfile, MonthlyRecord } from '../types';
import { RETURN_ASSUMPTIONS } from '../constants/sectors';

const STORAGE_KEY = 'core_satellite_app';

const DEFAULT_PROFILE: UserProfile = {
  startDate: new Date().toISOString().slice(0, 10),
  targetYears: 15,
  initialInvestment: 2000000,
  initialInvestmentDate: new Date().toISOString().slice(0, 10),
  amexSplit: 300000,
  amexMonths: 6,
  defaultCash: 15000,
  defaultVpoint: 18000,
  allocation: {
    core: 70,
    semiconductor: 6,
    cleanEnergy: 6,
    healthcare: 6,
    defense: 6,
    autonomous: 6,
  },
  scenario: 'moderate',
  returnAssumptions: RETURN_ASSUMPTIONS.moderate,
  isSetupComplete: false,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: DEFAULT_PROFILE, records: [] };
    return JSON.parse(raw);
  } catch {
    return { profile: DEFAULT_PROFILE, records: [] };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `investment_data_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(records: MonthlyRecord[]): void {
  const headers = ['年', '月', '計画現金', '計画Vポイント', '計画合計', '実績現金', '実績Vポイント', '実績合計', 'ポートフォリオ評価額', 'メモ'];
  const rows = records.map(r => [
    r.year,
    r.month,
    r.plan.cash,
    r.plan.vpoint,
    r.plan.cash + r.plan.vpoint,
    r.actual.cash,
    r.actual.vpoint,
    r.actual.cash + r.actual.vpoint,
    r.actual.portfolioValue,
    `"${r.notes}"`,
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `investment_records_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('無効なJSONファイルです'));
      }
    };
    reader.readAsText(file);
  });
}
