import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/simulation';
import { SECTORS } from '../../constants/sectors';
import { exportJSON, exportCSV } from '../../utils/storage';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download, FileJson, FileText } from 'lucide-react';

export default function ReportView() {
  const { state } = useApp();
  const { records, profile } = state;

  const currentYear = new Date().getFullYear();
  const ytdRecords = records.filter(r => r.year === currentYear);

  const monthlyData = [...records].slice(-12).map(r => ({
    name: `${r.year}/${String(r.month).padStart(2, '0')}`,
    計画: r.plan.cash + r.plan.vpoint,
    実績: r.actual.cash + r.actual.vpoint,
  }));

  const sectorPerf = useMemo(() => SECTORS.map(s => {
    const planTotal = records.reduce((sum, r) => sum + (r.plan.sectors[s.key] || 0), 0);
    const actualTotal = records.reduce((sum, r) => sum + (r.actual.sectors[s.key] || 0), 0);
    return { name: s.name, color: s.color, plan: planTotal, actual: actualTotal, diff: actualTotal - planTotal };
  }), [records]);

  const ytdPlan = ytdRecords.reduce((s, r) => s + r.plan.cash + r.plan.vpoint, 0);
  const ytdActual = ytdRecords.reduce((s, r) => s + r.actual.cash + r.actual.vpoint, 0);
  const totalActual = records.reduce((s, r) => s + r.actual.cash + r.actual.vpoint, 0);
  const latestPortfolio = records[records.length - 1]?.actual.portfolioValue ?? 0;
  // 実際に投資した額のみ（メットライフ・アメックスはまだ未投資のため除外）
  const totalInvested = totalActual;
  const unrealizedGain = latestPortfolio - totalInvested;

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">レポート</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(records)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
          >
            <FileText size={14} />
            CSV
          </button>
          <button
            onClick={() => exportJSON(state)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
          >
            <FileJson size={14} />
            JSON
          </button>
        </div>
      </div>

      {/* 年間サマリー */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-white font-bold mb-4">{currentYear}年 年間サマリー</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryItem label="YTD投資計画" value={formatCurrency(ytdPlan)} />
          <SummaryItem label="YTD投資実績" value={formatCurrency(ytdActual)}
            diff={ytdActual - ytdPlan} />
          <SummaryItem label="記録月数" value={`${ytdRecords.length}ヶ月`} />
          <SummaryItem label="達成率" value={ytdPlan > 0 ? `${((ytdActual / ytdPlan) * 100).toFixed(1)}%` : '-'} />
        </div>
      </div>

      {/* 累積サマリー */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-white font-bold mb-4">累積サマリー</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryItem label="総投資額（初期含む）" value={formatCurrency(totalInvested)} />
          <SummaryItem label="ポートフォリオ評価額" value={formatCurrency(latestPortfolio)} />
          <SummaryItem label="含み損益" value={`${unrealizedGain >= 0 ? '+' : ''}${formatCurrency(unrealizedGain)}`}
            diff={unrealizedGain} />
          <SummaryItem label="リターン率" value={totalInvested > 0 ? `${((unrealizedGain / totalInvested) * 100).toFixed(1)}%` : '-'} />
        </div>
      </div>

      {/* 計画vs実績グラフ */}
      {monthlyData.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h2 className="text-white font-bold mb-4">月次 計画 vs 実績（直近12ヶ月）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v: any) => formatCurrency(v)}
              />
              <Legend />
              <Bar dataKey="計画" fill="#4b5563" radius={[3, 3, 0, 0]} />
              <Bar dataKey="実績" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* セクター別パフォーマンス */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-white font-bold mb-4">累積セクター別 計画 vs 実績</h2>
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-4">データなし</p>
        ) : (
          <div className="space-y-3">
            {sectorPerf.map(s => (
              <div key={s.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-300 text-sm">{s.name}</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-gray-500">計画: {formatCurrency(s.plan)}</span>
                    <span className="text-white">実績: {formatCurrency(s.actual)}</span>
                    <span className={s.diff >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {s.diff >= 0 ? '+' : ''}{formatCurrency(s.diff)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: s.plan > 0 ? `${Math.min(100, (s.actual / s.plan) * 100)}%` : '0%',
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, diff }: { label: string; value: string; diff?: number }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold">{value}</p>
      {diff !== undefined && (
        <p className={`text-xs ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
        </p>
      )}
    </div>
  );
}
