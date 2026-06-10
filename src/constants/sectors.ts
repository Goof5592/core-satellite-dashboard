import { SectorInfo, ReturnAssumptions } from '../types';

export const SECTORS: SectorInfo[] = [
  {
    key: 'core',
    name: 'NASDAQ-100',
    fullName: 'SBI NASDAQ-100インデックス・ファンド',
    color: '#3b82f6',
    returnMin: 16,
    returnMax: 17,
    volatility: 22,
  },
  {
    key: 'semiconductor',
    name: 'AI・半導体',
    fullName: 'ニッセイSOX指数インデックスファンド',
    color: '#8b5cf6',
    returnMin: 18,
    returnMax: 22,
    volatility: 25,
  },
  {
    key: 'cleanEnergy',
    name: 'クリーンエネルギー',
    fullName: 'eMAXIS Neo クリーンテック',
    color: '#10b981',
    returnMin: 12,
    returnMax: 16,
    volatility: 28,
  },
  {
    key: 'healthcare',
    name: 'ヘルスケア',
    fullName: 'グローバル・ヘルスケア＆バイオ・ファンド（健次）',
    color: '#f59e0b',
    returnMin: 13,
    returnMax: 17,
    volatility: 24,
  },
  {
    key: 'defense',
    name: '防衛・宇宙',
    fullName: 'たわらノーロードフォーカス 防衛・航空宇宙',
    color: '#ef4444',
    returnMin: 14,
    returnMax: 18,
    volatility: 26,
  },
  {
    key: 'autonomous',
    name: '自動運転',
    fullName: 'eMAXIS Neo 自動運転',
    color: '#06b6d4',
    returnMin: 15,
    returnMax: 19,
    volatility: 27,
  },
];

export const SECTOR_MAP = Object.fromEntries(SECTORS.map(s => [s.key, s]));

export const RETURN_ASSUMPTIONS: Record<string, ReturnAssumptions> = {
  conservative: {
    core: 0.12,
    semiconductor: 0.15,
    cleanEnergy: 0.10,
    healthcare: 0.11,
    defense: 0.12,
    autonomous: 0.13,
  },
  moderate: {
    core: 0.165,
    semiconductor: 0.20,
    cleanEnergy: 0.14,
    healthcare: 0.15,
    defense: 0.16,
    autonomous: 0.17,
  },
  aggressive: {
    core: 0.19,
    semiconductor: 0.24,
    cleanEnergy: 0.18,
    healthcare: 0.19,
    defense: 0.20,
    autonomous: 0.21,
  },
};
