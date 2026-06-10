import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { runSimulation, formatCurrency } from '../../utils/simulation';
import { SECTORS } from '../../constants/sectors';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

export default function SimulationView() {
  const { state, dispatch } = useApp();
  const { profile } = state;

  const projections = useMemo(() => runSimulation(profile), [profile]);

  const chartData = projections.map(p => ({
    year: `${p.year}年目`,
    総資産: Math.round(p.totalAssets),
    累積投資: Math.round(p.cumulativeInvestment),
    ...Object.fromEntries(SECTORS.map(s => [s.name, Math.round(p.sectorBreakdown[s.key])])),
  }));

  const target5 = projections.find(p => p.year === 5);
  const target10 = projections.find(p => p.year === 10);
  const target15 = projections.find(p => p.year === 15);
  const target20 = projections.find(p => p.year === 20);
  const targetFinal = projections[projections.length - 1];

  const scenarios = ['conservative', 'moderate', 'aggressive'] as const;
  const scenarioLabels = { conservative: '保守的', moderate: '中位', aggressive: '強気' };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">長期シミュレーション</h1>
        <div className="flex gap-2">
          {scenarios.map(s => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'UPDATE_SCENARIO', payload: s })}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${profile.scenario === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {scenarioLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* 目標マイルストーン */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[target5, target10, target15, target20, targetFinal].filter((p, i, arr) => p && arr.findIndex(q => q?.year === p.year) === i).map(p => p && (
          <div key={p.year} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">{p.year}年後の予想資産</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(p.totalAssets)}</p>
            <p className="text-green-400 text-sm font-medium mt-1">
              +{formatCurrency(p.totalAssets - p.cumulativeInvestment)} 利益
            </p>
            <p className="text-gray-500 text-xs mt-1">
              累積投資 {formatCurrency(p.cumulativeInvestment)} →
              <span className="text-green-400 ml-1">×{(p.totalAssets / p.cumulativeInvestment).toFixed(1)}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 資産推移グラフ */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-white font-bold mb-4">資産推移予測</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000000).toFixed(0)}千万`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(v: any) => formatCurrency(v)}
            />
            <Legend />
            <Area type="monotone" dataKey="累積投資" stroke="#6b7280" fill="url(#investGrad)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="総資産" stroke="#3b82f6" fill="url(#totalGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* セクター別積み上げグラフ */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-white font-bold mb-4">セクター別資産内訳</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000000).toFixed(0)}千万`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(v: any) => formatCurrency(v)}
            />
            <Legend />
            {SECTORS.map(s => (
              <Bar key={s.key} dataKey={s.name} stackId="a" fill={s.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 年次テーブル */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <h2 className="text-white font-bold p-4 border-b border-gray-800">年次シミュレーション詳細</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 px-4 py-2">年目</th>
                <th className="text-right text-gray-400 px-4 py-2">年間投資</th>
                <th className="text-right text-gray-400 px-4 py-2">累積投資</th>
                <th className="text-right text-gray-400 px-4 py-2">予想資産</th>
                <th className="text-right text-gray-400 px-4 py-2">倍率</th>
              </tr>
            </thead>
            <tbody>
              {projections.map(p => (
                <tr key={p.year} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="text-white px-4 py-2">{p.year}年目</td>
                  <td className="text-right text-gray-300 px-4 py-2">{formatCurrency(p.annualInvestment)}</td>
                  <td className="text-right text-gray-300 px-4 py-2">{formatCurrency(p.cumulativeInvestment)}</td>
                  <td className="text-right text-white font-bold px-4 py-2">{formatCurrency(p.totalAssets)}</td>
                  <td className="text-right text-green-400 px-4 py-2">{(p.totalAssets / p.cumulativeInvestment).toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
