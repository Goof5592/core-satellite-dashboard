import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/simulation';
import { SECTORS } from '../../constants/sectors';
import { fetchInvestmentData, calcPortfolioValue, HOLDINGS } from '../../utils/priceSync';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { RefreshCw } from 'lucide-react';

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { state, dispatch } = useApp();
  const { profile, records } = state;

  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState<{ etfPrice: number; ndxPrice: number; updatedAt: Date; ifNasValue: number; sbiNasValue: number; total: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const sortedRecords = [...records].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  const last12 = sortedRecords.slice(-12);
  const latest = sortedRecords[sortedRecords.length - 1];

  const totalPortfolio = latest?.actual.portfolioValue ?? 0;
  const totalInvested = useMemo(() => {
    const fromRecords = records.reduce((s, r) => s + r.actual.cash + r.actual.vpoint, 0);
    // 初期投資（メットライフ）はまだ未投資のため除外。実際の投資額のみ集計
    return fromRecords;
  }, [records]);

  const unrealizedGain = totalPortfolio - totalInvested;
  const ytdRecords = records.filter(r => r.year === new Date().getFullYear());
  const ytdInvestment = ytdRecords.reduce((s, r) => s + r.actual.cash + r.actual.vpoint, 0);

  const chartData = last12.map(r => ({
    name: `${r.year}/${String(r.month).padStart(2, '0')}`,
    計画: r.plan.cash + r.plan.vpoint,
    実績: r.actual.cash + r.actual.vpoint,
    評価額: r.actual.portfolioValue,
  }));

  const latestSectorData = latest
    ? SECTORS.map(s => ({ name: s.name, value: latest.actual.sectors[s.key], color: s.color }))
    : SECTORS.map(s => ({ name: s.name, value: profile.allocation[s.key], color: s.color }));

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const data = await fetchInvestmentData();
      const result = calcPortfolioValue(data);

      setSyncInfo(result);

      // 最新月 & 当月のレコードのportfolioValueを自動更新
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const recordsToUpdate = sortedRecords.filter(r =>
        (r.year === latest?.year && r.month === latest?.month) ||
        (r.year === currentYear && r.month === currentMonth)
      );
      const uniqueRecords = recordsToUpdate.filter((r, i, arr) =>
        arr.findIndex(x => x.year === r.year && x.month === r.month) === i
      );
      uniqueRecords.forEach(rec => {
        dispatch({
          type: 'UPSERT_RECORD',
          payload: { ...rec, actual: { ...rec.actual, portfolioValue: result.total } },
        });
      });
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">

      {/* 時価同期バー */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-gray-400 text-xs mb-1">iFナス (2840) × {HOLDINGS.ifNas.shares}株 ＋ SBI NASDAQ-100 × {HOLDINGS.sbiNas.units.toLocaleString()}口</p>
            {syncInfo ? (
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-gray-300">
                  ETF <span className="text-white font-bold">{syncInfo.etfPrice.toLocaleString()}円</span>
                  <span className="text-gray-500 ml-1">→ {formatCurrency(syncInfo.ifNasValue)}</span>
                </span>
                <span className="text-gray-300">
                  SBI NASDAQ <span className="text-gray-500">（NDX連動推定）</span>
                  <span className="text-white font-bold ml-1">{formatCurrency(syncInfo.sbiNasValue)}</span>
                </span>
                <span className="text-blue-400 font-bold">合計 {formatCurrency(syncInfo.total)}</span>
                <span className="text-gray-600 text-xs">{syncInfo.updatedAt.toLocaleString('ja-JP')}</span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">「時価を同期」でinvestment-dashboardのdata.jsonから取得</p>
            )}
            {syncError && <p className="text-red-400 text-xs mt-1">{syncError}</p>}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm shrink-0"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? '取得中...' : '時価を同期'}
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="ポートフォリオ評価額"
          value={formatCurrency(totalPortfolio)}
          sub={unrealizedGain >= 0 ? `含み益 +${formatCurrency(unrealizedGain)}` : `含み損 ${formatCurrency(unrealizedGain)}`}
          positive={unrealizedGain >= 0}
          large
        />
        <StatCard
          label="累積投資額"
          value={formatCurrency(totalInvested)}
          sub="実投資額合計"
        />
        <StatCard
          label="今年の投資額（YTD）"
          value={formatCurrency(ytdInvestment)}
          sub={`${ytdRecords.length}ヶ月分`}
        />
        <StatCard
          label="含み損益"
          value={`${unrealizedGain >= 0 ? '+' : ''}${formatCurrency(unrealizedGain)}`}
          sub={totalInvested > 0 ? `${((unrealizedGain / totalInvested) * 100).toFixed(1)}%` : '-'}
          positive={unrealizedGain >= 0}
        />
      </div>

      {/* 直近月のサマリー */}
      {latest && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h2 className="text-gray-400 text-sm mb-3">直近月 ({latest.year}/{latest.month}月) 計画 vs 実績</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['cash', 'vpoint'] as const).map(k => {
              const planVal = latest.plan[k];
              const actVal = latest.actual[k];
              const diff = actVal - planVal;
              return (
                <div key={k}>
                  <p className="text-gray-500 text-xs">{k === 'cash' ? '現金' : 'Vポイント'}</p>
                  <p className="text-white font-bold">{formatCurrency(actVal)}</p>
                  <p className={`text-xs ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    計画比 {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                  </p>
                </div>
              );
            })}
            <div>
              <p className="text-gray-500 text-xs">合計</p>
              <p className="text-white font-bold">{formatCurrency(latest.actual.cash + latest.actual.vpoint)}</p>
              <p className={`text-xs ${latest.actual.cash + latest.actual.vpoint >= latest.plan.cash + latest.plan.vpoint ? 'text-green-400' : 'text-red-400'}`}>
                計画比 {latest.actual.cash + latest.actual.vpoint >= latest.plan.cash + latest.plan.vpoint ? '+' : ''}
                {formatCurrency((latest.actual.cash + latest.actual.vpoint) - (latest.plan.cash + latest.plan.vpoint))}
              </p>
            </div>
          </div>
          {latest.notes && (
            <div className="mt-3 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-xs">{latest.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* 計画vs実績グラフ */}
      {chartData.length > 0 ? (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h2 className="text-white font-bold mb-4">月次投資額（計画 vs 実績）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: any) => formatCurrency(v)}
              />
              <Legend />
              <Area type="monotone" dataKey="計画" stroke="#6b7280" fill="url(#planGrad)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="実績" stroke="#3b82f6" fill="url(#actualGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <p className="text-gray-400 mb-3">まだ実績データがありません</p>
          <button
            onClick={() => onNavigate('input')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            今月の実績を入力
          </button>
        </div>
      )}

      {/* セクター別配分 */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-white font-bold mb-4">セクター別配分{latest ? '（直近月実績）' : '（計画）'}</h2>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={latestSectorData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {latestSectorData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v: any) => formatCurrency(v)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-full lg:w-64 space-y-2">
            {latestSectorData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-gray-300 text-sm flex-1">{d.name}</span>
                <span className="text-white text-sm font-medium">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, positive, large }: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  large?: boolean;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`font-bold text-white ${large ? 'text-xl' : 'text-lg'}`}>{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${positive === undefined ? 'text-gray-500' : positive ? 'text-green-400' : 'text-red-400'}`}>{sub}</p>
      )}
    </div>
  );
}
