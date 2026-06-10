const DATA_URL = 'https://goof5592.github.io/investment-dashboard/data.json';

export interface InvestmentData {
  updated: number;
  etf: { price: number };
  ndx: { price: number };
  usdjpy: { price: number };
}

// Holdings constants
export const HOLDINGS = {
  ifNas: { shares: 37, purchasePrice: 2647 },        // iFナス (2840) @2,647円 × 37株 = 97,939円
  sbiNas: { units: 11496, purchaseCost: 12000 },     // SBI NASDAQ-100
};

// NDX price when SBI NASDAQ was purchased (2026/06/09)
// Stored in localStorage so we capture it on first sync after purchase
const NDX_PURCHASE_KEY = 'sbi_nas_purchase_ndx';

export async function fetchInvestmentData(): Promise<InvestmentData> {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`データ取得失敗: ${res.status}`);
  return res.json();
}

export function calcPortfolioValue(data: InvestmentData): {
  ifNasValue: number;
  sbiNasValue: number;
  total: number;
  etfPrice: number;
  ndxPrice: number;
  updatedAt: Date;
} {
  const ifNasValue = HOLDINGS.ifNas.shares * data.etf.price;

  // SBI NASDAQ: 購入時NDXを記録して変動率で推定
  let purchaseNdx = Number(localStorage.getItem(NDX_PURCHASE_KEY) || 0);
  if (!purchaseNdx) {
    // 初回同期時にNDX購入時価格を記録
    purchaseNdx = data.ndx.price;
    localStorage.setItem(NDX_PURCHASE_KEY, String(purchaseNdx));
  }

  const ndxGrowthRate = data.ndx.price / purchaseNdx;
  const purchaseNavPerUnit = HOLDINGS.sbiNas.purchaseCost / HOLDINGS.sbiNas.units;
  const sbiNasValue = Math.round(HOLDINGS.sbiNas.units * purchaseNavPerUnit * ndxGrowthRate);

  return {
    ifNasValue,
    sbiNasValue,
    total: ifNasValue + sbiNasValue,
    etfPrice: data.etf.price,
    ndxPrice: data.ndx.price,
    updatedAt: new Date(data.updated * 1000),
  };
}
